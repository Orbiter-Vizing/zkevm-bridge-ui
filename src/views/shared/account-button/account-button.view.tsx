import { FC, PropsWithChildren, useEffect, useState } from "react";
import { z } from "zod";
import { getStorageByKey, setStorageByKey } from "src/adapters/storage";

import { ReactComponent as LogoutIcon } from "src/assets/icons/logout-icon.svg";
import { ReactComponent as AccountIcon } from "src/assets/icons/metamask.svg";
import * as constants from "src/constants";

import { useProvidersContext } from "src/contexts/providers.context";
import { useAccountButtonStyles } from "src/views/shared/account-button/account-button.styles";
import { Spinner } from "src/views/shared/spinner/spinner.view";
import { Typography } from "src/views/shared/typography/typography.view";

const ADDRESS_VISIBLE_LENGTH = 4;

export const AccountButton: FC = () => {
  // const addSpinnerSpacing = children !== undefined;
  const classes = useAccountButtonStyles();
  const { changeNetwork, connectedProvider, setConnectedProvider } = useProvidersContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  console.log("connectedProvider in account button", connectedProvider);

  const getAccountShortcut = (address: string) => {
    const head = address.substring(0, ADDRESS_VISIBLE_LENGTH);
    const end = address.substring(address.length - ADDRESS_VISIBLE_LENGTH, address.length);
    return `${head}...${end}`;
  };

  const handleDisconnectClick = () => {
    console.log("disconnect");
    setConnectedProvider({
      status: "pending",
    });
    if (window.ethereum && window.ethereum.request) {
      void window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    }
    // setStorageByKey({
    //   key: constants.DISCONNECT_KEY,
    //   value: true,
    // });
    // const isDisconnectAllowed = getStorageByKey({
    //   defaultValue: false,
    //   key: constants.DISCONNECT_KEY,
    //   parser: z.boolean(),
    // });
    // if (isDisconnectAllowed) {
    //   setConnectedProvider({
    //     error: "disconnect",
    //     status: "failed",
    //   });
    //   setStorageByKey({
    //     key: constants.DISCONNECT_KEY,
    //     value: false,
    //   });
    // }
  };

  useEffect(() => {
    const handleAccountButtonClick = (e: MouseEvent) => {
      const disconnectButton = document.getElementById("account-button");
      // eslint-disable-next-line no-type-assertion/no-type-assertion
      const targetElement = e.target as Node;
      if (!disconnectButton?.contains(targetElement)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("click", handleAccountButtonClick);
    return () => {
      window.removeEventListener("click", handleAccountButtonClick);
    };
  }, []);

  if (connectedProvider.status !== "successful") {
    return null;
  }

  return (
    <div className={classes.accountButtonWrap} id="account-button">
      <button className={classes.accountButton} onClick={handleButtonClick} type="button">
        <div className={classes.accountIconWrap}>
          <AccountIcon />
        </div>
        <Typography className={classes.accountButtonText} type="body1">
          {getAccountShortcut(connectedProvider.data.account)}
        </Typography>
      </button>
      {isOpen && (
        <button className={classes.disconnectButton} onClick={handleDisconnectClick}>
          <LogoutIcon className={classes.logoutIcon} />
          Disconnect
        </button>
      )}
    </div>
  );
};
