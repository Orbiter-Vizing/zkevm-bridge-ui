import { BigNumber, ethers, utils as ethersUtils } from "ethers";
import { parseUnits, zeroPad } from "ethers/lib/utils";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

import {
  addCustomToken,
  getChainCustomTokens,
  getPolicyCheck,
  removeCustomToken,
  setPolicyCheck,
  setStorageByKey,
} from "src/adapters/storage";
import { EnvString, EthereumErc20TokensConfig } from "src/assets/ethereum-erc20-tokens";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import { BRIDGE_LIMIT, DEPOSIT_FEE, getEtherToken } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, Chain, FormData, Gas, PolicyCheck, Token, WalletName } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { useDebounce } from "src/hooks/use-debounce";
import { Bridge__factory } from "src/types/contracts/bridge";
import { formatTokenAmount } from "src/utils/amounts";
import { calculateMaxTxFee } from "src/utils/fees";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import { BridgeGasFee } from "src/views/home/components/bridge-gas-fee/bridge-gas-fee.view";
import { useDefaultBridgeDepositFormStyles } from "src/views/home/components/default-bridge-deposit-form/default-bridge-deposit-form.styles";
import { TokenSelector } from "src/views/home/components/token-selector/token-selector.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { ChainList } from "src/views/shared/chain-list/chain-list.view";
import { ConnectWalletButton } from "src/views/shared/connect-wallet-button/connect-wallet-button.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { TokenBalance } from "src/views/shared/token-balance/token-balance.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface DefaultBridgeDepositFormProps {
  // account?: string;
  formData?: FormData;
  onResetForm: () => void;
  // onSubmit: (formData: FormData) => void;
}

interface SelectedChains {
  from: Chain;
  to: Chain;
}

type EnvMode = "development" | "test" | "production";

const DEBOUNCE_TIME_IN_MS = 750;

export const DefaultBridgeDepositForm: FC<DefaultBridgeDepositFormProps> = ({
  // account,
  formData,
  onResetForm,
  // onSubmit,
}) => {
  const classes = useDefaultBridgeDepositFormStyles();
  const callIfMounted = useCallIfMounted();
  const { bridge, estimateBridgeGas, estimateVizingBridgeGas } = useBridgeContext();
  const env = useEnvContext();
  const { getErc20TokenBalance, tokens: defaultTokens } = useTokensContext();
  const { connectedProvider, connectProvider } = useProvidersContext();
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
  const { setFormData } = useFormContext();
  const [l1EstimatedGas, setL1EstimatedGas] = useState<BigNumber>();
  const [l2EstimatedGas, setL2EstimatedGas] = useState<BigNumber>();
  const [defaultFormGas, setDefaultFormGas] = useState<BigNumber>();
  const [valueUserWillGet, setValueUserWillGet] = useState("");
  const [invalidInputMsg, setInvalidInputMsg] = useState("");
  const [showL2Gas, setShowL2Gas] = useState(false);
  // amount input state
  const defaultInputValue = amount && token ? formatTokenAmount(amount, token) : "";
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [debounceFormData, setDebounceFormData] = useState<FormData>();
  const debounceAmountValue = useDebounce(amount, DEBOUNCE_TIME_IN_MS);
  // const debounceFormData ={
  //   amount: debounceAmountValue,
  //   from: selectedChains.from,
  //   to: selectedChains.to,
  //   token: token,
  // }

  const onAmountInputChange = ({ amount, error }: { amount?: BigNumber; error?: string }) => {
    setAmount(amount);
    setInputError(error);
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

  const onCheckAndConnectProvider = () => {
    const walletName = WalletName.METAMASK;
    // setSelectedWallet(walletName);
    const checked = getPolicyCheck();
    if (checked === PolicyCheck.Checked) {
      // setStorageByKey({
      //   key: constants.DISCONNECT_KEY,
      //   value: false,
      // });
      void connectProvider(walletName);
    } else {
      // setShowPolicyModal(true);
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

  // const getTokenBalance = useCallback(
  //   (token: Token, chain: Chain): Promise<BigNumber> => {
  //     console.log("isTokenEther(token)", isTokenEther(token));
  //     if (isTokenEther(token)) {
  //       return chain.provider.getBalance(account);
  //     } else {
  //       return getErc20TokenBalance({
  //         accountAddress: account,
  //         chain: chain,
  //         tokenAddress: selectTokenAddress(token, chain),
  //       });
  //     }
  //   },
  //   [account, getErc20TokenBalance]
  // );

  const Msg = ({ text, title }: { text: string; title: string }) => {
    return (
      <div className={classes.txMsgBox}>
        <p className={classes.txMsgTitle}>{title}</p>
        <p className={classes.txMsgText}>{text}</p>
      </div>
    );
  };

  const getSelectedChainTokens = (selectedChain: Chain) => {
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

  const getL1EstimatedGas = useCallback(() => {
    const ethereumChain = env?.chains.find((chain) => {
      return chain.key === "ethereum";
    });
    const vizingChain = env?.chains.find((chain) => {
      return chain.key === "vizing";
    });
    const estimateAccount = ethereumChain?.bridgeContractAddress;
    if (ethereumChain && vizingChain && token && estimateAccount) {
      estimateBridgeGas({
        destinationAddress: estimateAccount,
        from: ethereumChain,
        to: vizingChain,
        token,
        tokenSpendPermission: { type: "none" },
      })
        .then((gas: Gas) => {
          const newFee = calculateMaxTxFee(gas);
          console.log("default getL1EstimatedGas gas", gas);
          console.log(
            "default getL1EstimatedGas gas format",
            formatTokenAmount(gas.data.gasLimit, token)
          );
          console.log("default getL1EstimatedGas newFee format", formatTokenAmount(newFee, token));
          setL1EstimatedGas(newFee);
        })
        .catch((error) => {
          console.error("Get L1 estimated gas failed:", error);
        });
    }
  }, [estimateBridgeGas, env, token]);

  const getL2EstimatedGas = useCallback(async () => {
    const bridgeChain = env?.chains.find((chain) => {
      return chain.key === "base";
    });
    const vizingChain = env?.chains.find((chain) => {
      return chain.key === "vizing";
    });

    // console.log("env", env?.chains.length);
    console.log("bridgeChain", bridgeChain);
    console.log("vizingChain", vizingChain);
    if (!bridgeChain || !vizingChain) {
      return;
    }
    // Estimate L2 gas like L1
    const estimateAmount = BigNumber.from(1);
    const estimateAccount = bridgeChain.bridgeContractAddress;
    console.log("Estimate L2 gas bridgeChain", bridgeChain);
    console.log("Estimate L2 gas vizingChain", vizingChain);
    console.log("Estimate L2 gas token", token);
    console.log("Estimate L2 gas amount", estimateAmount);
    if (
      bridgeChain &&
      vizingChain &&
      token
      // && amount
    ) {
      const contractAddress = bridgeChain.bridgeContractAddress;
      const provider = bridgeChain.provider;
      console.log("let contractAddress", contractAddress);
      console.log("L2 Bridge__factory contractAddress", contractAddress);
      const contract = Bridge__factory.connect(contractAddress, provider);

      const fakePostMessage = ethersUtils.solidityPack(
        ["uint8", "uint256", "uint24"],
        [4, estimateAccount, 50000]
      );
      try {
        const vizingValue = await contract.functions.estimateGas(
          estimateAmount,
          vizingChain.chainId,
          ethers.constants.AddressZero,
          fakePostMessage
        );
      } catch (error) {
        console.error("try vizingValue error", error);
      }

      const vizingValue = await contract.functions.estimateGas(
        estimateAmount,
        vizingChain.chainId,
        ethers.constants.AddressZero,
        fakePostMessage
      );
      console.log("deposit vizingValue", vizingValue[0]);
      console.log("deposit user amount", estimateAmount);
      const totalValue = vizingValue[0].add(estimateAmount);
      estimateVizingBridgeGas({
        account: estimateAccount,
        destinationAddress: estimateAccount,
        from: bridgeChain,
        to: vizingChain,
        token,
        totalValue,
        userInputValue: estimateAmount,
      })
        .then((gas: Gas) => {
          const newFee = calculateMaxTxFee(gas);
          console.log("default getL2EstimatedGas gas", gas);
          console.log(
            "default getL2EstimatedGas gas format",
            formatTokenAmount(gas.data.gasLimit, token)
          );
          console.log("default getL2EstimatedGas newFee format", formatTokenAmount(newFee, token));
          setL2EstimatedGas(newFee);
        })
        .catch((error) => {
          console.error("Get L2 estimated gas failed:", error);
        });
    }
  }, [env, estimateVizingBridgeGas, token]);

  // amount input logic out
  const processOnChangeCallback = (amount?: BigNumber) => {
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    if (amount) {
      const error = undefined;

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
      // setValueUserWillGet("");
      processOnChangeCallback(amount);
    }
  };

  const handleConnectWallet = () => {
    console.log("connect wallet click");
    onCheckAndConnectProvider();
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
      const chainTokens = [...getChainCustomTokens(from), ...defaultTokens];
      console.log("chainTokens when select chain", chainTokens);
      const selectedChainTokens = getSelectedChainTokens(from);
      console.log("selectedChainTokens", selectedChainTokens);
      setToken(getEtherToken(from));
      if (from.key === "ethereum") {
        setShowL2Gas(false);
        // setDefaultFormGas(l1EstimatedGas);
      } else {
        setShowL2Gas(true);
        // setDefaultFormGas(l2EstimatedGas);
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
  }, [defaultTokens, selectedChains]); // add dependencies l1EstimatedGas, l2EstimatedGas will cause multi-render

  // useEffect(() => {
  //   // Load the balances of all the tokens of the primary chain (from)
  //   const areTokensPending = tokens?.some((tkn) => tkn.balance?.status === "pending");

  //   if (selectedChains && tokens && areTokensPending) {
  //     const getUpdatedTokens = (tokens: Token[] | undefined, updatedToken: Token) =>
  //       tokens
  //         ? tokens.map((tkn) =>
  //             tkn.address === updatedToken.address && tkn.chainId === updatedToken.chainId
  //               ? updatedToken
  //               : tkn
  //           )
  //         : undefined;
  //     console.log("tokens need get balnce", tokens);
  //     setTokens(() =>
  //       tokens.map((token: Token) => {
  //         getTokenBalance(token, selectedChains.from)
  //           .then((balance): void => {
  //             callIfMounted(() => {
  //               const updatedToken: Token = {
  //                 ...token,
  //                 balance: {
  //                   data: balance,
  //                   status: "successful",
  //                 },
  //               };

  //               setTokens((currentTokens) => getUpdatedTokens(currentTokens, updatedToken));
  //             });
  //           })
  //           .catch(() => {
  //             callIfMounted(() => {
  //               const updatedToken: Token = {
  //                 ...token,
  //                 balance: {
  //                   error: "Couldn't retrieve token balance",
  //                   status: "failed",
  //                 },
  //               };

  //               setTokens((currentTokens) => getUpdatedTokens(currentTokens, updatedToken));
  //             });
  //           });

  //         return { ...token, balance: { status: "loading" } };
  //       })
  //     );
  //   }
  // }, [callIfMounted, defaultTokens, getTokenBalance, selectedChains, tokens]);

  // useEffect(() => {
  //   // Load the balance of the selected token in both networks
  //   if (selectedChains && token) {
  //     setBalanceFrom({ status: "loading" });
  //     setBalanceTo({ status: "loading" });

  //     getTokenBalance(token, selectedChains.from)
  //       .then((balance) =>
  //         callIfMounted(() => {
  //           setBalanceFrom({ data: balance, status: "successful" });
  //         })
  //       )
  //       .catch(() => {
  //         callIfMounted(() => {
  //           setBalanceFrom({ error: "Couldn't retrieve token balance", status: "failed" });
  //         });
  //       });
  //     getTokenBalance(token, selectedChains.to)
  //       .then((balance) =>
  //         callIfMounted(() => {
  //           setBalanceTo({ data: balance, status: "successful" });
  //         })
  //       )
  //       .catch(() => {
  //         callIfMounted(() => {
  //           setBalanceTo({ error: "Couldn't retrieve token balance", status: "failed" });
  //         });
  //       });
  //   }
  // }, [callIfMounted, getTokenBalance, selectedChains, token]);

  useEffect(() => {
    // Load the default values after the network is changed
    if (env && formData === undefined) {
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
    const inputValueInWei = ethers.utils.parseUnits(inputValue || "0", "ether");
    const feeInWei = ethers.utils.parseUnits(DEPOSIT_FEE, "ether"); // 0.00005
    const bridgeLimitInWei = ethers.utils.parseUnits(BRIDGE_LIMIT, "ether"); // 0.0001
    let valueShowed = inputValue;
    let errorContent = undefined;

    if (selectedChains?.from.key !== "ethereum" && inputValue) {
      if (inputValueInWei.gte(bridgeLimitInWei)) {
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
        errorContent = `Minimum bridge amount: ${BRIDGE_LIMIT}ETH`;
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

  useEffect(() => {
    void getL2EstimatedGas();
    getL1EstimatedGas();
  }, [getL1EstimatedGas, getL2EstimatedGas]);

  console.log("before spinner if tokens", tokens);
  if (!env || !selectedChains || !tokens || !token) {
    console.log("spinner env", env);
    console.log("spinner selectedChains", selectedChains);
    console.log("spinner tokens", tokens);
    console.log("spinner token", token);
    return (
      <div className={classes.spinner}>
        <Spinner />
      </div>
    );
  }

  return (
    <form className={classes.form}>
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
            <Typography type="body3">Available:&nbsp;</Typography>
            <span>- ETH</span>
            <span className={classes.maxButton}>Max</span>
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
        <BridgeGasFee
          defaultForm={true}
          formData={debounceFormData}
          l1Gas={l1EstimatedGas}
          l2Gas={l2EstimatedGas}
        />
      )}
      <div className={classes.connectWalletButtonWrap}>
        <ConnectWalletButton />
      </div>
      {chains && (
        <ChainList
          chains={chains}
          onClick={onChainButtonClick}
          onClose={() => setChains(undefined)}
        />
      )}
      {isTokenListOpen && (
        <TokenSelector
          // account={account}
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
