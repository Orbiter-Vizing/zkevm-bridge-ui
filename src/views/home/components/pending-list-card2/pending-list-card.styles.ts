import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const usePendingListCardStyles = createUseStyles((theme: Theme) => ({
  address: {
    color: theme.palette.white.default,
    display: "flex",
    fontWeight: 500,
    justifyContent: "flex-end",
    lineHeight: "16px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: 188,
  },
  addressWrap: {
    display: "flex",
    justifyContent: "flex-end",
  },
  bridgeAmount: {
    alignItems: "center",
    color: theme.palette.white.default,
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
  },
  bridgeAmountNumber: {
    color: theme.palette.white.default,
    fontSize: 18,
    fontWeight: 500,
  },
  cardHeader: {
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  claimButton: {
    "&:disabled": {
      background: theme.palette.white.transparency10,
      color: theme.palette.white.transparency20,
    },
    "&:hover&:not(:disabled)": {
      cursor: "pointer",
    },
    alignItems: "center",
    background: theme.palette.green.default,
    border: "none",
    borderRadius: 12,
    color: theme.palette.dark.darker,
    display: "flex",
    fontSize: 20,
    fontWeight: 700,
    height: 56,
    justifyContent: "center",
    lineHeight: "16px",
    width: 528,
  },
  directionRow: {
    // alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    fontSize: 14,
    fontWeight: 400,
    marginBottom: theme.spacing(2),
  },
  headerName: {
    color: theme.palette.white.default,
    fontSize: 18,
    fontWeight: 500,
    marginRight: theme.spacing(0.75),
  },
  netIcon: {
    height: 16,
    marginRight: theme.spacing(0.75),
    width: 16,
  },
  netName: {
    alignItems: "center",
    color: theme.palette.white.transparency60,
    display: "flex",
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
    height: 16,
    marginRight: theme.spacing(0.5),
    width: 16,
  },
  pendingListCardWrap: {
    background: theme.palette.dark.light,
    borderRadius: 12,
    // height: 280,
    padding: theme.spacing(2),
    width: 560,
  },
  pendingText: {
    color: theme.palette.yellow.default,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "17px",
    marginBottom: theme.spacing(2),
  },
  rowName: {
    color: theme.palette.white.transparency40,
    fontSize: 14,
    fontWeight: 400,
  },
  status: {
    alignItems: "center",
    borderRadius: 4,
    display: "flex",
    fontSize: 12,
    fontWeight: 500,
    height: 22,
    lineHeight: "22px",
    padding: [0, theme.spacing(0.75)],
  },
  statusIcon: {
    marginRight: 1,
  },
  statusPending: {
    background: theme.palette.yellow.transparency20,
    color: theme.palette.yellow.default,
  },
  statusSuccess: {
    background: theme.palette.green.transparency20,
    color: theme.palette.green.default,
  },
  timeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  timeText: {
    color: theme.palette.white.default,
    display: "flex",
    fontWeight: 500,
    lineHeight: "16px",
  },
  token: {
    alignItems: "center",
    display: "flex",
    fontSize: 18,
    fontWeight: 500,
    justifyContent: "flex-end",
    width: 202,
  },
  tokenIcon: {
    height: 20,
    marginRight: theme.spacing(0.5),
    width: 20,
  },
  tokenName: {
    color: theme.palette.white.transparency60,
    fontSize: 14,
    fontWeight: 400,
  },
  tokenWrap: {
    alignItems: "center",
    display: "flex",
  },
  upperBlock: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5),
  },
}));
