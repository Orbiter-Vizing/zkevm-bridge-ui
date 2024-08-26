import { BigNumber, ethers, utils as ethersUtils } from "ethers";
import { FC, useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { parseError } from "src/adapters/error";
import { getPermit, isContractAllowedToSpendToken } from "src/adapters/ethereum";
import { getCurrency } from "src/adapters/storage";
import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import { ReactComponent as IconBack } from "src/assets/icons/icon-back.svg";
import { FIAT_DISPLAY_PRECISION, getEtherToken } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useFormContext } from "src/contexts/form.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { useUIContext } from "src/contexts/ui.context";
import { AsyncTask, Gas, TokenSpendPermission } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { routes } from "src/routes";
import { Bridge__factory } from "src/types/contracts/bridge";
import { formatFiatAmount, formatTokenAmount, multiplyAmounts } from "src/utils/amounts";
import { calculateMaxTxFee } from "src/utils/fees";
import { getCurrencySymbol } from "src/utils/labels";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import {
  isAsyncTaskDataAvailable,
  isEthersInsufficientFundsError,
  isMetaMaskUserRejectedRequestError,
} from "src/utils/types";
import { useBridgeConfirmationStyles } from "src/views/bridge-confirmation/bridge-confirmation.styles";
import { ApprovalInfo } from "src/views/bridge-confirmation/components/approval-info/approval-info.view";
import { BridgeButton } from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { PageLoader } from "src/views/shared/page-loader/page-loader.view";

export const BridgeConfirmation: FC = () => {
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeConfirmationStyles();
  const navigate = useNavigate();
  const { state } = useLocation();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, estimateBridgeGas, estimateVizingBridgeGas } = useBridgeContext();
  const { formData, setFormData } = useFormContext();
  // const { openSnackbar } = useUIContext();
  const { connectedProvider } = useProvidersContext();
  const { getTokenPrice } = usePriceOracleContext();
  const { approve, getErc20TokenBalance, tokens } = useTokensContext();
  const [isBridgeInProgress, setIsBridgeInProgress] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<BigNumber>();
  const [maxAmountConsideringFee, setMaxAmountConsideringFee] = useState<BigNumber>();
  const [bridgedTokenFiatPrice, setBridgedTokenFiatPrice] = useState<BigNumber>();
  const [etherTokenFiatPrice, setEtherTokenFiatPrice] = useState<BigNumber>();
  const [error, setError] = useState<string>();
  const [tokenSpendPermission, setTokenSpendPermission] = useState<TokenSpendPermission>();
  const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
    status: "pending",
  });
  const [estimatedGas, setEstimatedGas] = useState<AsyncTask<Gas, string>>({
    status: "pending",
  });
  const currencySymbol = getCurrencySymbol(getCurrency());
  const homeRoute = routes["home"].path;

  const getL2EstimatedGas = useCallback(async () => {
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
    // Estimate L2 gas like L1
    const estimateAmount = BigNumber.from(1);
    console.log("Estimate L2 gas connectedProvider", connectedProvider);
    console.log("Estimate L2 gas bridgeChain", bridgeChain);
    console.log("Estimate L2 gas vizingChain", vizingChain);
    // console.log("Estimate L2 gas token", token);
    console.log("Estimate L2 gas amount", estimateAmount);
    if (
      connectedProvider.status === "successful" &&
      bridgeChain &&
      vizingChain &&
      tokenBalance &&
      formData
    ) {
      const { amount, token } = formData;
      const account = connectedProvider.data.account;
      // temp implementation, for test consideration
      // cuz linea test env is not config yet
      const contractAddress = bridgeChain.bridgeContractAddress;
      // if (from.key === "vizing") {
      //   contractAddress = from.omniContractAddress;
      // }
      const provider = bridgeChain.provider;
      // contractAddress and provider need to be pair
      // const provider = connectedProvider.data.provider;
      console.log("let contractAddress", contractAddress);
      console.log("L2 Bridge__factory contractAddress", contractAddress);
      // console.log("getL2EstimatedGas from chain", from);
      // console.log("getL2EstimatedGas to chain", to);
      const contract = Bridge__factory.connect(contractAddress, provider);

      const fakePostMessage = ethersUtils.solidityPack(
        ["uint8", "uint256", "uint24"],
        [4, account, 50000]
      );

      try {
        const vizingValue = await contract.functions.estimateGas(
          estimateAmount,
          vizingChain.chainId,
          ethers.constants.AddressZero,
          fakePostMessage
        );
      } catch (error) {
        console.error("confirmation estimate l2 gas error", error);
      }

      const vizingValue = await contract.functions.estimateGas(
        estimateAmount,
        vizingChain.chainId,
        ethers.constants.AddressZero,
        fakePostMessage
      );
      console.log("deposit vizingValue", vizingValue[0]);
      console.log("seposit user amount", estimateAmount);
      const totalValue = vizingValue[0].add(estimateAmount);
      estimateVizingBridgeGas({
        account,
        destinationAddress: connectedProvider.data.account,
        from: bridgeChain,
        to: vizingChain,
        token,
        totalValue,
        userInputValue: estimateAmount,
      })
        .then((gas: Gas) => {
          const newFee = calculateMaxTxFee(gas);
          console.log("getL2EstimatedGas gas", gas);
          console.log("getL2EstimatedGas gas format", formatTokenAmount(gas.data.gasLimit, token));
          console.log("getL2EstimatedGas newFee format", formatTokenAmount(newFee, token));
          // setL2EstimatedGas(newFee);
          // if (!newFee) {
          //   setEstimatedGas({ error: "Gas data is not available", status: "failed" });
          // }

          const newMaxAmountConsideringFee = (() => {
            if (isTokenEther(token)) {
              const amountConsideringFee = amount.add(newFee);
              const tokenBalanceRemainder = amountConsideringFee.sub(tokenBalance);
              const doesAmountExceedsTokenBalance = tokenBalanceRemainder.isNegative();
              const newMaxAmountConsideringFee = !doesAmountExceedsTokenBalance
                ? amount.sub(tokenBalanceRemainder)
                : amount;

              return newMaxAmountConsideringFee;
            } else {
              return amount;
            }
          })();

          setMaxAmountConsideringFee(newMaxAmountConsideringFee);
          setEstimatedGas({ data: gas, status: "successful" });
        })
        .catch((error) => {
          console.error("Get L2 estimated gas failed:", error);
        });
    }
  }, [env, estimateVizingBridgeGas, formData, connectedProvider, tokenBalance]);

  useEffect(() => {
    if (
      connectedProvider.status === "successful" &&
      estimatedGas.status === "pending" &&
      formData &&
      tokenBalance &&
      tokenSpendPermission
    ) {
      const { amount, from, to, token } = formData;
      const destinationAddress = connectedProvider.data.account;

      setEstimatedGas({ status: "loading" });

      // add estimate l2 gas
      if (from.key === "ethereum" || to.key === "ethereum") {
        void estimateBridgeGas({
          destinationAddress,
          from,
          to,
          token,
          tokenSpendPermission,
        })
          .then((gas: Gas) => {
            const newFee = calculateMaxTxFee(gas);

            if (!newFee) {
              setEstimatedGas({ error: "Gas data is not available", status: "failed" });
            }

            const newMaxAmountConsideringFee = (() => {
              if (isTokenEther(token)) {
                const amountConsideringFee = amount.add(newFee);
                const tokenBalanceRemainder = amountConsideringFee.sub(tokenBalance);
                const doesAmountExceedsTokenBalance = tokenBalanceRemainder.isNegative();
                const newMaxAmountConsideringFee = !doesAmountExceedsTokenBalance
                  ? amount.sub(tokenBalanceRemainder)
                  : amount;

                return newMaxAmountConsideringFee;
              } else {
                return amount;
              }
            })();

            setMaxAmountConsideringFee(newMaxAmountConsideringFee);
            setEstimatedGas({ data: gas, status: "successful" });
          })
          .catch((error) => {
            if (isEthersInsufficientFundsError(error)) {
              callIfMounted(() => {
                setEstimatedGas({
                  error: "You don't have enough ETH to pay for the fees",
                  status: "failed",
                });
              });
            } else {
              callIfMounted(() => {
                notifyError(error);
              });
            }
          });
      } else {
        void getL2EstimatedGas();
      }
    }
  }, [
    callIfMounted,
    connectedProvider,
    estimateBridgeGas,
    estimatedGas,
    formData,
    notifyError,
    tokenBalance,
    tokenSpendPermission,
    getL2EstimatedGas,
  ]);

  useEffect(() => {
    // Load the balance of the token when it's not available
    if (formData?.token.balance && isAsyncTaskDataAvailable(formData.token.balance)) {
      setTokenBalance(formData.token.balance.data);
    } else if (formData && connectedProvider.status === "successful") {
      const { from, token } = formData;

      if (isTokenEther(token)) {
        void from.provider
          .getBalance(connectedProvider.data.account)
          .then((balance) =>
            callIfMounted(() => {
              setTokenBalance(balance);
            })
          )
          .catch((error) => {
            callIfMounted(() => {
              notifyError(error);
              setTokenBalance(undefined);
            });
          });
      } else {
        getErc20TokenBalance({
          accountAddress: connectedProvider.data.account,
          chain: from,
          tokenAddress: selectTokenAddress(token, from),
        })
          .then((balance) =>
            callIfMounted(() => {
              setTokenBalance(balance);
            })
          )
          .catch(() =>
            callIfMounted(() => {
              setTokenBalance(undefined);
            })
          );
      }
    }
  }, [connectedProvider, formData, getErc20TokenBalance, notifyError, callIfMounted]);

  useEffect(() => {
    if (connectedProvider.status === "successful" && formData) {
      const { amount, from, token } = formData;

      if (isTokenEther(token)) {
        setTokenSpendPermission({ type: "none" });
      } else {
        isContractAllowedToSpendToken({
          amount: amount,
          from: from,
          owner: connectedProvider.data.account,
          provider: from.provider,
          spender: from.bridgeContractAddress,
          token: token,
        })
          .then((isAllowed) => {
            callIfMounted(() => {
              if (isAllowed) {
                setTokenSpendPermission({ type: "none" });
              } else {
                getPermit({
                  chain: from,
                  token,
                })
                  .then((permit) => {
                    callIfMounted(() => {
                      setTokenSpendPermission({ permit, type: "permit" });
                    });
                  })
                  .catch(() => {
                    setTokenSpendPermission({ type: "approval" });
                  });
              }
            });
          })
          .catch(notifyError);
      }
    }
  }, [formData, connectedProvider, notifyError, callIfMounted]);

  useEffect(() => {
    if (
      connectedProvider.status === "successful" &&
      formData &&
      formData.from.chainId === connectedProvider.data.chainId
    ) {
      setError(undefined);
    }
  }, [connectedProvider, formData]);

  useEffect(() => {
    if (!formData) {
      navigate(routes.home.path);
    }
  }, [navigate, formData]);

  useEffect(() => {
    if (formData) {
      const { from, token } = formData;
      const etherToken = getEtherToken(from);

      // Get the fiat price of Ether
      getTokenPrice({ chain: from, token: etherToken })
        .then((etherPrice) => {
          callIfMounted(() => {
            setEtherTokenFiatPrice(etherPrice);
            if (isTokenEther(token)) {
              setBridgedTokenFiatPrice(etherPrice);
            }
          });
        })
        .catch(() =>
          callIfMounted(() => {
            setEtherTokenFiatPrice(undefined);
            if (isTokenEther(token)) {
              setBridgedTokenFiatPrice(undefined);
            }
          })
        );

      // Get the fiat price of the bridged token when it's not Ether
      if (!isTokenEther(token)) {
        getTokenPrice({ chain: from, token })
          .then((tokenPrice) => {
            callIfMounted(() => {
              setBridgedTokenFiatPrice(tokenPrice);
            });
          })
          .catch(() =>
            callIfMounted(() => {
              setBridgedTokenFiatPrice(undefined);
            })
          );
      }
    }
  }, [formData, tokens, estimatedGas, getTokenPrice, callIfMounted]);

  const onApprove = () => {
    if (isAsyncTaskDataAvailable(connectedProvider) && formData) {
      setApprovalTask({ status: "loading" });
      const { amount, from, token } = formData;
      void approve({
        amount,
        from,
        owner: connectedProvider.data.account,
        provider: connectedProvider.data.provider,
        spender: from.bridgeContractAddress,
        token,
      })
        .then(() => {
          callIfMounted(() => {
            setApprovalTask({ data: null, status: "successful" });
            setTokenSpendPermission({ type: "none" });
          });
        })
        .catch((error) => {
          callIfMounted(() => {
            if (isMetaMaskUserRejectedRequestError(error)) {
              setApprovalTask({ status: "pending" });
            } else {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${from.name} to continue`);
                  setApprovalTask({ status: "pending" });
                } else {
                  setApprovalTask({ error: parsed, status: "failed" });
                  notifyError(parsed);
                }
              });
            }
          });
        });
    }
  };

  const onBridge = () => {
    console.log("onBridge formData", formData);
    if (
      formData &&
      isAsyncTaskDataAvailable(connectedProvider) &&
      isAsyncTaskDataAvailable(estimatedGas) &&
      maxAmountConsideringFee &&
      tokenSpendPermission
    ) {
      const { from, to, token } = formData;

      setIsBridgeInProgress(true);

      bridge({
        amount: maxAmountConsideringFee,
        destinationAddress: connectedProvider.data.account,
        from,
        gas: estimatedGas.data,
        to,
        token,
        tokenSpendPermission,
      })
        .then(() => {
          // openSnackbar({
          //   text: "Transaction successfully submitted",
          //   type: "success-msg",
          // });
          // navigate(routes.activity.path);
          navigate(routes.home.path);
          console.log("successfully tx");
          setFormData(undefined);
        })
        .catch((error) => {
          callIfMounted(() => {
            setIsBridgeInProgress(false);
            if (isMetaMaskUserRejectedRequestError(error) === false) {
              void parseError(error).then((parsed) => {
                if (parsed === "wrong-network") {
                  setError(`Switch to ${from.name} to continue`);
                } else {
                  notifyError(error);
                }
              });
            }
          });
        });
    }
  };

  const onBackToHome = () => {
    setFormData(undefined);
  };

  console.log("bridge gas fee render3");
  console.log("env", env);
  console.log("formData", formData);
  console.log("tokenBalance", tokenBalance);
  console.log("isAsyncTaskDataAvailable(estimatedGas)", isAsyncTaskDataAvailable(estimatedGas));
  console.log("maxAmountConsideringFee", maxAmountConsideringFee);
  console.log("tokenSpendPermission", tokenSpendPermission);
  console.log("estimatedGas", estimatedGas);

  if (
    !env ||
    !formData ||
    !tokenBalance ||
    !isAsyncTaskDataAvailable(estimatedGas) ||
    !maxAmountConsideringFee ||
    !tokenSpendPermission
  ) {
    return <PageLoader />;
  }

  const { from, to, token } = formData;
  const etherToken = getEtherToken(from);

  // const fiatAmount =
  //   bridgedTokenFiatPrice &&
  //   multiplyAmounts(
  //     {
  //       precision: FIAT_DISPLAY_PRECISION,
  //       value: bridgedTokenFiatPrice,
  //     },
  //     {
  //       precision: token.decimals,
  //       value: maxAmountConsideringFee,
  //     },
  //     FIAT_DISPLAY_PRECISION
  //   );

  const fee = calculateMaxTxFee(estimatedGas.data);
  const fiatFee =
    env.fiatExchangeRates.areEnabled &&
    etherTokenFiatPrice &&
    multiplyAmounts(
      {
        precision: FIAT_DISPLAY_PRECISION,
        value: etherTokenFiatPrice,
      },
      {
        precision: etherToken.decimals,
        value: fee,
      },
      FIAT_DISPLAY_PRECISION
    );
  console.log("fiat:", fiatFee);
  // const tokenAmountString = `${
  //   maxAmountConsideringFee.gt(0) ? formatTokenAmount(maxAmountConsideringFee, token) : "0"
  // } ${token.symbol}`;

  // const fiatAmountString = env.fiatExchangeRates.areEnabled
  //   ? `${currencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
  //   : undefined;

  const absMaxPossibleAmountConsideringFee = formatTokenAmount(
    maxAmountConsideringFee.abs(),
    etherToken
  );

  const feeBaseErrorString = "You don't have enough ETH to cover the transaction fee";
  const feeErrorString = maxAmountConsideringFee.isNegative()
    ? `${feeBaseErrorString}\nYou need at least ${absMaxPossibleAmountConsideringFee} extra ETH`
    : maxAmountConsideringFee.eq(0)
    ? `${feeBaseErrorString}\nThe maximum transferable amount is 0 after considering the fee`
    : undefined;

  // mark
  const etherFeeString = `${formatTokenAmount(fee, etherToken)} ${etherToken.symbol}`;
  const fiatFeeString = fiatFee ? `${currencySymbol}${formatFiatAmount(fiatFee)}` : undefined;
  const feeString = fiatFeeString ? `${etherFeeString} ~ ${fiatFeeString}` : etherFeeString;
  console.log("before calculate amountString", formData.amount, token);
  console.log(
    "before calculate amountString in read",
    ethers.utils.formatUnits(formData.amount, token.decimals)
  );
  const amountString = `${formatTokenAmount(formData.amount, token)} ${token.symbol}`;

  return (
    <div className={classes.contentWrapper}>
      <div className={classes.header}>
        <Link onClick={onBackToHome} state={state} to={homeRoute}>
          <span className={classes.iconWrap}>
            <IconBack />
          </span>
        </Link>
        <p className={classes.headerText}>Confirm Bridge</p>
      </div>
      <div className={classes.chainsRow}>
        <div className={classes.chainBox}>
          <from.Icon className={classes.chainIcon} />
          <p className={classes.chainName}>{from.name}</p>
        </div>
        <ArrowRightIcon className={classes.arrowIcon} />
        <div className={classes.chainBox}>
          <to.Icon className={classes.chainIcon} />
          <p className={classes.chainName}>{to.name}</p>
        </div>
      </div>
      <div className={classes.bridgeDetail}>
        <div className={classes.detailRow}>
          <div className={classes.detailName}>Amount to deposit</div>
          <div className={classes.detailData}>
            <div className={classes.tokenData}>{amountString}</div>
          </div>
        </div>
        <div className={classes.detailRow}>
          <div className={classes.detailName}>Estimated gas fee</div>
          <div className={classes.detailData}>
            <div className={classes.tokenData}>{feeString}</div>
            {/* <div className={classes.dollarData}>$64.62</div> */}
          </div>
        </div>
        <div className={classes.detailRow}>
          <div className={classes.detailName}>Time to transfer</div>
          <div className={classes.detailData}>
            <div className={classes.tokenData}>~1 minute</div>
          </div>
        </div>
      </div>
      <div className={classes.button}>
        <BridgeButton
          approvalTask={approvalTask}
          isDisabled={maxAmountConsideringFee.lte(0) || isBridgeInProgress}
          isTxApprovalRequired={tokenSpendPermission.type === "approval"}
          onApprove={onApprove}
          onBridge={onBridge}
          token={token}
        />
        {tokenSpendPermission.type === "approval" && <ApprovalInfo />}
        {error && <ErrorMessage error={error} />}
      </div>
      {feeErrorString && <ErrorMessage className={classes.error} error={feeErrorString} />}
    </div>
  );
};
