import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useActivityStyles = createUseStyles((theme: Theme) => ({
  activityPageWrap: {
    background: theme.palette.dark.main,
    borderRadius: 24,
    height: 744,
    margin: [theme.spacing(7), "auto"],
    // overflow: "scroll",
    padding: theme.spacing(3),
    width: 928,
  },
  amountHeader: {
    width: 202,
  },
  bridgeCardwrapper: {
    // "&:not(:last-child)": {
    //   marginBottom: theme.spacing(2),
    // },
  },
  contentWrapper: {
    display: "flex",
    // flex: 1,
    flexDirection: "column",

    // height: 608,
    // overflow: "scroll",
    // padding: [0, theme.spacing(2)],
  },
  emptyMessage: {
    alignSelf: "center",

    background: "transparent",
    // maxWidth: theme.maxWidth,
    padding: [50, theme.spacing(2)],
    textAlign: "center",
    width: "100%",
    [theme.breakpoints.upSm]: {
      padding: 100,
    },
  },
  filterBox: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing(2),
    },
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    padding: [[theme.spacing(0.75), theme.spacing(1)]],
    transition: theme.hoverTransition,
  },
  filterBoxes: {
    display: "flex",
    // margin: [theme.spacing(5), "auto", theme.spacing(2)],
    maxWidth: theme.maxWidth,
    width: "100%",
  },
  filterBoxLabel: {
    padding: [theme.spacing(0), theme.spacing(1)],
  },
  filterBoxSelected: {
    backgroundColor: theme.palette.dark.light,
    color: theme.palette.grey.dark,
  },
  filterNumberBox: {
    alignItems: "center",
    background: theme.palette.white.transparency10,
    borderRadius: 6,
    color: theme.palette.white.transparency40,
    display: "flex",
    padding: [theme.spacing(0.25), theme.spacing(1)],
  },
  filterNumberBoxSelected: {
    // backgroundColor: theme.palette.grey.light,
  },
  fromHeader: {
    width: 174,
  },
  statusHeader: {
    width: 80,
  },
  stickyContent: {
    // background: theme.palette.grey.light,
    // position: "sticky",
    // top: 0,
    // zIndex: 1,
    marginBottom: theme.spacing(2),
  },
  stickyContentBorder: {
    borderBottom: `${theme.palette.grey.main} 1px solid`,
  },
  timeHeader: {
    width: 218,
  },
  toHeader: {
    width: 174,
  },
  txContent: {
    background: theme.palette.dark.light,
    borderRadius: 12,
    height: 640,
    // overflow: "scroll",
    width: "100%",
  },
  txContentHeader: {
    color: theme.palette.white.transparency40,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "16px",
    padding: [theme.spacing(1), theme.spacing(2)],
  },
  txContentWrapForScroll: {
    height: 608,
    overflow: "scroll",
  },
  txHeaderItem: {
    display: "inline-flex",
    justifyContent: "flex-start",
  },
}));
