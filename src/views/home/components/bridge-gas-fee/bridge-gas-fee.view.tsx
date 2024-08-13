import { BigNumber } from "ethers";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { parseError } from "src/adapters/error";
import { getPermit, isContractAllowedToSpendToken } from "src/adapters/ethereum";
import { getCurrency } from "src/adapters/storage";
import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
import { ETH_TOKEN_LOGO_URI, FIAT_DISPLAY_PRECISION, getEtherToken } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useErrorContext } from "src/contexts/error.context";
import { useFormContext } from "src/contexts/form.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { useUIContext } from "src/contexts/ui.context";
import { AsyncTask, Chain, FormData, Gas, Token, TokenSpendPermission } from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { routes } from "src/routes";
import { formatFiatAmount, formatTokenAmount, multiplyAmounts } from "src/utils/amounts";
import { calculateMaxTxFee } from "src/utils/fees";
import { getCurrencySymbol } from "src/utils/labels";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import {
  isAsyncTaskDataAvailable,
  isEthersInsufficientFundsError,
  isMetaMaskUserRejectedRequestError,
} from "src/utils/types";
import { ApprovalInfo } from "src/views/bridge-confirmation/components/approval-info/approval-info.view";
import { BridgeButton } from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
import { useBridgeGasFeeStyles } from "src/views/home/components/bridge-gas-fee/bridge-gas-fee.styles";
import { Card } from "src/views/shared/card/card.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Header } from "src/views/shared/header/header.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { PageLoader } from "src/views/shared/page-loader/page-loader.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface BridgeGasFeeProps {
  formData: FormData;
  // amount: BigNumber;
  // fromChain: Chain;
  // toChain: Chain;
  // transactionToken: Token;
}

export const BridgeGasFee: FC<BridgeGasFeeProps> = ({
  // amount,
  // fromChain,
  // toChain,
  // transactionToken,
  formData,
}) => {
  // export const BridgeGasFee: FC = () => {
  console.log("bridgeGasFee render", formData.amount);
  const callIfMounted = useCallIfMounted();
  const classes = useBridgeGasFeeStyles();
  const navigate = useNavigate();
  const env = useEnvContext();
  const { notifyError } = useErrorContext();
  const { bridge, estimateBridgeGas } = useBridgeContext();
  // const { formData, setFormData } = useFormContext();
  const { openSnackbar } = useUIContext();
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
  const currencySymbol = "$";

  console.log("bridge gas fee render1");

  useEffect(() => {
    const hexValue = formData.amount._hex;
    const decimalValue = BigInt(hexValue);
    console.log("new amount", decimalValue.toString());
    console.log("EstimatedGas need to change", formData.amount);
    console.log("connectedProvider.status", connectedProvider.status);
    console.log("estimatedGas.status", estimatedGas.status);
    console.log("fromData", formData);
    console.log("tokenBalance", tokenBalance);
    console.log("tokenSpendPermission", tokenSpendPermission);
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
  ]);

  useEffect(() => {
    console.log("spy in bridgeGasFee, set pending");
    setEstimatedGas({ status: "pending" });
  }, [formData]);

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

  console.log("bridge gas fee render2");

  useEffect(() => {
    if (!formData) {
      navigate(routes.home.path);
    }
  }, [navigate, formData]);

  useEffect(() => {
    console.log("just spy formData");
  }, [formData]);

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

  // const onBridge = () => {
  //   if (
  //     formData &&
  //     isAsyncTaskDataAvailable(connectedProvider) &&
  //     isAsyncTaskDataAvailable(estimatedGas) &&
  //     maxAmountConsideringFee &&
  //     tokenSpendPermission
  //   ) {
  //     const { from, to, token } = formData;

  //     setIsBridgeInProgress(true);

  //     bridge({
  //       amount: maxAmountConsideringFee,
  //       destinationAddress: connectedProvider.data.account,
  //       from,
  //       gas: estimatedGas.data,
  //       to,
  //       token,
  //       tokenSpendPermission,
  //     })
  //       .then(() => {
  //         openSnackbar({
  //           text: "Transaction successfully submitted",
  //           type: "success-msg",
  //         });
  //         navigate(routes.activity.path);
  //         setFormData(undefined);
  //       })
  //       .catch((error) => {
  //         callIfMounted(() => {
  //           setIsBridgeInProgress(false);
  //           if (isMetaMaskUserRejectedRequestError(error) === false) {
  //             void parseError(error).then((parsed) => {
  //               if (parsed === "wrong-network") {
  //                 setError(`Switch to ${from.name} to continue`);
  //               } else {
  //                 notifyError(error);
  //               }
  //             });
  //           }
  //         });
  //       });
  //   }
  // };

  console.log("bridge gas fee render3");
  console.log("env", env);
  console.log("formData", formData);
  console.log("tokenBalance", tokenBalance);
  console.log("isAsyncTaskDataAvailable(estimatedGas)", isAsyncTaskDataAvailable(estimatedGas));
  console.log("maxAmountConsideringFee", maxAmountConsideringFee);
  console.log("tokenSpendPermission", tokenSpendPermission);
  console.log("estimatedGas", estimatedGas);
  // setTimeout(() => {
  //   console.log("formData in ges fee", formData);
  // }, 3000);

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

  console.log("bridge gas fee render4");

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
  // const fiatFee =
  //   true &&
  //   etherTokenFiatPrice &&
  //   multiplyAmounts(
  //     {
  //       precision: FIAT_DISPLAY_PRECISION,
  //       value: etherTokenFiatPrice,
  //     },
  //     {
  //       precision: etherToken.decimals,
  //       value: fee,
  //     },
  //     FIAT_DISPLAY_PRECISION
  //   );
  // console.log("fiat:", fiatFee);
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
  console.log("gas fee before format", fee);
  console.log("gas fee token", etherToken);
  const etherFeeString = `${formatTokenAmount(fee, etherToken)} ${etherToken.symbol}`;
  // const fiatFee =
  const fiatFeeString = `${currencySymbol}${123}`;
  // const fiatFeeString = fiatFee ? `${currencySymbol}${formatFiatAmount(fiatFee)}` : undefined;
  const feeString = etherFeeString;

  console.log("feeString at last", feeString);

  return (
    <div className={classes.wrapper}>
      <div className={classes.row}>
        <div className={classes.dataName}>Estimated gas fee</div>
        <div className={classes.data}>
          <span className={classes.dataEth}>~{feeString}</span>
        </div>
      </div>
      <div className={classes.row}>
        <div className={classes.dataName}>Time to transfer</div>
        <div className={`${classes.data} ${classes.dataTime}`}>~1 minute</div>
      </div>
    </div>
  );
};

// new gas fee
// import { BigNumber } from "ethers";
// import { FC, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { parseError } from "src/adapters/error";
// import { getPermit, isContractAllowedToSpendToken } from "src/adapters/ethereum";
// import { getCurrency } from "src/adapters/storage";
// import { ReactComponent as ArrowRightIcon } from "src/assets/icons/arrow-right.svg";
// import { getEtherToken } from "src/constants";
// import { useBridgeContext } from "src/contexts/bridge.context";
// import { useEnvContext } from "src/contexts/env.context";
// import { useErrorContext } from "src/contexts/error.context";
// import { useFormContext } from "src/contexts/form.context";
// import { usePriceOracleContext } from "src/contexts/price-oracle.context";
// import { useProvidersContext } from "src/contexts/providers.context";
// import { useTokensContext } from "src/contexts/tokens.context";
// import { useUIContext } from "src/contexts/ui.context";
// import { AsyncTask, FormData, Gas, TokenSpendPermission } from "src/domain";
// import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
// import { routes } from "src/routes";
// import { formatFiatAmount, formatTokenAmount, multiplyAmounts } from "src/utils/amounts";
// import { calculateMaxTxFee } from "src/utils/fees";
// import { getCurrencySymbol } from "src/utils/labels";
// import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
// import {
//   isAsyncTaskDataAvailable,
//   isEthersInsufficientFundsError,
//   isMetaMaskUserRejectedRequestError,
// } from "src/utils/types";
// import { useBridgeConfirmationStyles } from "src/views/bridge-confirmation/bridge-confirmation.styles";
// import { ApprovalInfo } from "src/views/bridge-confirmation/components/approval-info/approval-info.view";
// import { BridgeButton } from "src/views/bridge-confirmation/components/bridge-button/bridge-button.view";
// import { useBridgeGasFeeStyles } from "src/views/home/components/bridge-gas-fee/bridge-gas-fee.styles";
// import { Card } from "src/views/shared/card/card.view";
// import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
// import { Header } from "src/views/shared/header/header.view";
// import { Icon } from "src/views/shared/icon/icon.view";
// import { PageLoader } from "src/views/shared/page-loader/page-loader.view";
// import { Typography } from "src/views/shared/typography/typography.view";

// interface BridgeGasFeeProps {
//   example?: string;
// }

// export const BridgeGasFee: FC<BridgeGasFeeProps> = ({ example }) => {
//   const classes = useBridgeGasFeeStyles();

//   const { formData, setFormData } = useFormContext();
//   const { connectedProvider } = useProvidersContext();
//   const [estimatedGas, setEstimatedGas] = useState<AsyncTask<Gas, string>>({
//     status: "pending",
//   });
//   const [tokenBalance, setTokenBalance] = useState<BigNumber>();
//   const [tokenSpendPermission, setTokenSpendPermission] = useState<TokenSpendPermission>();
//   const callIfMounted = useCallIfMounted();
//   const navigate = useNavigate();
//   const env = useEnvContext();
//   const { notifyError } = useErrorContext();
//   const { bridge, estimateBridgeGas } = useBridgeContext();
//   const { openSnackbar } = useUIContext();
//   const { getTokenPrice } = usePriceOracleContext();
//   const { approve, getErc20TokenBalance, tokens } = useTokensContext();
//   const [isBridgeInProgress, setIsBridgeInProgress] = useState(false);
//   const [maxAmountConsideringFee, setMaxAmountConsideringFee] = useState<BigNumber>();
//   const [bridgedTokenFiatPrice, setBridgedTokenFiatPrice] = useState<BigNumber>();
//   const [etherTokenFiatPrice, setEtherTokenFiatPrice] = useState<BigNumber>();
//   const [error, setError] = useState<string>();
//   const [approvalTask, setApprovalTask] = useState<AsyncTask<null, string>>({
//     status: "pending",
//   });
//   const currencySymbol = getCurrencySymbol(getCurrency());

//   useEffect(() => {
//     if (
//       connectedProvider.status === "successful" &&
//       estimatedGas.status === "pending" &&
//       formData &&
//       tokenBalance &&
//       tokenSpendPermission
//     ) {
//       const { amount, from, to, token } = formData;
//       const destinationAddress = connectedProvider.data.account;

//       setEstimatedGas({ status: "loading" });

//       void estimateBridgeGas({
//         destinationAddress,
//         from,
//         to,
//         token,
//         tokenSpendPermission,
//       })
//         .then((gas: Gas) => {
//           const newFee = calculateMaxTxFee(gas);

//           if (!newFee) {
//             setEstimatedGas({ error: "Gas data is not available", status: "failed" });
//           }

//           const newMaxAmountConsideringFee = (() => {
//             if (isTokenEther(token)) {
//               const amountConsideringFee = amount.add(newFee);
//               const tokenBalanceRemainder = amountConsideringFee.sub(tokenBalance);
//               const doesAmountExceedsTokenBalance = tokenBalanceRemainder.isNegative();
//               const newMaxAmountConsideringFee = !doesAmountExceedsTokenBalance
//                 ? amount.sub(tokenBalanceRemainder)
//                 : amount;

//               return newMaxAmountConsideringFee;
//             } else {
//               return amount;
//             }
//           })();

//           setMaxAmountConsideringFee(newMaxAmountConsideringFee);
//           setEstimatedGas({ data: gas, status: "successful" });
//         })
//         .catch((error) => {
//           if (isEthersInsufficientFundsError(error)) {
//             callIfMounted(() => {
//               setEstimatedGas({
//                 error: "You don't have enough ETH to pay for the fees",
//                 status: "failed",
//               });
//             });
//           } else {
//             callIfMounted(() => {
//               notifyError(error);
//             });
//           }
//         });
//     }
//   }, [
//     callIfMounted,
//     connectedProvider,
//     estimateBridgeGas,
//     estimatedGas,
//     formData,
//     notifyError,
//     tokenBalance,
//     tokenSpendPermission,
//   ]);

//   if (!formData) {
//     return <></>;
//   }
//   const fee = calculateMaxTxFee(estimatedGas.data);
//   const etherToken = getEtherToken(formData.from);
//   const etherFeeString = `${formatTokenAmount(fee, etherToken)} ${etherToken.symbol}`;

//   return (
//     <div className={classes.wrapper}>
//       <div className={classes.row}>
//         <div className={classes.dataName}>Estimated gas fee</div>
//         <div className={classes.data}>
//           <span className={classes.dataEth}>~0.00514054446655543 ETH </span>
//           <span className={classes.dataDollar}>($16.52)</span>
//         </div>
//       </div>
//       <div className={classes.row}>
//         <div className={classes.dataName}>Time to transfer</div>
//         <div className={`${classes.data} ${classes.dataTime}`}>~1 minute</div>
//       </div>
//     </div>
//   );
// };
