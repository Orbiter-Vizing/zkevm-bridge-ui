import React, { FC } from "react";

import { ReactComponent as XMarkIcon } from "src/assets/icons/xmark.svg";
import { Chain } from "src/domain";
import { Card } from "src/views/shared/card/card.view";
import { useListStyles } from "src/views/shared/chain-list/chain-list.styles";
import { Portal } from "src/views/shared/portal/portal.view";
import { Typography } from "src/views/shared/typography/typography.view";

interface ChainListProps {
  chains: Chain[];
  onClick: (chain: Chain) => void;
  onClose: () => void;
}

export const ChainList: FC<ChainListProps> = ({ chains, onClick, onClose }) => {
  const classes = useListStyles();

  const onOutsideClick = (event: React.MouseEvent) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    onClose();
  };

  const chainListWithoutVizing = chains.map((chain) => {
    if (chain.key !== "vizing") {
      return chain;
    }
  });

  return (
    <Portal>
      <div className={classes.background} onMouseDown={onOutsideClick}>
        <Card className={classes.card}>
          <div className={classes.header}>
            <p className={classes.headerText}>Select Network</p>
            {/* <button className={classes.closeButton} onClick={onClose}>
              <XMarkIcon className={classes.closeButtonIcon} />
            </button> */}
          </div>
          <div className={classes.list}>
            {chainListWithoutVizing.map((chain) => {
              return chain ? (
                <button className={classes.button} key={chain.key} onClick={() => onClick(chain)}>
                  <chain.Icon className={classes.icon} />
                  <p className={classes.chainNameText}>{chain.name}</p>
                </button>
              ) : (
                ""
              );
            })}
          </div>
        </Card>
      </div>
    </Portal>
  );
};
