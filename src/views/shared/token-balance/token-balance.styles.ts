import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useTokenBalanceStyles = createUseStyles((theme: Theme) => ({
  balanceNumber: {
    fontSize: 24,
    fontWeight: 500,
  },
  loader: {
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(0.25),
  },
}));
