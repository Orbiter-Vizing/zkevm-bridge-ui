import { BigNumber, CallOverrides, ethers, utils as ethersUtils } from "ethers";
import { parseUnits, zeroPad } from "ethers/lib/utils";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";
import { addCustomToken, getChainCustomTokens, removeCustomToken } from "src/adapters/storage";
import { EnvString, EthereumErc20TokensConfig } from "src/assets/ethereum-erc20-tokens";
import { ReactComponent as ArrowDown } from "src/assets/icons/arrow-down.svg";
import { ReactComponent as CaretDown } from "src/assets/icons/caret-down.svg";
import { getEtherToken } from "src/constants";
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
import { AmountInput } from "src/views/home/components/amount-input/amount-input.view";
import { useBridgeDepositFormStyles } from "src/views/home/components/bridge-deposit-form/bridge-deposit-form.styles";
import { BridgeGasFee } from "src/views/home/components/bridge-gas-fee/bridge-gas-fee.view";
import { TokenSelector } from "src/views/home/components/token-selector/token-selector.view";
import { Button } from "src/views/shared/button/button.view";
import { Card } from "src/views/shared/card/card.view";
import { ChainList } from "src/views/shared/chain-list/chain-list.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { TokenBalance } from "src/views/shared/token-balance/token-balance.view";
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

type EnvMode = "development" | "test" | "production";

const DEBOUNCE_TIME_IN_MS = 750;
const DEPOSIT_FEE = "0.00005"; // unit: eth

export const BridgeDepositForm: FC<BridgeDepositFormProps> = ({
  account,
  formData,
  onResetForm,
  onSubmit,
}) => {
  const classes = useBridgeDepositFormStyles();
  const callIfMounted = useCallIfMounted();
  const { bridge, estimateBridgeGas } = useBridgeContext();
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
  const { setFormData } = useFormContext();
  const [l1EstimatedGas, setL1EstimatedGas] = useState<BigNumber>();
  const [l2EstimatedGas, setL2EstimatedGas] = useState<BigNumber>();
  const [isMaxClicked, setIsMaxClicked] = useState(false);
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

  const Msg = ({ text, title }: { text: string; title: string }) => {
    return (
      <div className={classes.txMsgBox}>
        <p className={classes.txMsgTitle}>{title}</p>
        <p className={classes.txMsgText}>{text}</p>
      </div>
    );
  };

  // const toaster = (myProps, toastProps): Id =>
  //   toast(<Msg {...myProps} />, { ...toastProps });

  // toaster.success = (myProps, toastProps): Id =>
  //   toast.success(<Msg {...myProps} />, { ...toastProps });

  const handleToast = (type: "pending" | "success" | "fail") => {
    // const masProps = {
    //   text: "The transaction has been submitted for processing.",
    //   title: "Transaction Submitted",
    // };
    // pending and update
    const id = toast.loading(<Msg text="initial text" title="initial title" />, {
      isLoading: false,
    });
    //do something else
    // setTimeout(() => {
    //   toast.update(id, {
    //     isLoading: false,
    //     render: "All is good",
    //     type: "success",
    //   });
    // }, 3000);
    // setTimeout(() => {
    //   toast.update(id, {
    //     isLoading: false,
    //     render: "Or pending one more time",
    //     type: "default",
    //   });
    // }, 4000);
    // setTimeout(() => {
    //   toast.update(id, {
    //     autoClose: 2000,
    //     isLoading: false,
    //     render: "Finally seccess",
    //     type: "default",
    //   });
    // }, 5000);

    // const title = "Transaction Submitted";
    // const text = "The transaction has been submitted for processing.";
    // toast(
    //   // <Msg {...masProps} />
    //   <TxToastContent text={text} title={title} type={type} />
    //   //   {
    //   //   autoClose: 5000,
    //   //   closeOnClick: true,
    //   //   draggable: true,
    //   //   hideProgressBar: false,
    //   //   pauseOnHover: true,
    //   //   position: "top-right",
    //   //   progress: undefined,
    //   //   theme: "light",
    //   //   transition: Bounce,
    //   // }
    // );

    // toaster.success(
    //   {
    //     title: "You did it!",
    //     text: "Good job!",
    //   },
    //   { autoClose: false }
    // );
  };

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

  const getL2EstimatedGas = useCallback(() => {
    const bridgeChain = env?.chains.find((chain) => {
      return chain.key === "base";
    });
    const vizingChain = env?.chains.find((chain) => {
      return chain.key === "vizing";
    });
    console.log("env", env?.chains.length);
    console.log("bridgeChain", bridgeChain);
    console.log("vizingChain", vizingChain);
    if (!bridgeChain || !vizingChain) {
      return;
    }
    const contract = Bridge__factory.connect(
      bridgeChain.bridgeContractAddress,
      bridgeChain.provider
    );
    const fakePostMessage = ethersUtils.solidityPack(
      ["uint8", "uint256", "uint24"],
      [4, account, 50000]
    );
    // const overrides: CallOverrides = { from: account, value: totalValue };

    // console.log("l2 contract in deposit", contract);
    contract.functions
      .estimateGas(
        BigNumber.from("1"),
        vizingChain.chainId,
        ethers.constants.AddressZero,
        fakePostMessage
      )
      .then((res) => {
        console.log("getL2EstimatedGas gas", res[0]);
        console.log(
          "getL2EstimatedGas gas format",
          formatTokenAmount(res[0], getEtherToken(vizingChain))
        );
        setL2EstimatedGas(res[0]);
      })
      .catch((error) => {
        console.error("Get L2 estimated gas failed:", error);
      });
    // console.log("before Launch gasLimit");
    // contract.estimateGas // contract is bridge contract
    //   .Launch(
    //     0, // earliestArrivalTimestamp
    //     0, // latestArrivalTimestamp
    //     ethers.constants.AddressZero, // relayer
    //     account, // sender
    //     userInputValue, // value that user input
    //     to.chainId, // destChainid
    //     "0x", // additionalParams
    //     fakePostMessage, // usrMessage
    //     overrides
    //   );
    // console.log("Launch gasLimit", gasLimit);
    // L2 estimated gas through ethers.js
  }, [account, env]);

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
    setIsMaxClicked(false);
    const value = event.target.value;
    const decimals = token.decimals;
    const regexToken = `^(?!0\\d|\\.)\\d*(?:\\.\\d{0,${decimals}})?$`;
    const INPUT_REGEX = new RegExp(regexToken);
    const isInputValid = INPUT_REGEX.test(value);
    const amount = value.length > 0 && isInputValid ? parseUnits(value, token.decimals) : undefined;

    if (isInputValid) {
      setInputValue(value);
      processOnChangeCallback(amount);
    }
  };
  const onMax = () => {
    if (!token || !l2EstimatedGas || !l1EstimatedGas) {
      return;
    }
    const balance =
      balanceFrom && isAsyncTaskDataAvailable(balanceFrom) ? balanceFrom.data : BigNumber.from(0);
    console.log("onMax balance", balance);
    const bigNumberDepositFee = ethers.utils.parseEther(DEPOSIT_FEE);
    // Max data should show: balance - contractFee -  gas
    // contractFee: DEPOSIT_FEE
    // gas: L1 or L2
    // L1 gas: old logic
    // L2 gas: Launch.getEstimatedGas
    let maxTransactionValueConsideringFee;
    console.log("selectedChains", selectedChains);
    if (selectedChains?.from.key === "ethereum") {
      // L1 gas: old logic
      maxTransactionValueConsideringFee = balance.sub(l1EstimatedGas);
      console.log("l1 gas", formatTokenAmount(l1EstimatedGas, token));
    } else {
      // L2 gas: Launch.getEstimatedGas
      maxTransactionValueConsideringFee = balance.sub(bigNumberDepositFee).sub(l2EstimatedGas);
      console.log("l2 gas", formatTokenAmount(l2EstimatedGas, token));
    }
    console.log("vizingFee", formatTokenAmount(bigNumberDepositFee, token));
    console.log("maxTxValue", formatTokenAmount(maxTransactionValueConsideringFee, token));
    if (balance.gt(0)) {
      // setInputValue(formatTokenAmount(balance, token));
      // processOnChangeCallback(balance);
      setInputValue(formatTokenAmount(maxTransactionValueConsideringFee, token));
      processOnChangeCallback(balance);
    } else {
      setInputValue("");
      processOnChangeCallback();
    }
    setIsMaxClicked(true);
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
      const { from } = selectedChains;
      const chainTokens = [...getChainCustomTokens(from), ...defaultTokens];
      // console.log("chainTokens when select chain", chainTokens);
      console.log("load all tokens", chainTokens);
      const selectedChainTokens = getSelectedChainTokens(from);
      console.log("selectedChainTokens", selectedChainTokens);
      setToken(getEtherToken(from));

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
    getL2EstimatedGas();
    getL1EstimatedGas();
  }, [getL2EstimatedGas, getL1EstimatedGas]);

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
      {/* <div className={classes.arrowRow}>
        <ArrowDown className={classes.arrowDownIcon} />
      </div> */}
      <Card className={classes.card}>
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
          <div className={classes.toChainRowRightBox}>{inputValue}</div>
        </div>
      </Card>
      {debounceFormData && <BridgeGasFee formData={debounceFormData} l2Gas={l2EstimatedGas} />}
      <div className={classes.button}>
        <Button disabled={!amount || amount.isZero() || inputError !== undefined} type="submit">
          Continue
        </Button>
        {amount && inputError && <ErrorMessage error={inputError} />}
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
