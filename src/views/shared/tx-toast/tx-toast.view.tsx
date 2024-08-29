import { FC, useEffect, useState } from "react";
import { Id, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { TxToastContent } from "../tx-toast-content/tx-toast-content.view";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { TxStatus, useTxStatusContext } from "src/contexts/tx-status.context";
import { useTxToastStyles } from "src/views/shared/tx-toast/tx-toast.styles";

interface TxToastProps {
  example?: string;
}

interface TargetTxInterface {
  claimHash: string;
  explorerUrl: string;
  hash: string;
  toastId: Id;
}

export const PAGE_SIZE = 10;

export const TxToast: FC<TxToastProps> = ({ example }) => {
  // const classes = useTxToastStyles();
  const env = useEnvContext();
  const { connectedProvider } = useProvidersContext();
  const { setTxQueue, txQueue } = useTxStatusContext();
  const { fetchBridges } = useBridgeContext();
  // const
  // const [ intervalTaskId, setInternalTaskId ] = useState<NodeJS.Timer>()

  useEffect(() => {
    // this effect is for update toast
    console.log("txqueue change", txQueue);
    // if(intervalTaskId) {
    //   clearInterval(intervalTaskId)
    // }
    console.log("check txQueue before start", txQueue);
    if (txQueue.length <= 0) {
      return;
    }
    const intervalId = setTimeout(() => {
      // request list
      if (env && connectedProvider.status === "successful") {
        // const abortSignal = new AbortController();
        console.log("request list");
        fetchBridges({
          // abortSignal,
          env,
          ethereumAddress: connectedProvider.data.account,
          limit: PAGE_SIZE,
          offset: 0,
          type: "load",
        })
          .then(({ bridges, total }) => {
            console.log("get bridges in interval", bridges);
            let targetTx: TargetTxInterface | undefined;
            const leftTxQueue: TxStatus[] = [];
            txQueue.forEach((txInfo) => {
              console.log("standard-bridge-sss", txInfo.hash);
              bridges.forEach((bridge) => {
                console.log("compare bridge.depositTxHash", bridge.depositTxHash);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (bridge.depositTxHash === txInfo.hash && bridge.claimTxHash) {
                  targetTx = {
                    ...txInfo,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    claimHash: bridge.claimTxHash,

                    explorerUrl: bridge.to.explorerUrl,
                  };
                }
              });
              if (targetTx) {
                console.log("find target tx", targetTx);
                toast.update(targetTx.toastId, {
                  autoClose: 3000,
                  isLoading: false,
                  // render: `${targetTx.claimHash} success`,
                  render: (
                    <TxToastContent
                      explorerUrl={targetTx.explorerUrl}
                      text={targetTx.claimHash}
                      title="Transaction Successful"
                      type="success"
                    />
                  ),
                  type: "default",
                });
                targetTx = undefined;
              } else {
                leftTxQueue.push(txInfo);
              }
            });
            setTxQueue(leftTxQueue);
          })
          .catch((error) => {
            console.log("error in tx-toast", error);
          });
      }
    }, 15000);
    // setInternalTaskId(intervalId)
    // return () => {
    //   clearInterval(intervalId);
    // };
  }, [txQueue, fetchBridges, env, connectedProvider, setTxQueue]);

  useEffect(() => {
    // this effect is for setting new toast
    // const id = toast.loading("Please wait...");
    //do something else
    // toast.update(id, { render: "All is good", type: "success", isLoading: false });
  }, [txQueue]);

  return (
    <div>
      <ToastContainer
        autoClose={false}
        closeOnClick
        draggable
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnFocusLoss
        pauseOnHover
        position="top-right"
        rtl={false}
        theme="dark"
      />
    </div>
  );
};
