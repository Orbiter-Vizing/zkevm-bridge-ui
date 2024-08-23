import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeFormStyles = createUseStyles((theme: Theme) => ({
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
  formWrap: {
    background: "#232021",
    borderRadius: 24,
    height: 472,
    margin: "auto",
    marginTop: 56,
    padding: [theme.spacing(3), theme.spacing(3)],
  },
  selectedTab: {
    background: theme.palette.themeRed,
  },
  // arrowDownIcon: {
  //   backgroundColor: theme.palette.grey.main,
  //   borderRadius: "50%",
  //   display: "flex",
  //   [theme.breakpoints.upSm]: {
  //     height: 40,
  //     padding: theme.spacing(0.5),
  //     width: 40,
  //   },
  // },
  // arrowRow: {
  //   display: "flex",
  //   justifyContent: "center",
  //   margin: [theme.spacing(1), 0],
  //   [theme.breakpoints.upSm]: {
  //     margin: [theme.spacing(2), 0],
  //   },
  // },
  // button: {
  //   alignItems: "center",
  //   display: "flex",
  //   flexDirection: "column",
  //   gap: theme.spacing(2),
  //   margin: [theme.spacing(5), "auto"],
  // },
  // card: {
  //   marginTop: 24,
  //   padding: [theme.spacing(2), theme.spacing(3)],
  // },
  // form: {
  //   background: "#232021",
  //   borderRadius: 24,
  //   height: 472,
  //   margin: "auto",
  //   padding: [theme.spacing(3), theme.spacing(3)],
  //   width: 608,
  // },
  // fromChain: {
  //   "&:hover": {
  //     backgroundColor: theme.palette.grey.light,
  //   },
  //   alignItems: "center",
  //   background: "none",
  //   border: "none",
  //   borderRadius: 8,
  //   cursor: "pointer",
  //   display: "flex",
  //   gap: theme.spacing(0.75),
  //   marginBottom: -theme.spacing(0.75),
  //   marginLeft: -theme.spacing(1.25),
  //   marginTop: theme.spacing(0.5),
  //   padding: [theme.spacing(0.75), theme.spacing(1.25)],
  //   transition: theme.hoverTransition,
  //   [theme.breakpoints.upSm]: {
  //     gap: theme.spacing(1.25),
  //   },
  // },
  // icons: {
  //   height: 20,
  //   width: 20,
  //   [theme.breakpoints.upSm]: {
  //     height: 24,
  //     width: 24,
  //   },
  // },
  // leftBox: {
  //   alignItems: "flex-start",
  //   display: "flex",
  //   flexDirection: "column",
  //   justifyContent: "space-between",
  // },
  // middleRow: {
  //   borderTop: `1px solid ${theme.palette.grey.light}`,
  //   marginTop: theme.spacing(1.25),
  //   padding: [theme.spacing(2), 0, 0],
  // },
  // rightBox: {
  //   alignItems: "flex-end",
  //   display: "flex",
  //   flexDirection: "column",
  //   justifyContent: "space-between",
  // },
  // row: {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   paddingBottom: theme.spacing(0.5),
  // },
  // spinner: {
  //   margin: "auto",
  //   marginTop: theme.spacing(7),
  // },
  // toChain: {
  //   alignItems: "center",
  //   background: "none",
  //   border: "none",
  //   borderRadius: 8,
  //   display: "flex",
  //   gap: theme.spacing(0.75),
  //   marginBottom: -theme.spacing(0.75),
  //   marginLeft: -theme.spacing(1.25),
  //   marginTop: theme.spacing(0.5),
  //   padding: [theme.spacing(0.75), theme.spacing(1.25)],
  //   [theme.breakpoints.upSm]: {
  //     gap: theme.spacing(1.25),
  //   },
  // },
  // tokenSelector: {
  //   "&:hover": {
  //     backgroundColor: theme.palette.grey.main,
  //   },
  //   alignItems: "center",
  //   backgroundColor: theme.palette.grey.light,
  //   border: "none",
  //   borderRadius: 8,
  //   cursor: "pointer",
  //   display: "flex",
  //   gap: theme.spacing(1),
  //   padding: [theme.spacing(1), theme.spacing(1.25)],
  //   transition: theme.hoverTransition,
  //   [theme.breakpoints.upSm]: {
  //     backgroundColor: theme.palette.grey.light,
  //     gap: theme.spacing(2),
  //     padding: [theme.spacing(1.5), theme.spacing(2)],
  //   },
  // },
}));
