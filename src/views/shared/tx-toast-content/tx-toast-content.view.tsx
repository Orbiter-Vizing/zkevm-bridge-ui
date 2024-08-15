import { FC } from "react";

import { ReactComponent as FailIcon } from "src/assets/icons/error.svg";
import { ReactComponent as PendingIcon } from "src/assets/icons/pending.svg";
import { ReactComponent as SuccessIcon } from "src/assets/icons/success.svg";
import { useTxToastContentStyles } from "src/views/shared/tx-toast-content/tx-toast-content.styles";

interface TxToastContentProps {
  explorerUrl?: string;
  text: string;
  title: string;
  type: "pending" | "success" | "fail";
}

export const TxToastContent: FC<TxToastContentProps> = ({ explorerUrl, text, title, type }) => {
  const classes = useTxToastContentStyles();
  const claimTxUrl = explorerUrl ? `${explorerUrl}/tx/${text}` : "";

  return (
    <div className={classes.txToastWrap}>
      <div className={classes.txToastTitleWrap}>
        <span className={`${classes.statusIconWrap}`}>
          {type === "pending" && (
            <PendingIcon className={`${classes.statusIcon} ${classes.pendingAnimation}`} />
          )}
          {type === "success" && <SuccessIcon className={classes.statusIcon} />}
          {type === "fail" && <FailIcon className={classes.statusIcon} />}
        </span>
        <p className={classes.txToastTitle}>{title}</p>
      </div>
      {type !== "success" && <p className={classes.txToastText}>{text}</p>}
      {type === "success" && (
        <a href={claimTxUrl} rel="noreferrer" target="_blank">
          <p className={classes.txLink}>View on explorer</p>
        </a>
      )}
    </div>
  );
};
