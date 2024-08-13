import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useButtonStyles = createUseStyles((theme: Theme) => ({
  button: {
    "&:disabled": {
      backgroundColor: theme.palette.grey.dark,
      cursor: "default",
      opacity: 0.4,
    },
    alignItems: "center",
    backgroundColor: theme.palette.themeRed,
    border: "none",
    borderRadius: 12,
    color: theme.palette.white.default,
    cursor: "pointer",
    display: "flex",
    fontSize: "20px",
    fontWeight: "700",
    justifyContent: "center",
    lineHeight: "24px",
    minWidth: "260px",
    padding: [theme.spacing(2), theme.spacing(10)],
    transition: theme.hoverTransition,
    width: "100%",
  },
  paddedSpinner: {
    paddingLeft: theme.spacing(1.5),
  },
}));
