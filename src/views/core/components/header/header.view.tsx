import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { ReactComponent as VizingLogo } from "src/assets/vizing-logo.svg";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { routes } from "src/routes";
import { useHeaderStyles } from "src/views/core/components/header/header.styles";
import { AccountButton } from "src/views/shared/account-button/account-button.view";
import { ConnectWalletButton } from "src/views/shared/connect-wallet-button/connect-wallet-button.view";

enum PATHNAME {
  ACTIVITY = "/activity",
  BRIDGECONFORMATION = "/bridge-confirmation",
  HOME = "/",
}

export const Header: FC = () => {
  const classes = useHeaderStyles();
  const env = useEnvContext();
  const { connectedProvider } = useProvidersContext();

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
        <VizingLogo className={classes.logo} />
      </div>
      <div className={`${classes.block} ${classes.centerBlock}`}>
        <Link className={classes.link} to={routes.home.path}>
          Bridge
          <span
            className={`${classes.tabBottomLine}
            ${currentPath === PATHNAME.HOME ? classes.selectedBottomLine : ""}
            ${currentPath === PATHNAME.BRIDGECONFORMATION ? classes.selectedBottomLine : ""}`}
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
        {connectedProvider.status === "successful" && <AccountButton />}
        {connectedProvider.status !== "successful" && (
          <div className={classes.connectButtonWrap}>
            <ConnectWalletButton fontSize={16} fontWeight={500} />
          </div>
        )}
      </div>
    </header>
  );
};
