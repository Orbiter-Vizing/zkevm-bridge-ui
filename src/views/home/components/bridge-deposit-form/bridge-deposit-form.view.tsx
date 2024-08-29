import { BigNumber, ethers, utils as ethersUtils } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";
import { addCustomToken, getChainCustomTokens, removeCustomToken } from "src/adapters/storage";
import { EnvString, EthereumErc20TokensConfig } from "src/assets/ethereum-erc20-tokens";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import { getOmniChainGasLimit } from "src/assets/omni-chain-gas-limit";
import { DEPOSIT_FEE, DEPOSIT_LIMIT, getEtherToken } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
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
import { useBridgeDepositFormStyles } from "src/views/home/components/bridge-deposit-form/bridge-deposit-form.styles";
import { BridgeGasFee } from "src/views/home/components/bridge-gas-fee/bridge-gas-fee.view";
import { TokenSelector } from "src/views/home/components/token-selector/token-selector.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { ChainList } from "src/views/shared/chain-list/chain-list.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { TokenBalance } from "src/views/shared/token-balance/token-balance.view";
import { TxToastContent } from "src/views/shared/tx-toast-content/tx-toast-content.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface BridgeDepositFormProps {
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

export const BridgeDepositForm: FC<BridgeDepositFormProps> = ({
  account,
  formData,
  onResetForm,
  onSubmit,
}) => {
  const classes = useBridgeDepositFormStyles();
  const callIfMounted = useCallIfMounted();
  const { estimateBridgeGas, estimateVizingBridgeGas } = useBridgeContext();
  const env = useEnvContext();
  const { getErc20TokenBalance, tokens: defaultTokens } = useTokensContext();
  const { connectedProvider } = useProvidersContext();
  const [balanceFrom, setBalanceFrom] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });
  const [balanceTo, setBalanceTo] = useState<AsyncTask<BigNumber, string>>({ status: "pending" });
  const [inputError, setInputError] = useState<string>();
  const [selectedChains, setSelectedChains] = useState<SelectedChains>();
  const [toChain, setToChain] = useState<Chain>();
  const [token, setToken] = useState<Token>();
  const [amount, setAmount] = useState<BigNumber>();
  const [chains, setChains] = useState<Chain[]>();
  const [tokens, setTokens] = useState<Token[]>();
  const [isTokenListOpen, setIsTokenListOpen] = useState(false);
  const [l1EstimatedGas, setL1EstimatedGas] = useState<BigNumber>(BigNumber.from(0));
  const [l2EstimatedGas, setL2EstimatedGas] = useState<BigNumber>(BigNumber.from(0));
  const [valueUserWillGet, setValueUserWillGet] = useState("");
  const [showL2Gas, setShowL2Gas] = useState(false);
  // amount input state
  const defaultInputValue = amount && token ? formatTokenAmount(amount, token) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [debounceFormData, setDebounceFormData] = useState<FormData>();
  const debounceAmountValue = useDebounce(amount, DEBOUNCE_TIME_IN_MS);
  const [maxAmountConsideringFee, setMaxAmountConsideringFee] = useState<BigNumber>(
    BigNumber.from(0)
  );

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

  const onChainButtonClick = (from: Chain) => {
    if (env) {
      if (toChain) {
        setSelectedChains({ from, to: toChain });
        console.log("onChainButtonClick - from", from);
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
      console.log("isTokenEther(token)", isTokenEther(token));
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

  // const handleToast = (type: "pending" | "success" | "fail") => {
  //   const id = toast.loading(
  //     // <TxToastContent
  //     //   text="The transaction has been submitted for processing."
  //     //   title="Transaction Submitted"
  //     //   type="pending"
  //     // />
  //     <TxToastContent
  //       explorerUrl="https://www.google.com"
  //       text="0x24F4F8e83eA08b7DCb7A579B1236fc3155300854"
  //       title="Transaction Successful"
  //       type="success"
  //     />,
  //     {
  //       isLoading: false,
  //     }
  //   );
  // };

  const getSelectedChainTokens = (selectedChain: Chain) => {
    // const envString = import.meta.env.MODE as EnvMode;
    // eslint-disable-next-line no-type-assertion/no-type-assertion
    const envString = import.meta.env.MODE as EnvString;
    console.log("envString", envString);
    const currentEnvTokens = EthereumErc20TokensConfig[envString];
    console.log("currentEnvTokens", currentEnvTokens);
    if (!currentEnvTokens) {
      return [];
    }
    return currentEnvTokens.filter((token) => {
      return token.chainId === selectedChain.chainId;
    });
  };

  // const showMaxAmount = () => {
  //   if (maxAmountConsideringFee) {
  //     console.log("maxAmountConsideringFee", ethers.utils.formatUnits(maxAmountConsideringFee, 18));
  //   }
  // };

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
        from: ethereumChain,
        to: vizingChain,
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
    if (!selectedChains) {
      return;
    }
    const { from, to } = selectedChains;
    if (from.key === "ethereum") {
      return;
    }
    // Estimate L2 gas like L1
    const estimateAmount = BigNumber.from(0);
    if (connectedProvider.status === "successful" && token) {
      const contractAddress = from.bridgeContractAddress;
      const provider = from.provider;
      const contract = Bridge__factory.connect(contractAddress, provider);

      const omniGasLimit = getOmniChainGasLimit(from.chainId, to.chainId);
      console.log("omniGasLimit", omniGasLimit);
      const fakePostMessage = ethersUtils.solidityPack(
        ["uint8", "uint256", "uint24"],
        [4, account, omniGasLimit]
      );

      let vizingValue = [BigNumber.from(0)];
      try {
        vizingValue = await contract.functions.estimateGas(
          estimateAmount,
          to.chainId,
          ethers.constants.AddressZero,
          fakePostMessage
        );
      } catch (error) {
        console.error("deposit form contract.functions.estimateGas error", error);
      }

      const totalValue = vizingValue[0].add(estimateAmount);
      estimateVizingBridgeGas({
        account,
        destinationAddress: connectedProvider.data.account,
        from,
        to,
        token,
        totalValue,
        userInputValue: estimateAmount,
      })
        .then((gas: Gas) => {
          const newFee = calculateMaxTxFee(gas);

          setL2EstimatedGas(newFee);
        })
        .catch((error) => {
          console.error("Get L2 estimated gas failed:", error);
        });
    }
  }, [estimateVizingBridgeGas, token, connectedProvider, account, selectedChains]);

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
    if (!token) {
      return;
    }
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    const bigNumberDepositFee = ethers.utils.parseEther(DEPOSIT_FEE);
    // Max data should be: balance - contractFee -  gas
    let maxTransactionValueConsideringFee;
    if (selectedChains?.from.key === "ethereum") {
      // L1 gas: estimateBridgeGas
      if (isTokenEther(token)) {
        maxTransactionValueConsideringFee = balance.sub(l1EstimatedGas);
      } else {
        maxTransactionValueConsideringFee = balance;
      }
    } else {
      // L2 gas: Launch.getEstimatedGas
      maxTransactionValueConsideringFee = balance.sub(bigNumberDepositFee).sub(l2EstimatedGas);
    }
    if (balance.gt(0)) {
      // setInputValue(formatTokenAmount(balance, token));
      // processOnChangeCallback(balance);
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
      setValueUserWillGet("");
    }
  }, [amount]);

  useEffect(() => {
    // Load all the tokens for the selected chain without their balance
    if (selectedChains && defaultTokens) {
      const { from } = selectedChains;
      // const chainTokens = [...getChainCustomTokens(from), ...defaultTokens];
      // console.log("chainTokens when select chain", chainTokens);
      const selectedChainTokens = getSelectedChainTokens(from);
      setToken(getEtherToken(from));
      if (from.key === "ethereum") {
        setShowL2Gas(false);
      } else {
        setShowL2Gas(true);
      }
      setValueUserWillGet("");

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
      console.log("tokens need get balnce", tokens);
      setTokens(() =>
        tokens.map((token: Token) => {
          getTokenBalance(token, selectedChains.from)
            .then((balance): void => {
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
      const from = env.chains.find((chain) => chain.key !== "vizing");
      const to = env.chains.find((chain) => chain.key === "vizing");
      console.log("tochain info", to);

      if (from && to) {
        setSelectedChains({ from, to });
        setToChain(to);
        setToken(getEtherToken(from));
      }
      setAmount(undefined);
    }
    // This prevents the form from being reset when coming back from BridgeConfirmation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedProvider, env]);

  useEffect(() => {
    // Load default form values
    console.log("load default form values", formData);
    // console.log("load default form values", toChain);
    if (formData) {
      setSelectedChains({ from: formData.from, to: formData.to });
      setToken(formData.token);
      setAmount(formData.amount);
      onResetForm();
    }
  }, [formData, onResetForm]);

  useEffect(() => {
    console.log("debounceAmountValue change", debounceAmountValue);
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
  }, [debounceAmountValue, selectedChains, token]);

  useEffect(() => {
    void getL2EstimatedGas();
    getL1EstimatedGas();
  }, [getL2EstimatedGas, getL1EstimatedGas]);

  useEffect(() => {
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    const inputValueInWei = ethers.utils.parseUnits(inputValue || "0", "ether");
    const feeInWei = ethers.utils.parseUnits(DEPOSIT_FEE, "ether"); // 0.00005
    const bridgeLimitInWei = ethers.utils.parseUnits(DEPOSIT_LIMIT, "ether"); // 0.0001
    let valueShowed = inputValue;
    let errorContent = undefined;

    if (selectedChains?.from.key !== "ethereum" && inputValue) {
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
        errorContent = `Minimum bridge amount: ${DEPOSIT_LIMIT}ETH`;
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

  // set MaxAmountConsideringFee
  useEffect(() => {
    if (!token) {
      return;
    }
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    // console.log("onMax token", token);
    // console.log("onMax balance in readable", ethers.utils.formatUnits(balance, token.decimals));
    const bigNumberDepositFee = ethers.utils.parseEther(DEPOSIT_FEE);
    // Max data should be: balance - contractFee -  gas
    let maxTransactionValueConsideringFee;
    // console.log("onMax selectedChains", selectedChains);
    if (selectedChains?.from.key === "ethereum") {
      // L1 gas: estimateBridgeGas
      if (isTokenEther(token)) {
        const safeL1EstimatedGas = l1EstimatedGas.mul(3).div(2);
        maxTransactionValueConsideringFee = balance.sub(safeL1EstimatedGas);
        // console.log("l1 gas", formatTokenAmount(l1EstimatedGas, token));
      } else {
        maxTransactionValueConsideringFee = balance;
      }
    } else {
      // L2 gas: Launch.getEstimatedGas
      const safeL2EstimatedGas = l2EstimatedGas.mul(3).div(2);
      maxTransactionValueConsideringFee = balance.sub(bigNumberDepositFee).sub(safeL2EstimatedGas);
      // console.log("l2 gas", formatTokenAmount(l2EstimatedGas, token));
    }
    setMaxAmountConsideringFee(maxTransactionValueConsideringFee);
  }, [balanceFrom, l1EstimatedGas, l2EstimatedGas, selectedChains, token]);

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
            <button
              className={classes.fromChain}
              onClick={() => {
                console.log("env.chains", env.chains);
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
            </button>
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
            {/* <Typography  className={classes.maxButton} type="body3">
              Max
            </Typography> */}
          </div>
        </div>
        <div className={`${classes.row} ${classes.fromChainTokenRow}`}>
          <button className={classes.tokenSelector} onClick={onTokenDropdownClick} type="button">
            <Icon isRounded size={32} url={token.logoURI} />
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
            <div className={classes.toChain}>
              <selectedChains.to.Icon className={classes.toChainIcon} />
              <Typography className={classes.toChainName} type="body1">
                {selectedChains.to.name}
              </Typography>
            </div>
          </div>
          <div className={classes.toChainRowRightBox}>{valueUserWillGet}</div>
        </div>
      </Card>
      {debounceFormData && (
        <BridgeGasFee formData={debounceFormData} l1Gas={l1EstimatedGas} l2Gas={l2EstimatedGas} />
      )}
      <div className={classes.button}>
        <Button disabled={!amount || amount.isZero() || inputError !== undefined} type="submit">
          Continue
        </Button>
        {/* {amount && inputError && <ErrorMessage error={inputError} />} */}
      </div>
      {/* <button onClick={() => handleToast("success")}>toast</button> */}
      {/* <span onClick={showMaxAmount}>showMaxAmount</span> */}
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
