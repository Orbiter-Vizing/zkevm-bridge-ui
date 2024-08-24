import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useBridgeGasFeeStyles = createUseStyles((theme: Theme) => ({
  data: {
    fontSize: 14,
    fontWeight: 500,
  },
  dataDollar: {
    color: theme.palette.white.transparency40,
  },
  dataEth: {
    color: theme.palette.white.default,
  },
  dataName: {
    color: theme.palette.white.transparency40,
    fontSize: 14,
    fontWeight: 400,
  },
  dataTime: {
    color: theme.palette.white.default,
  },
  loaderWrap: {
    marginTop: 20,
  },
  row: {
    "&:last-child": {
      marginBottom: 0,
    },
    display: "flex",
    justifyContent: "space-between",
    lineHeight: "17px",
    marginBottom: 12,
  },
  wrapper: {
    border: "1px solid #302D2E",
    borderRadius: 12,
    marginTop: 20,
    padding: theme.spacing(2),
    width: "100%",
  },
}));
