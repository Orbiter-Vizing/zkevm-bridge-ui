import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useConnectWalletButtonStyles = createUseStyles((theme: Theme) => ({
  button: {
    alignItems: "center",
    backgroundColor: theme.palette.themeRed,
    border: "none",
    borderRadius: 12,
    color: theme.palette.white.default,
    cursor: "pointer",
    display: "flex",
    fontSize: "20px",
    fontWeight: "700",
    height: "100%",
    justifyContent: "center",
    lineHeight: "24px",
    transition: theme.hoverTransition,
    width: "100%",
  },
  // paddedSpinner: {
  //   paddingLeft: theme.spacing(1.5),
  // },
}));
