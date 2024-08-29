import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeConfirmationStyles = createUseStyles((theme: Theme) => ({
  arrowIcon: {
    transform: "rotate(90deg)",
    [theme.breakpoints.upSm]: {
      margin: [0, theme.spacing(1)],
      transform: "none",
    },
  },
  bridgeDetail: {
    background: theme.palette.dark.light,
    borderRadius: 12,
    padding: [theme.spacing(2.5), theme.spacing(2)],
  },
  button: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    justifyContent: "center",
    marginTop: theme.spacing(3),
    [theme.breakpoints.upSm]: {
      marginTop: theme.spacing(6),
    },
  },
  card: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    maxWidth: theme.maxWidth,
    padding: theme.spacing(2),
    width: "100%",
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(6), "auto", 0],
      padding: theme.spacing(3),
    },
  },
  chainBox: {
    alignItems: "center",
    backgroundColor: theme.palette.dark.light,
    borderRadius: 12,
    display: "flex",
    gap: theme.spacing(1),
    height: 80,
    justifyContent: "center",
    padding: [0, theme.spacing(4)],
    width: 232,
  },
  chainIcon: {
    height: 32,
    width: 32,
  },
  chainName: {
    color: theme.palette.white.default,
    fontSize: 18,
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chainsRow: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),
    width: "100%",
  },
  contentWrapper: {
    background: theme.palette.dark.main,
    borderRadius: 12,
    margin: [theme.spacing(7), "auto"],
    padding: theme.spacing(3),
    width: 608,
  },
  detailData: {
    display: "flex",
    justifyContent: "space-between",
  },
  detailName: {
    color: theme.palette.white.transparency40,
    fontSize: 16,
    fontWeight: 400,
    marginBottom: theme.spacing(1.5),
  },
  detailRow: {
    "&:last-child": {
      marginBottom: 0,
    },
    display: "flex",
    flexDirection: "column",
    marginBottom: 10,
  },
  dollarData: {
    color: theme.palette.white.transparency40,
    fontSize: 18,
    fontWeight: 400,
  },
  error: {
    marginTop: theme.spacing(2),
  },
  fee: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
  feeBlock: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  fiat: {
    marginTop: theme.spacing(1),
  },
  header: {
    alignItems: "center",
    display: "flex",
    height: 48,
  },
  headerText: {
    color: theme.palette.white.default,
    fontSize: 24,
    fontWeight: 500,
    margin: 0,
  },
  iconWrap: {
    "&:hover": {
      cursor: "pointer",
    },
    alignItems: "center",
    background: theme.palette.dark.light,
    borderRadius: 12,
    display: "inline-flex",
    height: 48,
    justifyContent: "center",
    marginRight: theme.spacing(2),
    width: 48,
  },
  infoMessage: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(1),
  },
  tokenData: {
    color: theme.palette.white.default,
    fontSize: 20,
    fontWeight: 700,
  },
  tokenIcon: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(0),
    [theme.breakpoints.upSm]: {
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(1),
    },
  },
}));
