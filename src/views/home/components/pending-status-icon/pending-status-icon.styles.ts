import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const usePendingStatusIconStyles = createUseStyles((theme: Theme) => ({
  status: {
    alignItems: "center",
    borderRadius: 4,
    display: "flex",
    fontSize: 12,
    fontWeight: 500,
    height: 22,
    lineHeight: "22px",
    padding: [0, theme.spacing(0.75)],
  },
  statusClaim: {
    "&:hover": {
      cursor: "pointer",
    },
    background: theme.palette.green.default,
    color: theme.palette.dark.main,
    padding: [0, theme.spacing(1.5)],
  },
  statusIcon: {
    marginRight: 1,
  },
  statusPending: {
    background: theme.palette.yellow.transparency20,
    color: theme.palette.yellow.default,
  },
  statusSuccess: {
    background: theme.palette.green.transparency20,
    color: theme.palette.green.default,
  },
}));
