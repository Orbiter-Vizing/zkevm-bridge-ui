import { FC, PropsWithChildren, useEffect, useState } from "react";

// import { reportError } from "src/adapters/error";
import { ReactComponent as BackgroundPattern } from "src/assets/background-pattern.svg";
import { useEnvContext } from "src/contexts/env.context";
// import { useUIContext } from "src/contexts/ui.context";
import { Header } from "src/views/core/components/header/header.view";
import { useLayoutStyles } from "src/views/core/layout/layout.styles";
import { ConfirmationModal } from "src/views/shared/confirmation-modal/confirmation-modal.view";
import { ExternalLink } from "src/views/shared/external-link/external-link.view";
// import { Snackbar } from "src/views/shared/snackbar/snackbar.view";
import { TxToast } from "src/views/shared/tx-toast/tx-toast.view";
import { Typography } from "src/views/shared/typography/typography.view";

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  const classes = useLayoutStyles();
  // const { closeSnackbar, snackbar } = useUIContext();
  const [showNetworkOutdatedModal, setShowNetworkOutdatedModal] = useState(false);
  const env = useEnvContext();

  // const onCloseSnackbar = closeSnackbar;
  // const onReportFromSnackbar = reportError;

  useEffect(() => {
    if (env) {
      setShowNetworkOutdatedModal(env.outdatedNetworkModal.isEnabled);
    }
  }, [env]);

  return (
    <>
      <div className={classes.layout}>
        <div className={classes.headerContainer}>
          <Header />
        </div>
        <div className={classes.container}>{children}</div>
        <div className={classes.backgroundPatternWrap}>
          <BackgroundPattern className={classes.backgroundPattern} />
        </div>
      </div>
      {/* {env && snackbar.status === "open" && (
        <Snackbar
          message={snackbar.message}
          onClose={onCloseSnackbar}
          onReport={onReportFromSnackbar}
          reportForm={env.reportForm}
        />
      )} */}
      <TxToast />
      {env && showNetworkOutdatedModal && env.outdatedNetworkModal.isEnabled && (
        <ConfirmationModal
          message={
            <div>
              {env.outdatedNetworkModal.messageParagraph1 && (
                <Typography type="body2">{env.outdatedNetworkModal.messageParagraph1}</Typography>
              )}
              {env.outdatedNetworkModal.messageParagraph2 && (
                <>
                  <br />
                  <Typography type="body2">{env.outdatedNetworkModal.messageParagraph2}</Typography>
                </>
              )}
              <br />
              {env.outdatedNetworkModal.url && (
                <Typography className={classes.linkContainer} type="body2">
                  <ExternalLink href={env.outdatedNetworkModal.url}>
                    {env.outdatedNetworkModal.url}
                  </ExternalLink>
                </Typography>
              )}
            </div>
          }
          onClose={() => setShowNetworkOutdatedModal(false)}
          onConfirm={() => setShowNetworkOutdatedModal(false)}
          showCancelButton={false}
          title={env.outdatedNetworkModal.title}
        />
      )}
    </>
  );
};
