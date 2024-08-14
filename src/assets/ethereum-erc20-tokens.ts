export interface EthereumErc20TokensConfigInterface {
  development: TokenConfig[];
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

export const EthereumErc20TokensConfig: EthereumErc20TokensConfigInterface = {
  development: [
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec4",
      chainId: 11155111,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      name: "Tether USD",
      symbol: "USDT",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec3",
      chainId: 11155111,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      name: "USD Coin",
      symbol: "USDC",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec2",
      chainId: 11155111,
      decimals: 18,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      name: "Dai Stablecoin",
      symbol: "DAI",
    },
    // Ethereum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155111,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Vizing ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 28518,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Arbitrum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 421614,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Optimism ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155420,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Base ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 84532,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Taiko ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 167009,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Linea ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 59141,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Scroll ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 534351,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Blast ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 168587773,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // BOB ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 111,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // PolygonzkEVM ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 2442,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
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
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      chainId: 1,
      decimals: 18,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      name: "Dai Stablecoin",
      symbol: "DAI",
    },
  ],
  test: [
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec4",
      chainId: 11155111,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
      name: "Tether USD",
      symbol: "USDT",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec3",
      chainId: 11155111,
      decimals: 6,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
      name: "USD Coin",
      symbol: "USDC",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec2",
      chainId: 11155111,
      decimals: 18,
      logoURI:
        "https://assets-cdn.trustwallet.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
      name: "Dai Stablecoin",
      symbol: "DAI",
    },
    // Ethereum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155111,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Vizing ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 28518,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Arbitrum ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 421614,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Optimism ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 11155420,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Base ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 84532,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Taiko ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 167009,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Linea ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 59141,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Scroll ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 534351,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // Blast ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 168587773,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // BOB ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 111,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
    // PolygonzkEVM ETH
    {
      address: "0x0000000000000000000000000000000000000000",
      chainId: 2442,
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
      name: "Ether",
      symbol: "ETH",
    },
  ],
};
