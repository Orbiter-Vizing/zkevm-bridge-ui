import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenSelectorStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.transparency,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    padding: [0, theme.spacing(1)],
    width: "100%",
  },
  card: {
    background: theme.palette.dark.main,
    display: "flex",
    flexDirection: "column",
    height: 515,
    maxWidth: 400,
    padding: theme.spacing(3),
    width: "100%",
  },
}));
