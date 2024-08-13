import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useListStyles = createUseStyles((theme: Theme) => ({
  background: {
    alignItems: "center",
    background: theme.palette.dark.transparency60,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    padding: [0, theme.spacing(1)],
    width: "100%",
  },
  button: {
    // "&:hover": {
    //   background: theme.palette.grey.main,
    // },
    "&:not(:first-of-type)": {
      marginTop: theme.spacing(1.5),
    },
    alignItems: "center",
    background: theme.palette.dark.light,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: theme.spacing(1),
    height: 56,
    padding: [0, theme.spacing(2)],
    transition: theme.hoverTransition,
  },
  card: {
    background: theme.palette.dark.main,
    height: 440,
    padding: [25, 24, 24],
    width: 400,
  },
  chainNameText: {
    color: theme.palette.white.default,
    fontSize: 16,
    fontWeight: 500,
  },
  closeButton: {
    "&:hover": {
      background: theme.palette.grey.main,
    },
    alignItems: "center",
    background: theme.palette.grey.light,
    border: 0,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    height: theme.spacing(4),
    justifyContent: "center",
    padding: 0,
    position: "absolute",
    right: 0,
    transition: theme.hoverTransition,
    width: theme.spacing(4),
  },
  closeButtonIcon: {
    height: 16,
    width: 16,
  },
  header: {
    alignItems: "center",
    color: theme.palette.white.default,
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: theme.spacing(2),
    position: "relative",
  },
  headerText: {
    color: theme.palette.white.default,
    fontSize: 20,
    fontWeight: 500,
    margin: 0,
  },
  icon: {
    height: "24px",
    width: "24px",
  },
  list: {
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey.main,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.grey.dark,
    },
    display: "flex",
    flexDirection: "column",
    maxHeight: 350,
    overflowY: "auto",
  },
}));
