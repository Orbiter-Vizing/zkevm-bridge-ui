import { FC } from "react";
import { constants as ethersConstants } from "ethers";

import useTokenDetailsStyles from "src/views/home/components/token-details/token-details.styles";
import Typography from "src/views/shared/typography/typography.view";
import { getShortenedEthereumAddress } from "src/utils/addresses";
import { copyToClipboard } from "src/utils/browser";
import { Token } from "src/domain";
import { useEnvContext } from "src/contexts/env.context";
import { ReactComponent as CopyIcon } from "src/assets/icons/copy.svg";
import { ReactComponent as NewWindowIcon } from "src/assets/icons/new-window.svg";

interface TokenDetailsProps {
  token: Token;
  className?: string;
}

const TokenDetails: FC<TokenDetailsProps> = ({ token, className }) => {
  const classes = useTokenDetailsStyles();
  const env = useEnvContext();

  if (!env) {
    return null;
  }

  const nameRow = (
    <div className={classes.row}>
      <Typography type="body2" className={classes.alignRow}>
        Token name
      </Typography>
      <Typography type="body1" className={classes.alignRow}>
        {token.name}
      </Typography>
    </div>
  );

  const symbolRow = (
    <div className={classes.row}>
      <Typography type="body2" className={classes.alignRow}>
        Token symbol
      </Typography>
      <Typography type="body1" className={classes.alignRow}>
        {token.symbol}
      </Typography>
    </div>
  );

  const decimalsRow = (
    <div className={classes.row}>
      <Typography type="body2" className={classes.alignRow}>
        Token decimals
      </Typography>
      <Typography type="body1" className={classes.alignRow}>
        {token.decimals}
      </Typography>
    </div>
  );

  if (token.address === ethersConstants.AddressZero) {
    const ethereum = env.chains[0];
    const polygonZkEVM = env.chains[1];

    const ethereumRow = (
      <div className={classes.row}>
        <Typography type="body2" className={classes.alignRow}>
          <ethereum.Icon />
          L1 token address
        </Typography>
        <Typography type="body1" className={classes.alignRow}>
          {getShortenedEthereumAddress(ethersConstants.AddressZero)}
        </Typography>
      </div>
    );

    const polygonZkEVMRow = (
      <div className={classes.row}>
        <Typography type="body2" className={classes.alignRow}>
          <polygonZkEVM.Icon />
          L2 token address
        </Typography>
        <Typography type="body1" className={classes.alignRow}>
          {getShortenedEthereumAddress(ethersConstants.AddressZero)}
        </Typography>
      </div>
    );

    return (
      <div className={`${classes.wrapper} ${className || ""}`}>
        {ethereumRow}
        {polygonZkEVMRow}
        {nameRow}
        {symbolRow}
        {decimalsRow}
      </div>
    );
  } else {
    const nativeTokenChain = env.chains.find(({ chainId }) => chainId === token.chainId);
    const nativeTokenAddress = token.address;

    const wrappedTokenChainId = token.wrappedToken?.chainId;
    const wrappedTokenAddress = token.wrappedToken?.address;

    const wrappedTokenChain =
      wrappedTokenChainId !== undefined
        ? env.chains.find(({ chainId }) => chainId === wrappedTokenChainId)
        : undefined;

    const nativeAddressRow = nativeTokenChain ? (
      <div className={classes.row}>
        <Typography type="body2" className={classes.alignRow}>
          <nativeTokenChain.Icon />
          {`${nativeTokenChain.key === "ethereum" ? "L1" : "L2"} token address`}
        </Typography>
        <div className={classes.rowRightBlock}>
          <Typography type="body1" className={classes.tokenAddress}>
            {getShortenedEthereumAddress(nativeTokenAddress)}
          </Typography>
          <button
            className={classes.button}
            onClick={() => {
              copyToClipboard(nativeTokenAddress);
            }}
          >
            <CopyIcon className={classes.copyIcon} />
          </button>
          <a
            className={classes.button}
            href={`${nativeTokenChain.explorerUrl}/address/${nativeTokenAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            <NewWindowIcon className={classes.newWindowIcon} />
          </a>
        </div>
      </div>
    ) : null;

    const wrappedAddressRow =
      wrappedTokenChain && wrappedTokenAddress ? (
        <div className={classes.row}>
          <Typography type="body2" className={classes.alignRow}>
            <wrappedTokenChain.Icon />
            {`${wrappedTokenChain.key === "ethereum" ? "L1" : "L2"} token address`}
          </Typography>
          <div className={classes.rowRightBlock}>
            <Typography type="body1" className={classes.tokenAddress}>
              {getShortenedEthereumAddress(wrappedTokenAddress)}
            </Typography>
            <button
              className={classes.button}
              onClick={() => {
                copyToClipboard(wrappedTokenAddress);
              }}
            >
              <CopyIcon className={classes.copyIcon} />
            </button>
            <a
              className={classes.button}
              href={`${wrappedTokenChain.explorerUrl}/address/${wrappedTokenAddress}`}
              target="_blank"
              rel="noreferrer"
            >
              <NewWindowIcon className={classes.newWindowIcon} />
            </a>
          </div>
        </div>
      ) : null;

    return (
      <div className={`${classes.wrapper} ${className || ""}`}>
        {nativeAddressRow}
        {wrappedAddressRow}
        {nameRow}
        {symbolRow}
        {decimalsRow}
      </div>
    );
  }
};

export default TokenDetails;
