import { BigNumber } from "ethers";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { ReactComponent as ClockIcon } from "src/assets/icons/clock.svg";
import { ReactComponent as SettingIcon } from "src/assets/icons/setting.svg";
import { ReactComponent as PolygonZkEVMLogo } from "src/assets/vizing-logo.svg";
// import { AUTO_REFRESH_RATE } from "src/constants";
import { useBridgeContext } from "src/contexts/bridge.context";
import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import {
  AsyncTask,
  Bridge,
  CompletedBridge,
  InitiatedBridge,
  OnHoldBridge,
  PendingBridge,
} from "src/domain";
import { useCallIfMounted } from "src/hooks/use-call-if-mounted";
import { routes } from "src/routes";
import { ProofOfEfficiency__factory } from "src/types/contracts/proof-of-efficiency";
import { areSettingsVisible } from "src/utils/feature-toggles";
import { isAsyncTaskDataAvailable, isMetaMaskUserRejectedRequestError } from "src/utils/types";
import { usePendingListStyles } from "src/views/home/components/pending-list/pending-list.styles";
import { PendingListCard } from "src/views/home/components/pending-list-card2/pending-list-card.view";
import { NetworkSelector } from "src/views/shared/network-selector/network-selector.view";
import { PageLoader } from "src/views/shared/page-loader/page-loader.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const PAGE_SIZE = 50;
const AUTO_REFRESH_RATE = 3000;

export const PendingList: FC = () => {
  const classes = usePendingListStyles();
  const env = useEnvContext();
  const callIfMounted = useCallIfMounted();
  const { connectedProvider } = useProvidersContext();
  const { claim, fetchBridges, getPendingBridges } = useBridgeContext();
  // const [bridgeList, setBridgeList] = useState<Bridge[]>();
  const [apiBridges, setApiBridges] = useState<AsyncTask<Bridge[], undefined, true>>({
    status: "pending",
  });
  const [areBridgesDisabled, setAreBridgesDisabled] = useState<boolean>(false);
  const [lastVerifiedBatch, setLastVerifiedBatch] = useState<AsyncTask<BigNumber, string>>({
    status: "pending",
  });

  const fetchBridgesAbortController = useRef<AbortController>(new AbortController());

  const handleClick = async () => {
    const bridges = await getPendingBridges();
    console.log("pending bridges in withdraw", bridges);
  };

  const filterBridge = (bridges: Bridge[]) => {
    return bridges.map((bridge) => {
      if (bridge.status !== "completed") {
        return bridge;
      }
    });
  };

  const onClaim = (bridge: Bridge) => {
    if (bridge.status === "on-hold") {
      setAreBridgesDisabled(true);
      claim({
        bridge,
      })
        .then(() => {
          console.log("claim success!");
        })
        .catch((error) => {
          console.log("claim failed error", error);
          // callIfMounted(() => {
          //   if (isMetaMaskUserRejectedRequestError(error) === false) {
          //     void parseError(error).then((parsed) => {
          //       if (parsed === "wrong-network") {
          //         setWrongNetworkBridges([...wrongNetworkBridges, bridge.id]);
          //       } else {
          //         notifyError(error);
          //       }
          //     });
          //   }
          // });
        })
        .finally(() => {
          // if (isAsyncTaskDataAvailable<Bridge[], undefined, true>(apiBridges)) {
          //   getPendingBridges(apiBridges.data)
          //     .then((data) => {
          //       callIfMounted(() => {
          //         setPendingBridges({ data, status: "successful" });
          //       });
          //     })
          //     .catch((error) => {
          //       callIfMounted(() => {
          //         notifyError(error);
          //       });
          //     })
          //     .finally(() => setAreBridgesDisabled(false));
          // }
        });
    }
  };

  const loader = (
    <div className={classes.loadingWrap}>
      <PageLoader />
    </div>
  );

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
          // setBridgeList(bridges);
        })
        .catch((error) => {
          console.log("error in pending list", error);
        });
    }
  };

  const filterBridges = (allBridges: Bridge[]) => {
    const result: (PendingBridge | InitiatedBridge | OnHoldBridge)[] = [];
    allBridges.forEach((bridge) => {
      if (bridge.status !== "completed" && bridge.to.key === "ethereum") {
        result.push(bridge);
      }
    });
    return result;
  };

  const processFetchBridgesSuccess = useCallback((bridges: Bridge[]) => {
    // setLastLoadedItem(bridges.length);
    setApiBridges({ data: bridges, status: "successful" });
    // getPendingBridges(bridges)
    //   .then((data) => {
    //     callIfMounted(() => {
    //       setPendingBridges({ data, status: "successful" });
    //     });
    //   })
    //   .catch((error) => {
    //     callIfMounted(() => {
    //       notifyError(error);
    //     });
    //   });
  }, []);

  useEffect(() => {
    // Polling lastVerifiedBatch
    if (env) {
      const ethereum = env.chains[0];
      const poeContract = ProofOfEfficiency__factory.connect(
        ethereum.poeContractAddress,
        ethereum.provider
      );
      console.log("poe contract:", poeContract);
      console.log("ethereum:", ethereum);
      const refreshLastVerifiedBatch = () => {
        setLastVerifiedBatch((currentLastVerifiedBatch) =>
          isAsyncTaskDataAvailable(currentLastVerifiedBatch)
            ? { data: currentLastVerifiedBatch.data, status: "reloading" }
            : { status: "loading" }
        );
        poeContract
          .lastVerifiedBatch()
          .then((newLastVerifiedBatch) => {
            console.log("newLastVerifiedBatch", newLastVerifiedBatch);
            setLastVerifiedBatch({
              data: newLastVerifiedBatch,
              status: "successful",
            });
          })
          .catch(() => {
            setLastVerifiedBatch({
              error: "An error occurred getting the last verified batch",
              status: "failed",
            });
          });
      };
      refreshLastVerifiedBatch();
      const intervalId = setInterval(refreshLastVerifiedBatch, AUTO_REFRESH_RATE);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [env]);

  useEffect(() => {
    // Initial API load
    if (
      env &&
      connectedProvider.status === "successful"
      // && tokens
    ) {
      fetchBridgesAbortController.current = new AbortController();
      console.log("Initial API load...");
      fetchBridges({
        abortSignal: fetchBridgesAbortController.current.signal,
        env,
        ethereumAddress: connectedProvider.data.account,
        limit: PAGE_SIZE,
        offset: 0,
        type: "load",
      })
        .then(({ bridges, total }) => {
          console.log("initial-loading bridges", bridges);
          callIfMounted(() => {
            processFetchBridgesSuccess(bridges);
            // setTotal(total);
          });
        })
        .catch((error) => {
          console.error("Initial load bridges in pending list error", error);
        });
    }
    return () => {
      fetchBridgesAbortController.current.abort();
    };
  }, [
    connectedProvider,
    env,
    // tokens,
    callIfMounted,
    fetchBridges,
    // processFetchBridgesError,
    processFetchBridgesSuccess,
  ]);

  useEffect(() => {
    // Polling bridges
    console.log("useEffect: refresh bridges in pending list");
    if (
      env &&
      connectedProvider.status === "successful" &&
      (apiBridges.status === "successful" || apiBridges.status === "failed")
    ) {
      const refreshBridges = () => {
        console.log("refresh bridges in pending list");
        setApiBridges(
          apiBridges.status === "successful"
            ? { data: apiBridges.data, status: "reloading" }
            : { status: "loading" }
        );
        fetchBridgesAbortController.current = new AbortController();
        fetchBridges({
          env,
          ethereumAddress: connectedProvider.data.account,
          limit: PAGE_SIZE,
          offset: 0,
          type: "load",
        })
          .then(({ bridges, total }) => {
            console.log("poll-loading bridges", bridges);
            callIfMounted(() => {
              processFetchBridgesSuccess(bridges);
              // setTotal(total);
            });
          })
          .catch((error) => {
            console.error("refresh bridges error", error);
          });
      };
      const intervalId = setInterval(refreshBridges, AUTO_REFRESH_RATE);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [
    connectedProvider,
    apiBridges,
    env,
    // lastLoadedItem,
    fetchBridges,
    // processFetchBridgesError,
    processFetchBridgesSuccess,
    callIfMounted,
  ]);

  if (!env) {
    return null;
  }

  switch (apiBridges.status) {
    case "pending":
    case "loading": {
      return <div>{loader}</div>;
    }
    case "failed": {
      return <div>There are no pending bridges at the moment</div>;
    }
    case "successful":
    case "loading-more-items":
    case "reloading": {
      const filteredBridgesResult = filterBridges(apiBridges.data);
      console.log("filteredBridgesResult", filteredBridgesResult);

      // const filteredList = displayAll ? allBridges : pendingBridges.data;
      // const filteredList = displayAll
      //   ? splitedBridgesByIsCompleted.success
      //   : splitedBridgesByIsCompleted.notSuccess;
      return (
        <div className={classes.pendingListWrap}>
          {/* <div style={{ position: "relative" }}>
            <button
              onClick={() => getBridgesList()}
              style={{ bottom: "100%", left: "3px", position: "absolute" }}
            >
              click
            </button>
          </div> */}
          <div className={classes.header}>
            <span className={classes.headerText}>Pending</span>
            <span className={classes.pendingTxNumber}>{filteredBridgesResult.length}</span>
          </div>
          <div className={classes.cardListScrollWrap}>
            <div className={classes.cardListWrap}>
              {filteredBridgesResult.map((bridge) => {
                if (!bridge) {
                  return;
                }
                return bridge.status === "pending" ? (
                  <div
                    className={classes.cardWrap}
                    key={bridge.depositTxHash || bridge.claimTxHash}
                  >
                    <PendingListCard
                      bridge={bridge}
                      env={env}
                      isFinaliseDisabled={true}
                      lastVerifiedBatch={lastVerifiedBatch}
                      networkError={false}
                      showFiatAmount={false}
                    />
                  </div>
                ) : (
                  <div className={classes.cardWrap} key={bridge.id}>
                    <PendingListCard
                      bridge={bridge}
                      env={env}
                      // isFinaliseDisabled={areBridgesDisabled}
                      isFinaliseDisabled={false}
                      lastVerifiedBatch={lastVerifiedBatch}
                      networkError={false}
                      onClaim={() => onClaim(bridge)}
                      showFiatAmount={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }
};
