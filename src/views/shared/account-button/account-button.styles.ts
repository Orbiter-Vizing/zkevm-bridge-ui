import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useAccountButtonStyles = createUseStyles((theme: Theme) => ({
  accountButton: {
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
  accountButtonText: {
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
  accountButtonWrap: {
    position: "relative",
  },
  accountIconWrap: {
    alignItems: "center",
    background: "#F3F3FA",
    borderRadius: "50%",
    display: "flex",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  disconnectButton: {
    "&:hover": {
      cursor: "pointer",
    },
    alignItems: "center",
    background: theme.palette.dark.main,
    border: "none",
    borderRadius: 8,
    color: theme.palette.white.default,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "center",
    padding: theme.spacing(1.25),
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    transition: theme.hoverTransition,
    width: "120%",
  },
  logoutIcon: {
    height: 16,
    width: 16,
  },
}));
