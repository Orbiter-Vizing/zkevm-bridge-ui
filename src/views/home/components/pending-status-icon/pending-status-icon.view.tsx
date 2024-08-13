import { FC } from "react";

import { ReactComponent as WithdrawPendingIcon } from "src/assets/icons/withdraw-pending.svg";
import { ReactComponent as WithdrawSuccessIcon } from "src/assets/icons/withdraw-success.svg";
import { usePendingStatusIconStyles } from "src/views/home/components/pending-status-icon/pending-status-icon.styles";

interface PendingStatusIconProps {
  status: "pending" | "success" | "claim";
}

export const PendingStatusIcon: FC<PendingStatusIconProps> = ({ status }) => {
  const classes = usePendingStatusIconStyles();

  return (
    <div
      className={`
        ${classes.status}
        ${status === "pending" ? classes.statusPending : ""}
        ${status === "success" ? classes.statusSuccess : ""}
        ${status === "claim" ? classes.statusClaim : ""}
      `}
    >
      {status === "pending" && <WithdrawPendingIcon className={classes.statusIcon} />}
      {status === "success" && <WithdrawSuccessIcon className={classes.statusIcon} />}
      {status === "pending" && "Bridging..."}
      {status === "success" && "Success"}
      {status === "claim" && "Claim"}
    </div>
  );
};
