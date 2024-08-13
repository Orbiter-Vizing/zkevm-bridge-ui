import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/vizing-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { routes } from "src/routes";
import { areSettingsVisible } from "src/utils/feature-toggles";
import { useHeaderStyles } from "src/views/core/components/header/header.styles";
import { NetworkSelector } from "src/views/shared/network-selector/network-selector.view";
import { Typography } from "src/views/shared/typography/typography.view";

enum PATHNAME {
  ACTIVITY = "/activity",
  HOME = "/",
}

export const Header: FC = () => {
  const classes = useHeaderStyles();
  const env = useEnvContext();

  const [currentPath, setCurrentPath] = useState("");

  const location = useLocation();

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  if (!env) {
    return null;
  }

  return (
    <header className={classes.header}>
      <div className={`${classes.block} ${classes.leftBlock}`}>
        <PolygonZkEVMLogo className={classes.logo} />
      </div>
      <div className={`${classes.block} ${classes.centerBlock}`}>
        <Link className={classes.link} to={routes.home.path}>
          Bridge
          <span
            className={`${classes.tabBottomLine} ${
              currentPath === PATHNAME.HOME ? classes.selectedBottomLine : ""
            }`}
          />
        </Link>
        <Link className={classes.link} to={routes.activity.path}>
          Activity
          <span
            className={`${classes.tabBottomLine} ${
              currentPath === PATHNAME.ACTIVITY ? classes.selectedBottomLine : ""
            }`}
          />
        </Link>
      </div>
      <div className={`${classes.block} ${classes.rightBlock}`}>
        <NetworkSelector />
      </div>
    </header>
  );
};
