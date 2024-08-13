import { relative } from "path";
import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTxToastContentStyles = createUseStyles((theme: Theme) => ({
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  pendingAnimation: {
    animation: "$spin 0.8s linear infinite",
  },
  statusIcon: {
    height: 17,
    width: 17,
  },
  statusIconWrap: {
    // alignItems: "center",
    // display: "flex",
    // height: 18,
    // justifyContent: "center",
    position: "absolute",
    right: "calc(100% + 6px)",
    top: "50%",
    transform: "translateY(-50%)",
    // width: 18,
  },
  txLink: {
    color: theme.palette.themeRed,
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
  },
  txToastText: {
    color: theme.palette.white.transparency60,
    fontSize: 14,
    fontWeight: 400,
    margin: 0,
    marginBottom: theme.spacing(1),
    marginTop: 0,
  },
  txToastTitle: {
    color: theme.palette.white.default,
    fontSize: 16,
    fontWeight: 500,
    marginBottom: theme.spacing(1),
    marginTop: 0,
  },
  txToastTitleWrap: {
    position: "relative",
  },
  txToastWrap: {},
}));
