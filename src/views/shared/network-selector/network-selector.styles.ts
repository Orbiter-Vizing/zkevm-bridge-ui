import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useNetworkSelectorStyles = createUseStyles((theme: Theme) => ({
  chainIconWrap: {
    alignItems: "center",
    background: "#F3F3FA",
    borderRadius: "50%",
    display: "flex",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  networkButton: {
    // "&:hover": {
    //   backgroundColor: theme.palette.grey.main,
    // },
    alignItems: "center",
    background: theme.palette.white.transparency10,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "space-between",
    maxWidth: 200,
    padding: theme.spacing(1.25),
    transition: theme.hoverTransition,
  },
  networkButtonText: {
    color: theme.palette.white.default,
    display: "none",
    fontSize: "14px !important",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    [theme.breakpoints.upSm]: {
      display: "block",
    },
  },
}));
