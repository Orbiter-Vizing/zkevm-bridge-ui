import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeCardStyles = createUseStyles((theme: Theme) => ({
  amount: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  amountTokenIcon: {
    height: 20,
    width: 20,
  },
  bottom: {
    alignItems: "center",
    borderTop: [1, "solid", theme.palette.grey.light],
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  card: {
    alignItems: "center",
    // "&:hover": {
    //   backgroundColor: theme.palette.grey.main,
    // },
    // cursor: "pointer",
    // border: "1px solid pink",
    color: theme.palette.white.default,
    display: "flex",
    height: 60,
    margin: "auto",
    padding: [0, theme.spacing(2)],
    transition: theme.hoverTransition,
    width: "100%",
  },
  circle: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.light,
    borderRadius: "100%",
    display: "flex",
    height: theme.spacing(6),
    justifyContent: "center",
    width: theme.spacing(6),
  },
  claimButton: {
    background: "transparent",
    border: "none",
    padding: 0,
  },
  disabledTxHash: {
    border: "none",
  },
  fiat: {
    color: theme.palette.grey.dark,
    fontSize: 14,
  },
  finaliseButton: {
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
      cursor: "initial",
      opacity: 0.4,
    },
    "&:hover&:not(:disabled)": {
      backgroundColor: theme.palette.primary.dark,
    },
    backgroundColor: theme.palette.primary.main,
    border: "none",
    borderRadius: 32,
    color: theme.palette.white.default,
    cursor: "pointer",
    fontWeight: 700,
    lineHeight: "20px",
    padding: [theme.spacing(0.75), theme.spacing(3)],
  },
  fromInfo: {
    width: 174,
  },
  greenStatus: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.main,
  },
  info: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginLeft: theme.spacing(2),
  },
  infoContainer: {
    alignItems: "center",
    display: "flex",
    flex: 1,
  },
  label: {
    marginRight: "auto",
  },
  netName: {
    color: theme.palette.white.transparency60,
    fontSize: 14,
    fontWeight: 400,
    marginBottom: theme.spacing(0.5),
  },
  networkIcon: {
    height: 16,
    width: 16,
  },
  networkIconWrap: {
    display: "inline-block",
    marginRight: theme.spacing(0.5),
  },
  pendingStatus: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.main,
  },
  row: {
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1),
    },
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  statusBox: {
    borderRadius: 8,
    fontSize: 14,
    marginRight: "auto",
    padding: [theme.spacing(0.5), theme.spacing(1)],
  },
  steps: {
    color: theme.palette.grey.dark,
    fontSize: 14,
    marginBottom: theme.spacing(2),
    marginTop: 0,
  },
  timeInfo: {
    width: 218,
  },
  toInfo: {
    width: 174,
  },
  token: {
    alignItems: "center",
    display: "flex",
    fontSize: 18,
    fontWeight: 500,
    width: 202,
  },
  tokenIcon: {
    marginRight: theme.spacing(1),
  },
  top: {
    display: "flex",
    flexDirection: "column",
  },
  txHash: {
    "&:hover": {
      borderColor: theme.palette.white.default,
      cursor: "pointer",
    },
    borderBottom: "1px solid transparent",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: 98,
  },
}));
