import { BigNumber } from "ethers";
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
import * as constants from "src/constants";
import { getEtherToken } from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { AsyncTask, Chain, FormData, PolicyCheck, Token, WalletName } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { useDebounce } from "src/hooks/use-debounce";
import { formatTokenAmount } from "src/utils/amounts";
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
const DEPOSIT_FEE = 0.00005; // eth unit

export const DefaultBridgeDepositForm: FC<DefaultBridgeDepositFormProps> = ({
  // account,
  formData,
  onResetForm,
  // onSubmit,
}) => {
  const classes = useDefaultBridgeDepositFormStyles();
  const callIfMounted = useCallIfMounted();
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
      processOnChangeCallback(amount);
    }
  };

  const getClaimBalance = () => {
    const userInputNumber = Number(inputValue);
    if (userInputNumber < DEPOSIT_FEE) {
      return 0;
    }
    return userInputNumber - DEPOSIT_FEE;
  };

  const handleConnectWallet = () => {
    console.log("connect wallet click");
    onCheckAndConnectProvider();
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
      console.log("chainTokens when select chain", chainTokens);
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
          <div className={classes.toChainRowRightBox}>{inputValue ? getClaimBalance() : 0}</div>
        </div>
      </Card>
      {debounceFormData && <BridgeGasFee formData={debounceFormData} />}
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
