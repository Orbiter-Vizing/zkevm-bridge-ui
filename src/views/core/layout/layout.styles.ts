import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useLayoutStyles = createUseStyles((theme: Theme) => ({
  backgroundPattern: {
    // height: 552,
    // left: "50%",
    // position: "absolute",
    // top: "-30%",
    // transform: "translateX(-50%)",
    // width: 533,
    // zIndex: 0,
  },
  backgroundPatternWrap: {
    alignItems: "center",
    display: "flex",
    height: "100%",
    justifyContent: "center",
    // left: "50%",
    overflow: "hidden",

    position: "absolute",
    // top: "-30%",
    width: "100%",

    zIndex: 0,
  },
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    margin: [0, "auto"],
    paddingBottom: theme.spacing(2),
    width: "100%",
    zIndex: 1,
  },
  headerContainer: {
    zIndex: 1,
  },
  layout: {
    background: theme.palette.dark.darker,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    position: "relative",
    width: "100%",
  },
  linkContainer: {
    marginTop: theme.spacing(2),
  },
}));
