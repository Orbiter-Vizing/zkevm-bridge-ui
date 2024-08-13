import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useHomeStyles = createUseStyles((theme: Theme) => ({
  bridgeTab: {
    "&:hover": {
      cursor: "pointer",
    },
    alignItems: "center",
    borderRadius: 8,
    color: theme.palette.white.default,
    display: "inline-flex",
    height: 40,
    justifyContent: "center",
    width: 274,
  },
  bridgeTabsWrap: {
    background: "rgba(154, 154, 154, 0.12)",
    borderRadius: 12,
    height: 48,
    margin: [0, 0, theme.spacing(3)],
    padding: [theme.spacing(0.5), theme.spacing(0.5)],
    width: 560,
  },
  contentWrapper: {
    display: "flex",
    flexDirection: "column",
    padding: [theme.spacing(7), 0],
  },
  ethereumAddress: {
    alignItems: "center",
    backgroundColor: theme.palette.grey.main,
    borderRadius: 56,
    display: "flex",
    margin: [theme.spacing(3), "auto", theme.spacing(3)],
    padding: [theme.spacing(1.25), theme.spacing(3)],
    [theme.breakpoints.upSm]: {
      margin: [theme.spacing(3), "auto", theme.spacing(5)],
    },
  },
  formWrap: {
    background: "#232021",
    borderRadius: 24,
    // height: 472,
    margin: "auto",
    padding: [theme.spacing(3), theme.spacing(3)],
    width: 608,
  },
  metaMaskIcon: {
    marginRight: theme.spacing(1),
    width: 20,
  },
  networkBoxWrapper: {
    margin: [0, "auto", theme.spacing(3)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },
  pendingListWrap: {
    background: theme.palette.dark.main,
    borderRadius: 24,
    height: 647,
    margin: [theme.spacing(3), "auto"],
    padding: theme.spacing(3),
    width: 608,
  },
  selectedTab: {
    background: theme.palette.themeRed,
  },
}));
