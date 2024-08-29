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
  production: [
    {
      gasLimit: 50000,
      id: "42161-28518", // arbitrum - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-42161", // vizing - arbitrum
    },
    {
      gasLimit: 50000,
      id: "10-28518", // optimism - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-10", // vizing - optimism
    },
    {
      gasLimit: 50000,
      id: "1101-28518", // polygon - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-1101", // vizing - polygon
    },
    {
      gasLimit: 50000,
      id: "8453-28518", // base - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-8453", // vizing - base
    },
    {
      gasLimit: 50000,
      id: "167000-28518", // taiko - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-167000", // vizing - taiko
    },
    {
      gasLimit: 50000,
      id: "59144-28518", // linea - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-59144", // vizing - linea
    },
    {
      gasLimit: 50000,
      id: "81457-28518", // blast - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-81457", // vizing - blast
    },
    {
      gasLimit: 50000,
      id: "60808-28518", // bob - vizing
    },
    {
      gasLimit: 500000,
      id: "28518-60808", // vizing - bob
    },
  ],
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
  if (target) {
    return target.gasLimit;
  } else {
    return from === 28516 || from === 28518 ? 500000 : 50000;
  }
};
