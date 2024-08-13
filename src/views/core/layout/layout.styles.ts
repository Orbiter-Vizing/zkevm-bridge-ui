import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useLayoutStyles = createUseStyles((theme: Theme) => ({
  backgroundPattern: {
    left: "50%",
    position: "absolute",
    top: "-30%",
    transform: "translateX(-50%)",
    zIndex: 0
  },
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    margin: [0, "auto"],
    paddingBottom: theme.spacing(2),
    width: "100%",
    zIndex: 1
  },
  headerContainer: {
    zIndex: 1
  },
  layout: {
    background: theme.palette.bgBlack,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    position: 'relative',
    width: "100%",
  },
  linkContainer: {
    marginTop: theme.spacing(2),
  },
}));
