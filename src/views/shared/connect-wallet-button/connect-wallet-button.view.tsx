import { FC, PropsWithChildren } from "react";

import { useProvidersContext } from "src/contexts/providers.context";
import { WalletName } from "src/domain";
import { useConnectWalletButtonStyles } from "src/views/shared/connect-wallet-button/connect-wallet-button.styles";

type ConnectWalletButtonProps = PropsWithChildren<{
  fontSize?: number;
  fontWeight?: number;
  type?: "";
}>;

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({ fontSize, fontWeight }) => {
  const classes = useConnectWalletButtonStyles();
  const { connectProvider } = useProvidersContext();

  const onCheckAndConnectProvider = () => {
    const walletName = WalletName.METAMASK;
    void connectProvider(walletName);
  };

  return (
    <>
      <div
        className={classes.button}
        onClick={onCheckAndConnectProvider}
        style={{
          fontSize,
          fontWeight,
        }}
      >
        Connect Wallet
      </div>
    </>
  );
};
