import { FC } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/vizing-logo.svg";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { routes } from "src/routes";
import { areSettingsVisible } from "src/utils/feature-toggles";
import { usePendingListStyles } from "src/views/home/components/pending-list/pending-list.styles";
import { PendingListCard } from "src/views/home/components/pending-list-card/pending-list-card.view";
import { NetworkSelector } from "src/views/shared/network-selector/network-selector.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const PAGE_SIZE = 50;

export const PendingList: FC = () => {
  const classes = usePendingListStyles();
  const env = useEnvContext();
  const { connectedProvider } = useProvidersContext();
  const { fetchBridges, getPendingBridges } = useBridgeContext();

  const handleClick = async () => {
    const bridges = await getPendingBridges();
    console.log("pending bridges in withdraw", bridges);
  };

  const getBridgesList = () => {
    if (env && connectedProvider.status === "successful") {
      // const abortSignal = new AbortController();
      console.log("request list");
      fetchBridges({
        // abortSignal,
        env,
        ethereumAddress: connectedProvider.data.account,
        limit: PAGE_SIZE,
        offset: 0,
        type: "load",
      })
        .then(({ bridges, total }) => {
          console.log("get bridges in pending list", bridges);
        })
        .catch((error) => {
          console.log("error in pending list", error);
        });
    }
  };

  if (!env) {
    return null;
  }

  return (
    <div className={classes.pendingListWrap}>
      <button onClick={() => getBridgesList()}>click</button>
      <div className={classes.header}>
        <span className={classes.headerText}>Pending</span>
        <span className={classes.pendingTxNumber}>4</span>
      </div>
      <div className={classes.cardListScrollWrap}>
        <div className={classes.cardListWrap}>
          <div className={classes.cardWrap}>
            <PendingListCard status="pending" />
          </div>
          <div className={classes.cardWrap}>
            <PendingListCard status="success" />
          </div>
          <div className={classes.cardWrap}>
            <PendingListCard status="success" />
          </div>
          <div className={classes.cardWrap}>
            <PendingListCard status="success" />
          </div>
        </div>
      </div>
    </div>
  );
};
