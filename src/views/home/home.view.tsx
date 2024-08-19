import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getIsDepositWarningDismissed, setIsDepositWarningDismissed } from "src/adapters/storage";

import { ReactComponent as MetaMaskIcon } from "src/assets/icons/metamask.svg";
import { useEnvContext } from "src/contexts/env.context";
import { useFormContext } from "src/contexts/form.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { FormData, ModalState } from "src/domain";
import { routes } from "src/routes";
import { BridgeDepositForm } from "src/views/home/components/bridge-deposit-form/bridge-deposit-form.view";
import { BridgeForm } from "src/views/home/components/bridge-form/bridge-form.view";
import { BridgeWithdrawForm } from "src/views/home/components/bridge-withdraw-form/bridge-withdraw-form.view";
import { DepositWarningModal } from "src/views/home/components/deposit-warning-modal/deposit-warning-modal.view";
import { Header } from "src/views/home/components/header/header.view";
import { PendingList } from "src/views/home/components/pending-list/pending-list.view";
import { useHomeStyles } from "src/views/home/home.styles";
import { NetworkBox } from "src/views/shared/network-box/network-box.view";
import { Typography } from "src/views/shared/typography/typography.view";

enum BridgeTab {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export const Home = (): JSX.Element => {
  const classes = useHomeStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const env = useEnvContext();
  const { formData, setFormData } = useFormContext();
  const { connectedProvider } = useProvidersContext();
  const [depositWarningModal, setDepositWarningModal] = useState<ModalState<FormData>>({
    status: "closed",
  });

  const [selectedTab, setSelectedTab] = useState<BridgeTab>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    (location.state && location.state.fromTab) || BridgeTab.DEPOSIT
  );
  const handleSelectTab = (bridgeTab: BridgeTab) => {
    setSelectedTab(bridgeTab);
  };

  const onSubmitForm = (formData: FormData, hideDepositWarning?: boolean) => {
    if (hideDepositWarning) {
      setIsDepositWarningDismissed(hideDepositWarning);
    }
    console.log("set formData", formData);
    setFormData(formData);
    navigate(routes.bridgeConfirmation.path, {
      state: {
        fromTab: selectedTab,
      },
    });
  };

  const onCheckShowDepositWarningAndSubmitForm = (formData: FormData) => {
    const isDepositWarningDismissed = getIsDepositWarningDismissed();

    if (
      env &&
      env.isDepositWarningEnabled &&
      !isDepositWarningDismissed &&
      formData.from.key === "ethereum"
    ) {
      setDepositWarningModal({
        data: formData,
        status: "open",
      });
    } else {
      onSubmitForm(formData);
    }
  };

  const onResetForm = () => {
    setFormData(undefined);
  };

  useEffect(() => {
    if (location.state) {
      // Clear the state after loading the component
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  return (
    <div className={classes.contentWrapper}>
      {/* <Header /> */}
      {connectedProvider.status === "successful" && (
        <>
          {/* <div className={classes.ethereumAddress}>
            <MetaMaskIcon className={classes.metaMaskIcon} />
            <Typography type="body1">
              {getPartiallyHiddenEthereumAddress(connectedProvider.data.account)}
            </Typography>
          </div> */}
          {/* <div className={classes.networkBoxWrapper}>
            <NetworkBox />
          </div> */}
          <div className={classes.formWrap}>
            <div className={classes.bridgeTabsWrap}>
              <span
                className={`${classes.bridgeTab} ${
                  selectedTab === BridgeTab.DEPOSIT ? classes.selectedTab : ""
                }`}
                onClick={() => handleSelectTab(BridgeTab.DEPOSIT)}
              >
                Deposit
              </span>
              <span
                className={`${classes.bridgeTab} ${
                  selectedTab === BridgeTab.WITHDRAW ? classes.selectedTab : ""
                }`}
                onClick={() => handleSelectTab(BridgeTab.WITHDRAW)}
              >
                Withdraw
              </span>
            </div>
            {/* <BridgeForm
              account={connectedProvider.data.account}
              formData={formData}
              onResetForm={onResetForm}
              onSubmit={onCheckShowDepositWarningAndSubmitForm}
            /> */}
            {selectedTab === BridgeTab.DEPOSIT && (
              <BridgeDepositForm
                account={connectedProvider.data.account}
                formData={formData}
                onResetForm={onResetForm}
                onSubmit={onCheckShowDepositWarningAndSubmitForm}
              />
            )}
            {selectedTab === BridgeTab.WITHDRAW && (
              <BridgeWithdrawForm
                account={connectedProvider.data.account}
                formData={formData}
                onResetForm={onResetForm}
                onSubmit={onCheckShowDepositWarningAndSubmitForm}
              />
            )}
            {/* {selectedTab === BridgeTab.WITHDRAW && "withdraw form"} */}
          </div>
          {selectedTab === BridgeTab.WITHDRAW && (
            <div className={classes.pendingListWrap}>
              <PendingList />
            </div>
          )}
          {/* {depositWarningModal.status === "open" && (
            <DepositWarningModal
              formData={depositWarningModal.data}
              onAccept={onSubmitForm}
              onCancel={() => setDepositWarningModal({ status: "closed" })}
            />
          )} */}
        </>
      )}
    </div>
  );
};
