import { FC, PropsWithChildren, useEffect } from "react";

import { getPolicyCheck, setStorageByKey } from "src/adapters/storage";
import * as constants from "src/constants";
import { useProvidersContext } from "src/contexts/providers.context";
import { PolicyCheck, WalletName } from "src/domain";

import { useConnectWalletButtonStyles } from "src/views/shared/connect-wallet-button/connect-wallet-button.styles";
// import { Spinner } from "src/views/shared/spinner/spinner.view";

type ConnectWalletButtonProps = PropsWithChildren<{
  fontSize?: number;
  fontWeight?: number;
  type?: "";
}>;

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({
  fontSize,
  fontWeight,
  type,
}) => {
  const classes = useConnectWalletButtonStyles();
  const { connectedProvider, connectProvider } = useProvidersContext();

  const onCheckAndConnectProvider = () => {
    const walletName = WalletName.METAMASK;
    // setSelectedWallet(walletName);
    const checked = getPolicyCheck();
    if (checked === PolicyCheck.Checked) {
      // setStorageByKey({
      //   key: constants.DISCONNECT_KEY,
      //   value: false,
      // });
      void connectProvider(walletName);
    } else {
      // setShowPolicyModal(true);
    }
  };

  return (
    <div
      className={classes.button}
      onClick={onCheckAndConnectProvider}
      // disabled={disabled || isLoading}
      // onClick={onClick}
      // type={type}
      style={{
        fontSize,
        fontWeight,
      }}
    >
      Connect Wallet
      {/* {children} */}
      {/* {isLoading && (
        <span className={addSpinnerSpacing ? classes.paddedSpinner : ""}>
          <Spinner color="#fff" size={24} />
        </span>
      )} */}
    </div>
  );
};
