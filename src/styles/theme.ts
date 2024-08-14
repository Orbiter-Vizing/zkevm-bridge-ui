export const theme = {
  breakpoints: {
    upSm: "@media (min-width: 480px)",
  },
  hoverTransition: "all 150ms",
  maxWidth: 644,
  palette: {
    black: "rgba(255, 255, 255, 0.4)",
    dark: {
      darker: "#040102",
      light: "#302D2E",
      lighter: "rgba(154, 154, 154, 0.12)",
      main: "#232021",
      transparency60: "rgba(0, 0, 0, 0.6)",
    },
    error: {
      light: "rgba(232,67,12,0.1)",
      main: "#e8430d",
    },
    green: {
      default: "#86DD45",
      transparency20: "rgba(134, 221, 69, 0.2)",
    },
    grey: {
      dark: "#78798d",
      light: "#f0f1f6",
      main: "#e2e5ee",
      veryDark: "#363740",
    },
    primary: {
      dark: "#5a1cc3",
      main: "#7b3fe4",
    },
    success: {
      light: "rgba(0,255,0,0.1)",
      main: "#1ccc8d",
    },
    themeRed: "#FF486D",
    transparency: "rgba(8,17,50,0.5)",
    warning: {
      light: "rgba(225,126,38,0.1)",
      main: "#e17e26",
    },
    white: {
      default: "#ffffff",
      transparency10: "rgba(225, 255, 255, 0.1)",
      transparency20: "rgba(225, 255, 255, 0.2)",
      transparency40: "rgba(225, 255, 255, 0.4)",
      transparency60: "rgba(225, 255, 255, 0.6)",
    },
    yellow: {
      default: "#FFCC2D",
      transparency20: "rgba(255, 204, 45, 0.2)",
    },
  },
  spacing: (value: number): number => value * 8,
};

export type Theme = typeof theme;
