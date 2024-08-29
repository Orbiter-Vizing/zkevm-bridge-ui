import dayjs from "dayjs";
import { BigNumber } from "ethers";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBatchNumberOfL2Block } from "src/adapters/ethereum";
import { getCurrency } from "src/adapters/storage";
import { ReactComponent as NetIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as BridgeL1Icon } from "src/assets/icons/l1-bridge.svg";
import { ReactComponent as BridgeL2Icon } from "src/assets/icons/l2-bridge.svg";
import {
  ReactComponent as AmountTokenIcon,
  ReactComponent as TokenIcon,
} from "src/assets/icons/tokens/erc20-icon.svg";
import { ReactComponent as WithdrawPendingIcon } from "src/assets/icons/withdraw-pending.svg";
import { ReactComponent as WithdrawSuccessIcon } from "src/assets/icons/withdraw-success.svg";
import { AsyncTask, Bridge, Env, InitiatedBridge, OnHoldBridge, PendingBridge } from "src/domain";
import { routes } from "src/routes";
import { formatFiatAmount, formatTokenAmount } from "src/utils/amounts";
import { getBridgeStatus, getCurrencySymbol } from "src/utils/labels";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import { usePendingListCardStyles } from "src/views/home/components/pending-list-card2/pending-list-card.styles";
import { PendingStatusIcon } from "src/views/home/components/pending-status-icon/pending-status-icon.view";
import { Card } from "src/views/shared/card/card.view";
import { ErrorMessage } from "src/views/shared/error-message/error-message.view";
import { Icon } from "src/views/shared/icon/icon.view";
import { Typography } from "src/views/shared/typography/typography.view";
// old pending list card import

export interface PendingListCardProps {
  bridge: Bridge;
  env: Env;
  isFinaliseDisabled: boolean;
  lastVerifiedBatch: AsyncTask<BigNumber, string>;
  networkError: boolean;
  onClaim?: () => void;
  showFiatAmount: boolean;
}

export const PendingListCard: FC<PendingListCardProps> = ({
  bridge,
  env,
  isFinaliseDisabled,
  lastVerifiedBatch,
  networkError,
  onClaim,
  showFiatAmount,
}) => {
  const { amount, fiatAmount, from, status, to, token } = bridge;
  const classes = usePendingListCardStyles();
  const navigate = useNavigate();
  const [batchNumberOfL2Block, setBatchNumberOfL2Block] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });

  const [blockNumber, fromKey] =
    bridge.status !== "pending" ? [bridge.blockNumber, bridge.from.key] : [undefined, undefined];

  useEffect(() => {
    if (status === "initiated" && fromKey === "vizing") {
      setBatchNumberOfL2Block((currentBatchNumberOfL2Block) =>
        isAsyncTaskDataAvailable(currentBatchNumberOfL2Block)
          ? { data: currentBatchNumberOfL2Block.data, status: "reloading" }
          : { status: "loading" }
      );
      getBatchNumberOfL2Block(env.chains[1].provider, blockNumber)
        .then((newBatchNumberOfL2Block) => {
          setBatchNumberOfL2Block({
            data: newBatchNumberOfL2Block,
            status: "successful",
          });
        })
        .catch(() => {
          setBatchNumberOfL2Block({
            error: "An error occurred getting the batch number of the L2 block",
            status: "failed",
          });
        });
    }
  }, [blockNumber, env, fromKey, status]);

  const onClaimButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (onClaim) {
      onClaim();
    }
  };

  const onCardClick = (bridge: Exclude<Bridge, PendingBridge>) => {
    navigate(`${routes.bridgeDetails.path.split(":")[0]}${bridge.id}`);
  };

  const preferredCurrencySymbol = getCurrencySymbol(getCurrency());

  const tokenAmountString = `${formatTokenAmount(amount, token)} ${token.symbol}`;

  const fiatAmountString = showFiatAmount
    ? `${preferredCurrencySymbol}${fiatAmount ? formatFiatAmount(fiatAmount) : "--"}`
    : undefined;

  const BridgeAmount = (
    <div className={classes.token}>
      <Icon className={classes.tokenIcon} isRounded size={20} url={token.logoURI} />
      <div>{tokenAmountString}</div>
    </div>
  );

  const remainingBatchesMsg: string = (() => {
    if (
      isAsyncTaskDataAvailable(lastVerifiedBatch) &&
      isAsyncTaskDataAvailable(batchNumberOfL2Block)
    ) {
      console.log("batches:");
      console.log(batchNumberOfL2Block);
      console.log(lastVerifiedBatch.data);
      console.log(batchNumberOfL2Block.data.sub(lastVerifiedBatch.data).toNumber());
      return `Waiting for validity proof. Tx will be confirmed in ${Math.max(
        batchNumberOfL2Block.data.sub(lastVerifiedBatch.data).toNumber(),
        0
      )} batches`;
    } else if (lastVerifiedBatch.status === "failed" || batchNumberOfL2Block.status === "failed") {
      return "Waiting for validity proof. This may take between 15 min and 1 hour";
    } else {
      return "Waiting for validity proof";
    }
  })();

  // const BridgeAmount = (
  //   <div className={classes.token}>
  //     <Icon className={classes.tokenIcon} isRounded size={20} url={token.logoURI} />
  //     <div>{tokenAmountString}</div>
  //   </div>
  // );

  // const BridgeIcon = to.key === "ethereum" ? <BridgeL1Icon /> : <BridgeL2Icon />;

  // const BridgeLabel = (
  //   <Typography className={classes.label} type="body1">
  //     {to.key === "ethereum" ? "Bridge to L1" : "Bridge to L2"}
  //   </Typography>
  // );

  // const BridgeStatus = (
  //   <span
  //     className={`${classes.statusBox} ${
  //       status === "completed" ? classes.greenStatus : classes.pendingStatus
  //     }`}
  //   >
  //     {getBridgeStatus(status, from)}
  //   </span>
  // );

  // const FiatAmount = (
  //   <Typography className={classes.fiat} type="body1">
  //     {fiatAmountString}
  //   </Typography>
  // );

  switch (bridge.status) {
    case "pending": {
      const millisecondCreatedTimeStamp = Number(bridge.timeAt) * 1000;
      const bridgeTxUrl = `${from.explorerUrl}/tx/${bridge.depositTxHash}`;
      const claimTxUrl =
        bridge.status == "pending"
          ? bridge.claimTxHash
            ? `${to.explorerUrl}/tx/${bridge.claimTxHash}`
            : ""
          : "";
      const claimTxHash = bridge.claimTxHash;
      // const claimTxHash =
      //   bridge.status !== "initiated" && bridge.status !== "on-hold" ? bridge.claimTxHash : "-";
      return (
        <div className={classes.pendingListCardWrap}>
          <div className={classes.cardHeader}>
            <div className={classes.headerName}>Bridge to {bridge.to.name}</div>
            <div className={`${classes.status} ${classes.statusPending}`}>
              <WithdrawPendingIcon className={classes.statusIcon} />
              Bridging...
            </div>
            <div className={classes.bridgeAmount}>{BridgeAmount}</div>
            {/* <div className={classes.bridgeAmount}>
              <TokenIcon className={classes.tokenIcon} />
              <span className={classes.bridgeAmountNumber}>1.8384 ETH</span>
            </div> */}
          </div>
          <div className={classes.directionRow}>
            <div className={classes.upperBlock}>
              <span className={classes.rowName}>From</span>
              {/* <div className={classes.tokenWrap}>
                <NetIcon className={classes.netIcon} />
                <span className={classes.tokenName}>Ethereum</span>
              </div> */}
              <div className={classes.netName}>
                <span className={classes.networkIconWrap}>
                  <bridge.from.Icon className={classes.networkIcon} />
                </span>
                {bridge.from.name}
              </div>
            </div>
            {/* <div className={classes.address}>0x7e161af8042...2bd98306</div> */}
            <div className={classes.addressWrap}>
              <a href={bridgeTxUrl} rel="noreferrer" target="_blank">
                <div className={classes.address}>{bridge.depositTxHash}</div>
              </a>
            </div>
          </div>
          <div className={classes.directionRow}>
            <div className={classes.upperBlock}>
              <span className={classes.rowName}>To</span>
              {/* <div className={classes.tokenWrap}>
                <NetIcon className={classes.netIcon} />
                <span className={classes.tokenName}>Ethereum</span>
              </div> */}
              <div className={classes.netName}>
                <span className={classes.networkIconWrap}>
                  <bridge.to.Icon className={classes.networkIcon} />
                </span>
                {bridge.to.name}
              </div>
            </div>
            {/* <div className={classes.address}>0x7e161af8042...2bd98306</div> */}
            <div className={classes.addressWrap}>
              <a href={claimTxUrl} rel="noreferrer" target="_blank">
                {claimTxUrl ? <div className={classes.address}>{claimTxHash}</div> : "-"}
              </a>
            </div>
          </div>
          <p className={classes.pendingText}>{remainingBatchesMsg}</p>
          {/* <button className={classes.claimButton}>Claim</button> */}
        </div>
      );
    }
    case "initiated": {
      const millisecondCreatedTimeStamp = Number(bridge.timeAt) * 1000;
      const bridgeTxUrl = `${from.explorerUrl}/tx/${bridge.depositTxHash}`;
      // const claimTxUrl = ''
      // const claimTxHash =  bridge.claimTxHash;
      // const claimTxHash =
      //   bridge.status !== "initiated" && bridge.status !== "on-hold" ? bridge.claimTxHash : "-";
      return (
        <div className={classes.pendingListCardWrap}>
          <div className={classes.cardHeader}>
            <div className={classes.headerName}>Bridge to {bridge.to.name}</div>
            <div className={`${classes.status} ${classes.statusPending}`}>
              <WithdrawPendingIcon className={classes.statusIcon} />
              Bridging...
            </div>
            <div className={classes.bridgeAmount}>{BridgeAmount}</div>
            {/* <div className={classes.bridgeAmount}>
              <TokenIcon className={classes.tokenIcon} />
              <span className={classes.bridgeAmountNumber}>1.8384 ETH</span>
            </div> */}
          </div>
          <div className={classes.directionRow}>
            <div className={classes.upperBlock}>
              <span className={classes.rowName}>From</span>
              {/* <div className={classes.tokenWrap}>
                <NetIcon className={classes.netIcon} />
                <span className={classes.tokenName}>Ethereum</span>
              </div> */}
              <div className={classes.netName}>
                <span className={classes.networkIconWrap}>
                  <bridge.from.Icon className={classes.networkIcon} />
                </span>
                {bridge.from.name}
              </div>
            </div>
            {/* <div className={classes.address}>0x7e161af8042...2bd98306</div> */}
            <div className={classes.addressWrap}>
              <a href={bridgeTxUrl} rel="noreferrer" target="_blank">
                <div className={classes.address}>{bridge.depositTxHash}</div>
              </a>
            </div>
          </div>
          <div className={classes.directionRow}>
            <div className={classes.upperBlock}>
              <span className={classes.rowName}>To</span>
              {/* <div className={classes.tokenWrap}>
                <NetIcon className={classes.netIcon} />
                <span className={classes.tokenName}>Ethereum</span>
              </div> */}
              <div className={classes.netName}>
                <span className={classes.networkIconWrap}>
                  <bridge.to.Icon className={classes.networkIcon} />
                </span>
                {bridge.to.name}
              </div>
            </div>
            {/* <div className={classes.address}>0x7e161af8042...2bd98306</div> */}
            {/* <span>-</span> */}
            <div className={classes.addressWrap}>-</div>
          </div>
          <p className={classes.pendingText}>{remainingBatchesMsg}</p>
          {/* <button className={classes.claimButton}>Claim</button> */}
        </div>
      );
      // if (bridge.from.key === "ethereum") {
      //   return (
      //     <Card className={classes.card} onClick={() => onCardClick(bridge)}>
      //       <div className={classes.top}>
      //         <div className={classes.infoContainer}>
      //           <div className={classes.circle}>{BridgeIcon}</div>
      //           <div className={classes.info}>
      //             <div className={classes.row}>
      //               {BridgeLabel}
      //               {fiatAmountString && BridgeAmount}
      //             </div>
      //             <div className={classes.row}>
      //               {BridgeStatus}
      //               {fiatAmountString && FiatAmount}
      //             </div>
      //           </div>
      //           {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>},m,m,
      //         </div>
      //       </div>
      //     </Card>
      //   );
      // } else {
      //   return (
      //     <Card className={classes.card} onClick={() => onCardClick(bridge)}>
      //       <div className={classes.top}>
      //         <div className={classes.row}>
      //           <p className={classes.steps}>STEP 1/2</p>
      //         </div>
      //         <div className={classes.infoContainer}>
      //           <div className={classes.circle}>{BridgeIcon}</div>
      //           <div className={classes.info}>
      //             <div className={classes.row}>
      //               {BridgeLabel}
      //               {fiatAmountString && BridgeAmount}
      //             </div>
      //             <div className={classes.row}>
      //               {BridgeStatus}
      //               {fiatAmountString && FiatAmount}
      //             </div>
      //           </div>
      //           {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
      //         </div>
      //       </div>
      //       <div className={classes.bottom}>
      //         <Typography type="body2">{remainingBatchesMsg}</Typography>
      //         <button className={classes.finaliseButton} disabled>
      //           Finalise
      //         </button>
      //       </div>
      //     </Card>
      //   );
      // }
    }
    case "on-hold": {
      const millisecondCreatedTimeStamp = Number(bridge.timeAt) * 1000;
      const bridgeTxUrl = `${from.explorerUrl}/tx/${bridge.depositTxHash}`;
      const claimTxUrl = "";
      // const claimTxHash = bridge.claimTxHash;
      // const claimTxHash =
      //   bridge.status !== "initiated" && bridge.status !== "on-hold" ? bridge.claimTxHash : "-";
      return (
        <div className={classes.pendingListCardWrap}>
          <div className={classes.cardHeader}>
            <div className={classes.headerName}>Bridge to {bridge.to.name}</div>
            <div className={`${classes.status} ${classes.statusSuccess}`}>
              <WithdrawSuccessIcon className={classes.statusIcon} />
              Success
            </div>
            <div className={classes.bridgeAmount}>{BridgeAmount}</div>
            {/* <div className={classes.bridgeAmount}>
              <TokenIcon className={classes.tokenIcon} />
              <span className={classes.bridgeAmountNumber}>1.8384 ETH</span>
            </div> */}
          </div>
          <div className={classes.directionRow}>
            <div className={classes.upperBlock}>
              <span className={classes.rowName}>From</span>
              {/* <div className={classes.tokenWrap}>
                <NetIcon className={classes.netIcon} />
                <span className={classes.tokenName}>Ethereum</span>
              </div> */}
              <div className={classes.netName}>
                <span className={classes.networkIconWrap}>
                  <bridge.from.Icon className={classes.networkIcon} />
                </span>
                {bridge.from.name}
              </div>
            </div>
            {/* <div className={classes.address}>0x7e161af8042...2bd98306</div> */}
            <div className={classes.addressWrap}>
              <a href={bridgeTxUrl} rel="noreferrer" target="_blank">
                <div className={classes.address}>{bridge.depositTxHash}</div>
              </a>
            </div>
          </div>
          <div className={classes.directionRow}>
            <div className={classes.upperBlock}>
              <span className={classes.rowName}>To</span>
              {/* <div className={classes.tokenWrap}>
                <NetIcon className={classes.netIcon} />
                <span className={classes.tokenName}>Ethereum</span>
              </div> */}
              <div className={classes.netName}>
                <span className={classes.networkIconWrap}>
                  <bridge.to.Icon className={classes.networkIcon} />
                </span>
                {bridge.to.name}
              </div>
            </div>
            {/* <div className={classes.address}>0x7e161af8042...2bd98306</div> */}
            <div className={classes.addressWrap}>-</div>
          </div>
          {/* {isPending && <p className={classes.pendingText}>{pendingWarningText}</p>} */}
          <div className={classes.timeRow}>
            <span className={classes.rowName}>Time</span>
            <span className={classes.timeText}>
              {dayjs(millisecondCreatedTimeStamp).format("MM/DD YYYY HH:mm:ss")}
            </span>
          </div>
          <button
            className={classes.claimButton}
            disabled={isFinaliseDisabled}
            onClick={onClaimButtonClick}
          >
            Claim
          </button>
        </div>
      );
      // if (bridge.from.key === "ethereum") {
      //   return (
      //     <Card className={classes.card} onClick={() => onCardClick(bridge)}>
      //       <div className={classes.top}>
      //         <div className={classes.infoContainer}>
      //           <div className={classes.circle}>{BridgeIcon}</div>
      //           <div className={classes.info}>
      //             <div className={classes.row}>
      //               {BridgeLabel}
      //               {fiatAmountString && BridgeAmount}
      //             </div>
      //             <div className={classes.row}>
      //               {BridgeStatus}
      //               {fiatAmountString && FiatAmount}
      //             </div>
      //           </div>
      //           {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
      //         </div>
      //       </div>
      //     </Card>
      //   );
      // } else {
      //   return (
      //     <Card className={classes.card} onClick={() => onCardClick(bridge)}>
      //       <div className={classes.top}>
      //         <div className={classes.row}>
      //           <p className={classes.steps}>STEP 2/2</p>
      //         </div>
      //         <div className={classes.infoContainer}>
      //           <div className={classes.circle}>{BridgeIcon}</div>
      //           <div className={classes.info}>
      //             <div className={classes.row}>
      //               {BridgeLabel}
      //               {fiatAmountString && BridgeAmount}
      //             </div>
      //             <div className={classes.row}>
      //               {BridgeStatus}
      //               {fiatAmountString && FiatAmount}
      //             </div>
      //           </div>
      //           {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
      //         </div>
      //       </div>
      //       <div className={classes.bottom}>
      //         {networkError ? (
      //           <ErrorMessage error={`Switch to ${to.name} to continue`} type="body2" />
      //         ) : (
      //           <Typography type="body2">Signature required to finalise the bridge</Typography>
      //         )}
      //         <button
      //           className={classes.finaliseButton}
      //           disabled={isFinaliseDisabled}
      //           onClick={onClaimButtonClick}
      //         >
      //           Finalise
      //         </button>
      //       </div>
      //     </Card>
      //   );
      // }
    }
    case "completed": {
      return <></>;
    }
    // case "completed": {
    //   // console.log("success bridge details", bridge);
    //   const millisecondCreatedTimeStamp = Number(bridge.timeAt) * 1000;
    //   // const millisecondCreatedTimeStamp = 1722497328000;
    //   const bridgeTxUrl = `${from.explorerUrl}/tx/${bridge.depositTxHash}`;
    //   const claimTxUrl = `${to.explorerUrl}/tx/${bridge.claimTxHash}`;
    //   return (
    //     <div className={classes.pendingListCardWrap}>
    //       <div className={classes.cardHeader}>
    //         <div className={classes.headerName}>Bridge to Ethereum</div>
    //         <div
    //           className={`${classes.status} ${
    //             isPending ? classes.statusPending : classes.statusSuccess
    //           }`}
    //         >
    //           {isPending ? (
    //             <WithdrawPendingIcon className={classes.statusIcon} />
    //           ) : (
    //             <WithdrawSuccessIcon className={classes.statusIcon} />
    //           )}
    //           {isPending ? "Bridging..." : "Success"}
    //         </div>
    //         <div className={classes.bridgeAmount}>
    //           <TokenIcon className={classes.tokenIcon} />
    //           <span className={classes.bridgeAmountNumber}>1.8384 ETH</span>
    //         </div>
    //       </div>
    //       <div className={classes.directionRow}>
    //         <div className={classes.upperBlock}>
    //           <span className={classes.rowName}>From</span>
    //           <div className={classes.tokenWrap}>
    //             <NetIcon className={classes.netIcon} />
    //             <span className={classes.tokenName}>Ethereum</span>
    //           </div>
    //         </div>
    //         <div className={classes.address}>0x7e161af8042...2bd98306</div>
    //       </div>
    //       <div className={classes.directionRow}>
    //         <div className={classes.upperBlock}>
    //           <span className={classes.rowName}>To</span>
    //           <div className={classes.tokenWrap}>
    //             <NetIcon className={classes.netIcon} />
    //             <span className={classes.tokenName}>Ethereum</span>
    //           </div>
    //         </div>
    //         <div className={classes.address}>0x7e161af8042...2bd98306</div>
    //       </div>
    //       {isPending && <p className={classes.pendingText}>{pendingWarningText}</p>}
    //       {!isPending && (
    //         <div className={classes.timeRow}>
    //           <span className={classes.rowName}>To</span>
    //           <span className={classes.timeText}>15/03 2024 13:32:22</span>
    //         </div>
    //       )}
    //       {/* {!isPending && } */}
    //       <button className={classes.claimButton}>Claim</button>
    //       {/* <div className={classes.directionRow}></div> */}
    //       {/* <div className={classes.timeRow}></div> */}
    //     </div>
    //     // <Card className={classes.card} onClick={() => onCardClick(bridge)}>
    //     //   <div className={classes.top}>
    //     //     <div className={classes.infoContainer}>
    //     //       <div className={classes.circle}>{BridgeIcon}</div>
    //     //       <div className={classes.info}>
    //     //         <div className={classes.row}>
    //     //           {BridgeLabel}
    //     //           {fiatAmountString && BridgeAmount}
    //     //         </div>
    //     //         <div className={classes.row}>
    //     //           {BridgeStatus}
    //     //           {fiatAmountString && FiatAmount}
    //     //         </div>
    //     //       </div>
    //     //       {!fiatAmountString && <div className={classes.amount}>{BridgeAmount}</div>}
    //     //     </div>
    //     //   </div>
    //     // </Card>
    //   );
    // }
  }
};
