import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useHeaderStyles = createUseStyles((theme: Theme) => ({
  // activityLabel: {
  //   display: "none",
  //   [theme.breakpoints.upSm]: {
  //     display: "block",
  //   },
  // },
  block: {
    display: "flex",
    // flex: 1,
    gap: theme.spacing(0.75),
  },
  centerBlock: {
    flex: 1,
    justifyContent: "start",
  },
  connectButton: {
    "&:hover": {
      cursor: "pointer",
    },
    background: theme.palette.themeRed,
    borderRadius: 12,
    color: theme.palette.white.default,
    fontSize: 16,
    fontWeight: 500,
    height: 48,
    padding: 16,
  },
  connectButtonWrap: {
    height: 48,
    width: 147,
  },
  header: {
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    // margin: [theme.spacing(2), "auto", 0],
    padding: [theme.spacing(2), theme.spacing(3)],
    width: "100%",
  },
  leftBlock: {
    justifyContent: "left",
  },
  link: {
    "&:hover": {
      color: theme.palette.grey.main,
    },
    alignItems: "center",
    borderRadius: 8,
    display: "flex",
    gap: theme.spacing(1),
    padding: [theme.spacing(0.75), theme.spacing(1)],
    position: "relative",
    transition: theme.hoverTransition,
  },
  logo: {
    height: 56,
    marginRight: theme.spacing(6),
  },
  rightBlock: {
    justifyContent: "end",
  },
  selectedBottomLine: {
    background: theme.palette.white.default,
  },
  tabBottomLine: {
    // background: theme.palette.white.default,
    display: "block",
    height: 4,
    left: 0,
    position: "absolute",
    top: "calc(100% + 24px)",
    width: "100%",
  },
}));
