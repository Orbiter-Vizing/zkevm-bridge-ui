export interface OmniChainGasLimitConfigInterface {
  production: GasLimitConfig[];
  test: GasLimitConfig[];
}

interface GasLimitConfig {
  gasLimit: number;
  id: string;
}

export type EnvString = "test" | "production";

export const OmniChainGasLimitConfig: OmniChainGasLimitConfigInterface = {
  production: [],
  test: [
    {
      gasLimit: 50000,
      id: "421614-28516", // arbitrum - vizing 0.00005e
    },
    {
      gasLimit: 500000,
      id: "28516-421614", // vizing - arbitrum
    },
    {
      gasLimit: 50000,
      id: "11155420-28516", // optimism - vizing 0.00005e
    },
    {
      gasLimit: 500000,
      id: "28516-11155420", // vizing - optimism
    },
    {
      gasLimit: 50000,
      id: "2442-28516", // polygon - vizing
    },
    {
      gasLimit: 500000,
      id: "28516-2442", // vizing - polygon
    },
    {
      gasLimit: 50000,
      id: "84532-28516", // base - vizing
    },
    {
      gasLimit: 500000,
      id: "28516-84532", // vizing - base
    },
    {
      gasLimit: 50000,
      id: "167009-28516", // taiko - vizing
    },
    {
      gasLimit: 500000,
      id: "28516-167009", // vizing - taiko
    },
    {
      gasLimit: 50000,
      id: "59141-28516", // linea - vizing
    },
    {
      gasLimit: 500000,
      id: "28516-59141", // vizing - linea
    },
    {
      gasLimit: 50000,
      id: "168587773-28516", // blast - vizing
    },
    {
      gasLimit: 500000,
      id: "28516-168587773", // vizing - blast
    },
    {
      gasLimit: 50000,
      id: "111-28516", // bob - vizing
    },
    {
      gasLimit: 500000,
      id: "28516-111", // vizing - bob
    },
  ],
};

export const getOmniChainGasLimit = (from: number, to: number) => {
  // eslint-disable-next-line no-type-assertion/no-type-assertion
  const envString = import.meta.env.MODE as EnvString;
  const config = OmniChainGasLimitConfig[envString];
  const id = `${from}-${to}`;
  const target = config.find((item) => {
    return item.id === id;
  });
  return target?.gasLimit;
};
