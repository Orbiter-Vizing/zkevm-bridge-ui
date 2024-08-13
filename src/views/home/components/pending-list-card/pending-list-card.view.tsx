import { FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as NetIcon } from "src/assets/icons/chains/ethereum.svg";
import { ReactComponent as TokenIcon } from "src/assets/icons/tokens/erc20-icon.svg";
import { ReactComponent as WithdrawPendingIcon } from "src/assets/icons/withdraw-pending.svg";
import { ReactComponent as WithdrawSuccessIcon } from "src/assets/icons/withdraw-success.svg";
// import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
// import { ReactComponent as PolygonZkEVMLogo } from "src/assets/vizing-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { usePendingListCardStyles } from "src/views/home/components/pending-list-card/pending-list-card.styles";

interface PendingListCardProps {
  status: "pending" | "success";
}

const pendingWarningText =
  "Withdrawals require a 3-day period for validity proof. Transactions will be confirmed inbatches of 30.";

export const PendingListCard: FC<PendingListCardProps> = ({ status }) => {
  const classes = usePendingListCardStyles();
  const env = useEnvContext();

  const isPending = status === "pending";

  if (!env) {
    return null;
  }

  return (
    <div className={classes.pendingListCardWrap}>
      <div className={classes.cardHeader}>
        <div className={classes.headerName}>Bridge to Ethereum</div>
        <div
          className={`${classes.status} ${
            isPending ? classes.statusPending : classes.statusSuccess
          }`}
        >
          {isPending ? (
            <WithdrawPendingIcon className={classes.statusIcon} />
          ) : (
            <WithdrawSuccessIcon className={classes.statusIcon} />
          )}
          {isPending ? "Bridging..." : "Success"}
        </div>
        <div className={classes.bridgeAmount}>
          <TokenIcon className={classes.tokenIcon} />
          <span className={classes.bridgeAmountNumber}>1.8384 ETH</span>
        </div>
      </div>
      <div className={classes.directionRow}>
        <div className={classes.upperBlock}>
          <span className={classes.rowName}>From</span>
          <div className={classes.tokenWrap}>
            <NetIcon className={classes.netIcon} />
            <span className={classes.tokenName}>Ethereum</span>
          </div>
        </div>
        <div className={classes.address}>0x7e161af8042...2bd98306</div>
      </div>
      <div className={classes.directionRow}>
        <div className={classes.upperBlock}>
          <span className={classes.rowName}>To</span>
          <div className={classes.tokenWrap}>
            <NetIcon className={classes.netIcon} />
            <span className={classes.tokenName}>Ethereum</span>
          </div>
        </div>
        <div className={classes.address}>0x7e161af8042...2bd98306</div>
      </div>
      {isPending && <p className={classes.pendingText}>{pendingWarningText}</p>}
      {!isPending && (
        <div className={classes.timeRow}>
          <span className={classes.rowName}>To</span>
          <span className={classes.timeText}>15/03 2024 13:32:22</span>
        </div>
      )}
      {/* {!isPending && } */}
      <button className={classes.claimButton}>Claim</button>
      {/* <div className={classes.directionRow}></div> */}
      {/* <div className={classes.timeRow}></div> */}
    </div>
  );
};
