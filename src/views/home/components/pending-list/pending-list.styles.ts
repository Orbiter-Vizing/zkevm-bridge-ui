import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const usePendingListStyles = createUseStyles((theme: Theme) => ({
  cardListScrollWrap: {
    "&::-webkit-scrollbar": {
      display: "none",
    },
    height: 570,
    overflow: "scroll",
  },
  cardListWrap: {},
  cardWrap: {
    marginBottom: theme.spacing(2),
  },
  header: {
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  headerText: {
    fontSize: 16,
    fontWeight: 500,
    marginRight: theme.spacing(1),
  },
  pendingListWrap: {
    // padding: theme.spacing(3),
  },
  pendingTxNumber: {
    background: theme.palette.white.transparency10,
    borderRadius: 6,
    height: 20,
    lineHeight: "20px",
    padding: [0, theme.spacing(1)],
  },
}));
