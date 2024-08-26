import IconETH from "src/assets/icons/tokens/eth-icon.svg";
import IconUSDC from "src/assets/icons/tokens/usdc-icon.svg";
import IconUSDT from "src/assets/icons/tokens/usdt-icon.svg";

export interface EthereumErc20TokensConfigInterface {
  dev: TokenConfig[];
  production: TokenConfig[];
  test: TokenConfig[];
}

interface TokenConfig {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}

export type EnvString = "dev" | "test" | "production";

export const EthereumErc20TokensConfig: EthereumErc20TokensConfigInterface = {
  dev: [
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec4",
      chainId: 11155111,
      decimals: 6,
      logoURI: IconUSDT,
      name: "Tether USD",
      symbol: "USDT",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec3",
      chainId: 11155111,
      decimals: 6,
      logoURI: IconUSDC,
      name: "USD Coin",
      symbol: "USDC",
    },
    // Ethereum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155111,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Vizing ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 28518,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Arbitrum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 421614,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Optimism ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155420,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Base ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 84532,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Taiko ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 167009,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Linea ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 59141,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Scroll ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 534351,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Blast ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 168587773,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // BOB ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 111,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // PolygonzkEVM ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 2442,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
  ],
  production: [
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      chainId: 1,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      name: "Tether USD",
      symbol: "USDT",
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chainId: 1,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      name: "USD Coin",
      symbol: "USDC",
    },
  ],
  test: [
    // Ethereum USDT
    {
      address: "0x93A8672e1097D17e850417aC5d56bd38AA8DaE1c",
      chainId: 11155111,
      decimals: 6,
      logoURI: IconUSDT,
      name: "Tether USD",
      symbol: "USDT",
    },
    // Ethereum USDC
    {
      address: "0x51fCe89b9f6D4c530698f181167043e1bB4abf89",
      chainId: 11155111,
      decimals: 6,
      logoURI: IconUSDC,
      name: "USD Coin",
      symbol: "USDC",
    },
    // Ethereum Orbit
    {
      address: "0x4c668404e961ba1b76abfa923f5490322f72be85",
      chainId: 11155111,
      decimals: 9,
      logoURI: "https://pbs.twimg.com/profile_images/1797891012875956224/y1DBOGtV_400x400.jpg",
      name: "Orbit Coin",
      symbol: "Orbit",
    },
    // Ethereum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155111,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Vizing Oribt
    {
      address: "0x130e103c3042336d957f15020e5a87e59bd3f8a7",
      chainId: 28516,
      decimals: 9,
      logoURI: "https://pbs.twimg.com/profile_images/1797891012875956224/y1DBOGtV_400x400.jpg",
      name: "Orbit Coin",
      symbol: "Orbit",
    },
    // Vizing ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 28516,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Vizing USDT
    {
      address: "0xf927698905C14353a0D76e8083cc21aF3EB12212",
      chainId: 28516,
      decimals: 18,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      name: "Tether USD",
      symbol: "USDT",
    },
    // Vizing USDC
    {
      address: "0x0FF68b6f4e6Ba549C12710A77066C561D12a5018",
      chainId: 28516,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      name: "USD Coin",
      symbol: "USDC",
    },
    // Arbitrum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 421614,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Optimism ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155420,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Base ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 84532,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Taiko ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 167009,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Linea ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 59141,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Scroll ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 534351,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // Blast ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 168587773,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // BOB ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 111,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
    // PolygonzkEVM ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 2442,
      decimals: 18,
      logoURI: IconETH,
      name: "Ether",
      symbol: "ETH",
    },
  ],
};
