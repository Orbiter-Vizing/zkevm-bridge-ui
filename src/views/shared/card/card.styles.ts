import { createUseStyles } from "react-jss";

import { Theme } from "src/styles/theme";

export const useCardStyles = createUseStyles((theme: Theme) => ({
  card: {
    background: "#302D2E",
    borderRadius: 12,
    overflow: "hidden",
  },
}));
