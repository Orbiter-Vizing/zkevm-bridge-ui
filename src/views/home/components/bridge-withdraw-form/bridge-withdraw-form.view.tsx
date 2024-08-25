import { BigNumber, ethers, utils as ethersUtils } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

import { addCustomToken, getChainCustomTokens, removeCustomToken } from "src/adapters/storage";
import { EnvString, EthereumErc20TokensConfig } from "src/assets/ethereum-erc20-tokens";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import { WITHDRAW_FEE, WITHDRAW_LIMIT, getEtherToken } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, Chain, FormData, Gas, Token } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { useDebounce } from "src/hooks/use-debounce";
import { Bridge__factory } from "src/types/contracts/bridge";
import { formatTokenAmount } from "src/utils/amounts";
import { calculateMaxTxFee } from "src/utils/fees";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import { BridgeGasFee } from "src/views/home/components/bridge-gas-fee/bridge-gas-fee.view";
import { useBridgeWithdrawFormStyles } from "src/views/home/components/bridge-withdraw-form/bridge-withdraw-form.styles";
import { TokenSelector } from "src/views/home/components/token-selector/token-selector.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { ChainList } from "src/views/shared/chain-list/chain-list.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { TokenBalance } from "src/views/shared/token-balance/token-balance.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface BridgeWithdrawFormProps {
  account: string;
  formData?: FormData;
  onResetForm: () => void;
  onSubmit: (formData: FormData) => void;
}

interface SelectedChains {
  from: Chain;
  to: Chain;
}

const DEBOUNCE_TIME_IN_MS = 750;

export const BridgeWithdrawForm: FC<BridgeWithdrawFormProps> = ({
  account,
  formData,
  onResetForm,
  onSubmit,
}) => {
  const classes = useBridgeWithdrawFormStyles();
  const callIfMounted = useCallIfMounted();
  const env = useEnvContext();
  const {
    computeWrappedTokenAddress,
    getErc20TokenBalance,
    tokens: defaultTokens,
  } = useTokensContext();
  const { connectedProvider } = useProvidersContext();
  const { estimateBridgeGas, estimateVizingBridgeGas } = useBridgeContext();
  const [l1EstimatedGas, setL1EstimatedGas] = useState<BigNumber>();
  const [l2EstimatedGas, setL2EstimatedGas] = useState<BigNumber>();
  const [balanceFrom, setBalanceFrom] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [balanceTo, setBalanceTo] = useState<AsyncTask<BigNumber, string>>({ status: "pending" });
  const [inputError, setInputError] = useState<string>();
  const [selectedChains, setSelectedChains] = useState<SelectedChains>();
  // const [toChain, setToChain] = useState<Chain>();
  const [fromChain, setFromChain] = useState<Chain>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [chains, setChains] = useState<Chain[]>();
  const [tokens, setTokens] = useState<Token[]>();
  const [isTokenListOpen, setIsTokenListOpen] = useState(false);
  const [valueUserWillGet, setValueUserWillGet] = useState("");
  const [showL2Gas, setShowL2Gas] = useState(false);
  // amount input state
  const defaultInputValue = amount && token ? formatTokenAmount(amount, token) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [debounceFormData, setDebounceFormData] = useState<FormData>();
  const debounceAmountValue = useDebounce(amount, DEBOUNCE_TIME_IN_MS);

  const onAmountInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    setAmount(amount);
    setInputError(error);
    // new logic
    // get estimated gas fee after input the number
    // setAmount(amount);
    // if (error) {
    //   setInputError(error);
    // } else {
    //   console.log("amount input change", amount);
    //   console.log("selectedChains", selectedChains);
    //   console.log("token", token);
    //   if (selectedChains && token && amount) {
    //     onSubmit({
    //       amount: amount,
    //       from: selectedChains.from,
    //       to: selectedChains.to,
    //       token: token,
    //     });
    //   }
    // }
    // console.log("amount change", amount);
  };

  const onChainButtonClick = (to: Chain) => {
    if (env) {
      if (fromChain) {
        console.log("withdraw set selected chains", fromChain, to);
        setSelectedChains({ from: fromChain, to });
        setChains(undefined);
        setAmount(undefined);
      }
    }
  };

  const onTokenDropdownClick = () => {
    setIsTokenListOpen(true);
  };

  const onSelectToken = (token: Token) => {
    setToken(token);
    setIsTokenListOpen(false);
    setAmount(undefined);
  };

  const onCloseTokenSelector = () => {
    setIsTokenListOpen(false);
  };

  const onAddToken = (token: Token) => {
    if (tokens) {
      // We don't want to store the balance of the user in the local storage
      const { address, chainId, decimals, logoURI, name, symbol, wrappedToken } = token;

      addCustomToken({ address, chainId, decimals, logoURI, name, symbol, wrappedToken });
      setTokens([token, ...tokens]);
    }
  };

  const onRemoveToken = (tokenToRemove: Token) => {
    if (tokens) {
      removeCustomToken(tokenToRemove);
      setTokens(
        tokens.filter(
          (token) =>
            !(token.address === tokenToRemove.address && token.chainId === tokenToRemove.chainId)
        )
      );
      if (selectedChains && tokenToRemove.address === token?.address) {
        setToken(getEtherToken(selectedChains.from));
      }
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChains && token && amount) {
      onSubmit({
        amount: amount,
        from: selectedChains.from,
        to: selectedChains.to,
        token: token,
      });
    }
  };

  const getTokenBalance = useCallback(
    (token: Token, chain: Chain): Promise<BigNumber> => {
      if (isTokenEther(token)) {
        return chain.provider.getBalance(account);
      } else {
        return getErc20TokenBalance({
          accountAddress: account,
          chain: chain,
          tokenAddress: selectTokenAddress(token, chain),
        });
      }
    },
    [account, getErc20TokenBalance]
  );

  const getSelectedChainTokens = (selectedChain: Chain, fromChain: Chain) => {
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    const envString = import.meta.env.MODE as EnvString;
    console.log("envString", envString);
    const currentEnvTokens = EthereumErc20TokensConfig[envString];
    console.log("currentEnvTokens", currentEnvTokens);
    const selectedChainTokensNameList: string[] = [];
    currentEnvTokens.forEach((token) => {
      if (token.chainId === selectedChain.chainId) {
        selectedChainTokensNameList.push(token.name);
      }
    });
    console.log("selectedChainTokensNameList", selectedChainTokensNameList);
    const result = currentEnvTokens.filter((token) => {
      return (
        selectedChainTokensNameList.indexOf(token.name) >= 0 && token.chainId === fromChain.chainId
      );
    });
    console.log("getSelectedChainTokens result", result);
    return result;
  };

  const handleWrapClick = () => {
    // computeWrappedTokenAddress params
    // { nativeChain, otherChain, token }
    if (!selectedChains) {
      return;
    }
    const nativeChain = selectedChains.from;
    const otherChain = selectedChains.to;
    const targetToken = {
      address: "0x35dA2cFD750F3D0ddD79BD8f6E4cA818C584a083",
      chainId: 11155111,
      decimals: 18,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      name: "Dai Stablecoin",
      symbol: "DAI",
    };
    console.log("nativeChain", nativeChain);
    console.log("otherChain", otherChain);
    console.log("targetToken", targetToken);
    computeWrappedTokenAddress({
      nativeChain,
      otherChain,
      token: targetToken,
    })
      .then((res) => {
        console.log("wrappedTokenAddress res", res);
      })
      .catch((error) => {
        console.log("wrappedTokenAddress error", error);
      });
    // console.log("wrappedTokenAddress", wrappedTokenAddress);
  };

  const getL1EstimatedGas = useCallback(() => {
    const ethereumChain = env?.chains.find((chain) => {
      return chain.key === "ethereum";
    });
    const vizingChain = env?.chains.find((chain) => {
      return chain.key === "vizing";
    });
    if (connectedProvider.status === "successful" && ethereumChain && vizingChain && token) {
      estimateBridgeGas({
        destinationAddress: connectedProvider.data.account,
        from: vizingChain,
        to: ethereumChain,
        token,
        tokenSpendPermission: { type: "none" },
      })
        .then((gas: Gas) => {
          const newFee = calculateMaxTxFee(gas);
          console.log("getL1EstimatedGas gas", gas);
          console.log("getL1EstimatedGas gas format", formatTokenAmount(gas.data.gasLimit, token));
          console.log("getL1EstimatedGas newFee format", formatTokenAmount(newFee, token));
          setL1EstimatedGas(newFee);
        })
        .catch((error) => {
          console.error("Get L1 estimated gas failed:", error);
        });
    }
  }, [connectedProvider, estimateBridgeGas, env, token]);

  const getL2EstimatedGas = useCallback(async () => {
    const bridgeChain = env?.chains.find((chain) => {
      return chain.key === "base";
    });
    const vizingChain = env?.chains.find((chain) => {
      return chain.key === "vizing";
    });
    // console.log("getL2EstimatedGas 111");
    console.log("env", env?.chains.length);
    console.log("bridgeChain", bridgeChain);
    console.log("vizingChain", vizingChain);
    if (!bridgeChain || !vizingChain) {
      return;
    }
    // old logic
    // const contract = Bridge__factory.connect(
    //   bridgeChain.bridgeContractAddress,
    //   bridgeChain.provider
    // );
    // const fakePostMessage = ethersUtils.solidityPack(
    //   ["uint8", "uint256", "uint24"],
    //   [4, account, 500000]
    // );
    // contract.functions
    //   .estimateGas(
    //     BigNumber.from("1"),
    //     bridgeChain.chainId,
    //     ethers.constants.AddressZero,
    //     fakePostMessage
    //   )
    //   .then((res) => {
    //     setL2EstimatedGas(res[0]);
    //   })
    //   .catch((error) => {
    //     console.error("Get L2 estimated gas failed:", error);
    //   });
    // Estimate L2 gas like L1
    const estimateAmount = BigNumber.from(1);
    console.log("Estimate L2 gas connectedProvider", connectedProvider);
    console.log("Estimate L2 gas bridgeChain", bridgeChain);
    console.log("Estimate L2 gas vizingChain", vizingChain);
    console.log("Estimate L2 gas token", token);
    console.log("Estimate L2 gas amount", estimateAmount);
    if (connectedProvider.status === "successful" && bridgeChain && vizingChain && token) {
      const contractAddress = vizingChain.omniContractAddress;
      const provider = vizingChain.provider;
      console.log("let contractAddress", contractAddress);
      console.log("L2 Bridge__factory contractAddress", contractAddress);
      const contract = Bridge__factory.connect(contractAddress, provider);

      const fakePostMessage = ethersUtils.solidityPack(
        ["uint8", "uint256", "uint24"],
        [4, account, 50000]
      );

      try {
        const vizingValue = await contract.functions.estimateGas(
          estimateAmount,
          bridgeChain.chainId,
          ethers.constants.AddressZero,
          fakePostMessage
        );
      } catch (error) {
        console.error("withdraw form contract.functions.estimateGas error", error);
      }

      const vizingValue = await contract.functions.estimateGas(
        estimateAmount,
        bridgeChain.chainId,
        ethers.constants.AddressZero,
        fakePostMessage
      );

      console.log("withdraw vizingValue", vizingValue[0]);
      console.log("withdraw user amount", estimateAmount);
      const totalValue = vizingValue[0].add(estimateAmount);
      estimateVizingBridgeGas({
        account,
        destinationAddress: connectedProvider.data.account,
        from: vizingChain,
        to: bridgeChain,
        token,
        totalValue,
        userInputValue: estimateAmount,
      })
        .then((gas: Gas) => {
          const newFee = calculateMaxTxFee(gas);
          console.log("withdraw getL2EstimatedGas gas", gas);
          console.log(
            "withdraw getL2EstimatedGas gas format",
            formatTokenAmount(gas.data.gasLimit, token)
          );
          console.log("withdraw getL2EstimatedGas newFee format", formatTokenAmount(newFee, token));
          setL2EstimatedGas(newFee);
        })
        .catch((error) => {
          console.error("Get L2 estimated gas failed:", error);
        });
    }
  }, [account, env, estimateVizingBridgeGas, token, connectedProvider]);

  // amount input logic out
  const processOnChangeCallback = (amount?: BigNumber) => {
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    if (amount) {
      const error = amount.gt(balance) ? "Insufficient balance" : undefined;

      return onAmountInputChange({ amount, error });
    } else {
      return onAmountInputChange({});
    }
  };
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("input changing...");
    if (!token) {
      return;
    }
    const value = event.target.value;
    const decimals = token.decimals;
    const regexToken = `^(?!0\\d|\\.)\\d*(?:\\.\\d{0,${decimals}})?$`;
    const INPUT_REGEX = new RegExp(regexToken);
    const isInputValid = INPUT_REGEX.test(value);
    const amount = value.length > 0 && isInputValid ? parseUnits(value, token.decimals) : undefined;

    if (isInputValid) {
      setInputValue(value);
      setValueUserWillGet("");
      processOnChangeCallback(amount);
    }
  };
  const onMax = () => {
    console.log("onMax l1EstimatedGas", l1EstimatedGas);
    console.log("onMax l2EstimatedGas", l2EstimatedGas);
    if (!token || !l2EstimatedGas || !l1EstimatedGas) {
      return;
    }
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    console.log("onMax balance", balance);
    const bigNumberWithdrawFee = ethers.utils.parseEther(WITHDRAW_FEE);
    // Max data should show: balance - contractFee -  gas
    // contractFee: DEPOSIT_FEE
    // gas: L1 or L2
    // L1 gas: old logic
    // L2 gas: Launch.getEstimatedGas
    let maxTransactionValueConsideringFee;
    console.log("selectedChains", selectedChains);
    if (selectedChains?.to.key === "ethereum") {
      // L1 gas: old logic
      if (isTokenEther(token)) {
        maxTransactionValueConsideringFee = balance.sub(l1EstimatedGas);
        console.log("l1 gas", formatTokenAmount(l1EstimatedGas, token));
      } else {
        maxTransactionValueConsideringFee = balance;
      }
    } else {
      // L2 gas: Launch.getEstimatedGas
      maxTransactionValueConsideringFee = balance.sub(bigNumberWithdrawFee).sub(l2EstimatedGas);
      console.log("l2 gas", formatTokenAmount(l2EstimatedGas, token));
    }
    console.log("vizingFee", formatTokenAmount(bigNumberWithdrawFee, token));
    console.log("maxTxValue", formatTokenAmount(maxTransactionValueConsideringFee, token));
    if (balance.gt(0)) {
      // setInputValue(formatTokenAmount(balance, token));
      setInputValue(formatTokenAmount(maxTransactionValueConsideringFee, token));
      processOnChangeCallback(balance);
    } else {
      setInputValue("");
      processOnChangeCallback();
    }
  };
  useEffect(() => {
    // Reset the input when the chain or the token are changed
    if (amount === undefined) {
      setInputValue("");
    }
  }, [amount]);

  useEffect(() => {
    // Load all the tokens for the selected chain without their balance
    if (selectedChains && defaultTokens) {
      const { from, to } = selectedChains;
      const chainTokens = [...getChainCustomTokens(from), ...defaultTokens];
      console.log("load all tokens", chainTokens);
      const selectedChainTokens = getSelectedChainTokens(to, selectedChains.from);
      console.log("selectedChainTokens withdraw", selectedChainTokens);
      setToken(getEtherToken(from));
      setValueUserWillGet("");
      if (to.key === "ethereum") {
        setShowL2Gas(false);
      } else {
        setShowL2Gas(true);
      }

      setTokens(
        selectedChainTokens.map((token) => ({
          ...token,
          balance: {
            status: "pending",
          },
        }))
      );
    }
  }, [defaultTokens, selectedChains]);

  useEffect(() => {
    // Load the balances of all the tokens of the primary chain (from)
    const areTokensPending = tokens?.some((tkn) => tkn.balance?.status === "pending");

    if (selectedChains && tokens && areTokensPending) {
      const getUpdatedTokens = (tokens: Token[] | undefined, updatedToken: Token) =>
        tokens
          ? tokens.map((tkn) =>
              tkn.address === updatedToken.address && tkn.chainId === updatedToken.chainId
                ? updatedToken
                : tkn
            )
          : undefined;

      setTokens(() =>
        tokens.map((token: Token) => {
          console.log("getTokenBalance token, from-chain", token, selectedChains.from.key);
          getTokenBalance(token, selectedChains.from)
            .then((balance): void => {
              console.log("getTokenBalance balance", balance);
              callIfMounted(() => {
                const updatedToken: Token = {
                  ...token,
                  balance: {
                    data: balance,
                    status: "successful",
                  },
                };

                setTokens((currentTokens) => getUpdatedTokens(currentTokens, updatedToken));
              });
            })
            .catch(() => {
              callIfMounted(() => {
                const updatedToken: Token = {
                  ...token,
                  balance: {
                    error: "Couldn't retrieve token balance",
                    status: "failed",
                  },
                };

                setTokens((currentTokens) => getUpdatedTokens(currentTokens, updatedToken));
              });
            });

          return { ...token, balance: { status: "loading" } };
        })
      );
    }
  }, [callIfMounted, defaultTokens, getTokenBalance, selectedChains, tokens]);

  useEffect(() => {
    // Load the balance of the selected token in both networks
    if (selectedChains && token) {
      setBalanceFrom({ status: "loading" });
      setBalanceTo({ status: "loading" });

      getTokenBalance(token, selectedChains.from)
        .then((balance) =>
          callIfMounted(() => {
            setBalanceFrom({ data: balance, status: "successful" });
          })
        )
        .catch(() => {
          callIfMounted(() => {
            setBalanceFrom({ error: "Couldn't retrieve token balance", status: "failed" });
          });
        });
      getTokenBalance(token, selectedChains.to)
        .then((balance) =>
          callIfMounted(() => {
            setBalanceTo({ data: balance, status: "successful" });
          })
        )
        .catch(() => {
          callIfMounted(() => {
            setBalanceTo({ error: "Couldn't retrieve token balance", status: "failed" });
          });
        });
    }
  }, [callIfMounted, getTokenBalance, selectedChains, token]);

  useEffect(() => {
    // Load the default values after the network is changed
    if (env && connectedProvider.status === "successful" && formData === undefined) {
      const from = env.chains.find((chain) => chain.key === "vizing");
      const to = env.chains.find((chain) => chain.key !== "vizing");

      if (from && to) {
        setSelectedChains({ from, to });
        setFromChain(from);
        setToken(getEtherToken(from));
      }
      setAmount(undefined);
    }
    // This prevents the form from being reset when coming back from BridgeConfirmation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedProvider, env]);

  useEffect(() => {
    console.log("debounceAmountValue change", debounceAmountValue);
    console.log("selectedChains change", selectedChains);
    console.log("selectedChains change tokens", tokens);
    console.log("set new debounceFormData");
    if (!debounceAmountValue || !selectedChains || !token || debounceAmountValue.isZero()) {
      setDebounceFormData(undefined);
      return;
    }
    setDebounceFormData({
      amount: debounceAmountValue,
      from: selectedChains?.from,
      to: selectedChains?.to,
      token: token,
    });
  }, [debounceAmountValue, selectedChains, token, tokens]);

  useEffect(() => {
    // Load default form values
    if (formData && fromChain) {
      setSelectedChains({ from: fromChain, to: formData.to });
      setToken(formData.token);
      setAmount(formData.amount);
      onResetForm();
    }
  }, [formData, onResetForm, fromChain]);

  useEffect(() => {
    void getL2EstimatedGas();
    getL1EstimatedGas();
  }, [getL2EstimatedGas, getL1EstimatedGas]);

  useEffect(() => {
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    const inputValueInWei = ethers.utils.parseUnits(inputValue || "0", "ether");
    const feeInWei = ethers.utils.parseUnits(WITHDRAW_FEE, "ether"); // 0.0005
    const bridgeLimitInWei = ethers.utils.parseUnits(WITHDRAW_LIMIT, "ether"); // 0.0006
    let valueShowed = inputValue;
    let errorContent = undefined;

    if (selectedChains?.to.key !== "ethereum" && inputValue) {
      if (inputValueInWei.gte(bridgeLimitInWei) && inputValueInWei.lt(balance)) {
        // normal case
        const valueMinusFee = inputValueInWei.sub(feeInWei);
        const resultInEther = ethers.utils.formatUnits(valueMinusFee, "ether");
        valueShowed = resultInEther;
        errorContent = undefined;
        setValueUserWillGet(valueShowed);
        setInputError(errorContent);
      } else if (inputValueInWei.lt(bridgeLimitInWei) && inputValue && !inputValueInWei.isZero()) {
        // less case
        valueShowed = inputValue;
        errorContent = `Minimum bridge amount: ${WITHDRAW_LIMIT}ETH`;
        setValueUserWillGet(valueShowed);
        setInputError(errorContent);
      }
      // setValueUserWillGet(valueShowed);
      // setInputError(errorContent);
    } else {
      setValueUserWillGet(inputValue);
    }
    // if (selectedChains?.from.key === "ethereum") {
    //   // ethereum case
    //   valueShowed = inputValue;
    //   errorContent = undefined;
    // }
  }, [inputValue, selectedChains, balanceFrom]);

  console.log("withdraw from env", env);
  console.log("withdraw from selectedChains", selectedChains);
  console.log("withdraw from tokens", tokens);
  console.log("withdraw from token", token);

  if (!env || !selectedChains || !tokens || !token) {
    return (
      <div className={classes.spinner}>
        <Spinner />
      </div>
    );
  }

  return (
    <form className={classes.form} onSubmit={onFormSubmit}>
      <Card className={classes.card}>
        <div className={classes.fromChainInfoRow}>
          <div className={classes.leftBox}>
            <Typography type="body2">From</Typography>
            <span className={classes.chainIconWrap}>
              <selectedChains.from.Icon />
            </span>
            <Typography className={classes.chainName} type="body1">
              {selectedChains.from.name}
            </Typography>
            {/* <button
              className={classes.fromChain}
              onClick={() => {
                console.log("chains...", env.chains);
                console.log(env);
                setChains(env.chains);
              }}
              type="button"
            >
              <span className={classes.chainIconWrap}>
                <selectedChains.from.Icon />
              </span>
              <Typography className={classes.chainName} type="body1">
                {selectedChains.from.name}
              </Typography>
              <CaretDown />
            </button> */}
          </div>
          <div className={classes.rightBox}>
            <Typography type="body3">Balance:&nbsp;</Typography>
            <TokenBalance
              spinnerSize={14}
              token={{ ...token, balance: balanceFrom }}
              typographyProps={{ type: "body1" }}
            />
            <span className={classes.maxButton} onClick={onMax}>
              Max
            </span>
          </div>
        </div>
        <div className={`${classes.row} ${classes.fromChainTokenRow}`}>
          <button className={classes.tokenSelector} onClick={onTokenDropdownClick} type="button">
            <Icon isRounded size={24} url={token.logoURI} />
            <Typography className={classes.tokenName} type="h2">
              {token.symbol}
            </Typography>
            <CaretDown />
          </button>
          <input
            autoFocus
            className={classes.amountInput}
            onChange={onInputChange}
            placeholder="0.00"
            value={inputValue}
          />
          {/* <AmountInput
            balance={
              balanceFrom && isAsyncTaskDataAvailable(balanceFrom)
                ? balanceFrom.data
                : BigNumber.from(0)
            }
            onChange={onAmountInputChange}
            token={token}
            value={amount}
          /> */}
        </div>
      </Card>
      {inputError && <div className={classes.invalidInputMsg}>{inputError}</div>}
      <Card className={`${classes.card} ${classes.toChainCard}`}>
        <div className={classes.toChainRow}>
          <div className={classes.toChainRowLeftBox}>
            <Typography type="body2">To</Typography>
            <button
              className={classes.toChain}
              onClick={() => {
                console.log("chains...", env.chains);
                console.log(env);
                setChains(env.chains);
              }}
              type="button"
            >
              <span className={classes.toChainIconWrap}>
                <selectedChains.to.Icon className={classes.toChainIcon} />
              </span>
              <Typography className={classes.chainName} type="body1">
                {selectedChains.to.name}
              </Typography>
              <CaretDown />
            </button>
            {/* <div className={classes.toChain}>
              <selectedChains.to.Icon />
              <Typography className={classes.toChainName} type="body1">
                {selectedChains.to.name}
              </Typography>
            </div> */}
          </div>
          <div className={classes.toChainRowRightBox}>{valueUserWillGet}</div>
        </div>
      </Card>
      {debounceFormData && (
        <BridgeGasFee formData={debounceFormData} l2Gas={l2EstimatedGas} showL2Gas={showL2Gas} />
      )}
      <div className={classes.button}>
        <Button disabled={!amount || amount.isZero() || inputError !== undefined} type="submit">
          Continue
        </Button>
        {/* {amount && inputError && <ErrorMessage error={inputError} />} */}
      </div>
      {/* <button onClick={handleWrapClick}>wrappedToken</button> */}
      {chains && (
        <ChainList
          chains={chains}
          onClick={onChainButtonClick}
          onClose={() => setChains(undefined)}
        />
      )}
      {isTokenListOpen && (
        <TokenSelector
          account={account}
          chains={selectedChains}
          onAddToken={onAddToken}
          onClose={onCloseTokenSelector}
          onRemoveToken={onRemoveToken}
          onSelectToken={onSelectToken}
          tokens={tokens}
        />
      )}
    </form>
  );
};
