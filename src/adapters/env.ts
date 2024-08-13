import { z } from "zod";

import { getChains, getUsdcToken } from "src/constants";
import * as domain from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface Env {
  VITE_ARBITRUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ARBITRUM_CHAIN_ID: string;
  VITE_ARBITRUM_EXPLORER_URL: string;
  VITE_ARBITRUM_NETWORK_ID: string;
  VITE_ARBITRUM_RPC_URL: string;
  VITE_BASE_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_BASE_CHAIN_ID: string;
  VITE_BASE_EXPLORER_URL: string;
  VITE_BASE_NETWORK_ID: string;
  VITE_BASE_RPC_URL: string;
  VITE_BLAST_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_BLAST_CHAIN_ID: string;
  VITE_BLAST_EXPLORER_URL: string;
  VITE_BLAST_NETWORK_ID: string;
  VITE_BLAST_RPC_URL: string;
  VITE_BOB_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_BOB_CHAIN_ID: string;
  VITE_BOB_EXPLORER_URL: string;
  VITE_BOB_NETWORK_ID: string;
  VITE_BOB_RPC_URL: string;
  VITE_BRIDGE_API_URL: string;
  VITE_ENABLE_DEPOSIT_WARNING: string;
  VITE_ENABLE_FIAT_EXCHANGE_RATES: string;
  VITE_ENABLE_OUTDATED_NETWORK_MODAL?: string;
  VITE_ENABLE_REPORT_FORM: string;
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_EXPLORER_URL: string;
  VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT: string;
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: string;
  VITE_ETHEREUM_RPC_URL: string;
  VITE_FIAT_EXCHANGE_RATES_API_KEY?: string;
  VITE_FIAT_EXCHANGE_RATES_API_URL?: string;
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS?: string;
  VITE_LINEA_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_LINEA_CHAIN_ID: string;
  VITE_LINEA_EXPLORER_URL: string;
  VITE_LINEA_NETWORK_ID: string;
  VITE_LINEA_RPC_URL: string;
  VITE_OPTIMISM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_OPTIMISM_CHAIN_ID: string;
  VITE_OPTIMISM_EXPLORER_URL: string;
  VITE_OPTIMISM_NETWORK_ID: string;
  VITE_OPTIMISM_RPC_URL: string;
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1?: string;
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2?: string;
  VITE_OUTDATED_NETWORK_MODAL_TITLE?: string;
  VITE_OUTDATED_NETWORK_MODAL_URL?: string;
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_POLYGON_ZK_EVM_CHAIN_ID: string;
  VITE_POLYGON_ZK_EVM_EXPLORER_URL: string;
  VITE_POLYGON_ZK_EVM_NETWORK_ID: string;
  VITE_POLYGON_ZK_EVM_RPC_URL: string;
  VITE_REPORT_FORM_ERROR_ENTRY?: string;
  VITE_REPORT_FORM_PLATFORM_ENTRY?: string;
  VITE_REPORT_FORM_URL?: string;
  VITE_REPORT_FORM_URL_ENTRY?: string;
  VITE_SCROLL_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_SCROLL_CHAIN_ID: string;
  VITE_SCROLL_EXPLORER_URL: string;
  VITE_SCROLL_NETWORK_ID: string;
  VITE_SCROLL_RPC_URL: string;
  VITE_TAIKO_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_TAIKO_CHAIN_ID: string;
  VITE_TAIKO_EXPLORER_URL: string;
  VITE_TAIKO_NETWORK_ID: string;
  VITE_TAIKO_RPC_URL: string;
  VITE_VIZING_BRIDGE_CONTRACT_ADDRESS: string;
  VITE_VIZING_CHAIN_ID: string;
  VITE_VIZING_EXPLORER_URL: string;
  VITE_VIZING_NETWORK_ID: string;
  VITE_VIZING_RPC_URL: string;
}

type GetFiatExchangeRatesEnvParams = Pick<
  Env,
  | "VITE_ENABLE_FIAT_EXCHANGE_RATES"
  | "VITE_FIAT_EXCHANGE_RATES_API_KEY"
  | "VITE_FIAT_EXCHANGE_RATES_API_URL"
  | "VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS"
> & {
  ethereumChain: domain.Chain;
};

type GetReportFormEnvParams = Pick<
  Env,
  | "VITE_ENABLE_REPORT_FORM"
  | "VITE_REPORT_FORM_URL"
  | "VITE_REPORT_FORM_ERROR_ENTRY"
  | "VITE_REPORT_FORM_PLATFORM_ENTRY"
  | "VITE_REPORT_FORM_URL_ENTRY"
>;

const stringBooleanParser = StrictSchema<string, boolean>()(
  z.string().transform((value, context) => {
    switch (value) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      default: {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          fatal: true,
          message: "The provided string input can't be parsed as a boolean",
        });
        return z.NEVER;
      }
    }
  })
);

const getFiatExchangeRatesEnv = ({
  ethereumChain,
  VITE_ENABLE_FIAT_EXCHANGE_RATES,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
}: GetFiatExchangeRatesEnvParams): domain.Env["fiatExchangeRates"] => {
  const areFiatExchangeRatesEnabled = stringBooleanParser.parse(VITE_ENABLE_FIAT_EXCHANGE_RATES);

  if (!areFiatExchangeRatesEnabled) {
    return {
      areEnabled: false,
    };
  }

  if (!VITE_FIAT_EXCHANGE_RATES_API_URL) {
    throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_API_URL env vars");
  }

  if (!VITE_FIAT_EXCHANGE_RATES_API_KEY) {
    throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_API_KEY env var");
  }

  if (!VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS) {
    throw new Error("Missing VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS env vars");
  }

  return {
    apiKey: VITE_FIAT_EXCHANGE_RATES_API_KEY,
    apiUrl: VITE_FIAT_EXCHANGE_RATES_API_URL,
    areEnabled: true,
    usdcToken: getUsdcToken({
      address: VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
      chainId: ethereumChain.chainId,
    }),
  };
};

const getReportFormEnv = ({
  VITE_ENABLE_REPORT_FORM,
  VITE_REPORT_FORM_ERROR_ENTRY,
  VITE_REPORT_FORM_PLATFORM_ENTRY,
  VITE_REPORT_FORM_URL,
  VITE_REPORT_FORM_URL_ENTRY,
}: GetReportFormEnvParams): domain.Env["reportForm"] => {
  const isReportFormEnabled = stringBooleanParser.parse(VITE_ENABLE_REPORT_FORM);

  if (!isReportFormEnabled) {
    return {
      isEnabled: false,
    };
  }

  if (!VITE_REPORT_FORM_URL) {
    throw new Error("Missing VITE_REPORT_FORM_URL env vars");
  }

  if (!VITE_REPORT_FORM_ERROR_ENTRY) {
    throw new Error("Missing VITE_REPORT_FORM_ERROR_ENTRY env vars");
  }

  if (!VITE_REPORT_FORM_PLATFORM_ENTRY) {
    throw new Error("Missing VITE_REPORT_FORM_PLATFORM_ENTRY env vars");
  }

  if (!VITE_REPORT_FORM_URL_ENTRY) {
    throw new Error("Missing VITE_REPORT_FORM_URL_ENTRY env vars");
  }

  return {
    entries: {
      error: VITE_REPORT_FORM_ERROR_ENTRY,
      platform: VITE_REPORT_FORM_PLATFORM_ENTRY,
      url: VITE_REPORT_FORM_URL_ENTRY,
    },
    isEnabled: true,
    url: VITE_REPORT_FORM_URL,
  };
};

const envToDomain = ({
  VITE_ARBITRUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ARBITRUM_CHAIN_ID,
  VITE_ARBITRUM_EXPLORER_URL,
  VITE_ARBITRUM_NETWORK_ID,
  VITE_ARBITRUM_RPC_URL,
  VITE_BASE_BRIDGE_CONTRACT_ADDRESS,
  VITE_BASE_CHAIN_ID,
  VITE_BASE_EXPLORER_URL,
  VITE_BASE_NETWORK_ID,
  VITE_BASE_RPC_URL,
  VITE_BLAST_BRIDGE_CONTRACT_ADDRESS,
  VITE_BLAST_CHAIN_ID,
  VITE_BLAST_EXPLORER_URL,
  VITE_BLAST_NETWORK_ID,
  VITE_BLAST_RPC_URL,
  VITE_BOB_BRIDGE_CONTRACT_ADDRESS,
  VITE_BOB_CHAIN_ID,
  VITE_BOB_EXPLORER_URL,
  VITE_BOB_NETWORK_ID,
  VITE_BOB_RPC_URL,
  VITE_BRIDGE_API_URL,
  VITE_ENABLE_DEPOSIT_WARNING,
  VITE_ENABLE_FIAT_EXCHANGE_RATES,
  VITE_ENABLE_OUTDATED_NETWORK_MODAL,
  VITE_ENABLE_REPORT_FORM,
  VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
  VITE_ETHEREUM_EXPLORER_URL,
  VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT,
  VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
  VITE_ETHEREUM_RPC_URL,
  VITE_FIAT_EXCHANGE_RATES_API_KEY,
  VITE_FIAT_EXCHANGE_RATES_API_URL,
  VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
  VITE_LINEA_BRIDGE_CONTRACT_ADDRESS,
  VITE_LINEA_CHAIN_ID,
  VITE_LINEA_EXPLORER_URL,
  VITE_LINEA_NETWORK_ID,
  VITE_LINEA_RPC_URL,
  VITE_OPTIMISM_BRIDGE_CONTRACT_ADDRESS,
  VITE_OPTIMISM_CHAIN_ID,
  VITE_OPTIMISM_EXPLORER_URL,
  VITE_OPTIMISM_NETWORK_ID,
  VITE_OPTIMISM_RPC_URL,
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1,
  VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2,
  VITE_OUTDATED_NETWORK_MODAL_TITLE,
  VITE_OUTDATED_NETWORK_MODAL_URL,
  VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
  VITE_POLYGON_ZK_EVM_CHAIN_ID,
  VITE_POLYGON_ZK_EVM_EXPLORER_URL,
  VITE_POLYGON_ZK_EVM_NETWORK_ID,
  VITE_POLYGON_ZK_EVM_RPC_URL,
  VITE_REPORT_FORM_ERROR_ENTRY,
  VITE_REPORT_FORM_PLATFORM_ENTRY,
  VITE_REPORT_FORM_URL,
  VITE_REPORT_FORM_URL_ENTRY,
  VITE_SCROLL_BRIDGE_CONTRACT_ADDRESS,
  VITE_SCROLL_CHAIN_ID,
  VITE_SCROLL_EXPLORER_URL,
  VITE_SCROLL_NETWORK_ID,
  VITE_SCROLL_RPC_URL,
  VITE_TAIKO_BRIDGE_CONTRACT_ADDRESS,
  VITE_TAIKO_CHAIN_ID,
  VITE_TAIKO_EXPLORER_URL,
  VITE_TAIKO_NETWORK_ID,
  VITE_TAIKO_RPC_URL,
  VITE_VIZING_BRIDGE_CONTRACT_ADDRESS,
  VITE_VIZING_CHAIN_ID,
  VITE_VIZING_EXPLORER_URL,
  VITE_VIZING_NETWORK_ID,
  VITE_VIZING_RPC_URL,
}: Env): Promise<domain.Env> => {
  const polygonZkEVMChainId = z.coerce.number().positive().parse(VITE_POLYGON_ZK_EVM_CHAIN_ID);
  const polygonZkEVMNetworkId = z.coerce.number().positive().parse(VITE_POLYGON_ZK_EVM_NETWORK_ID);
  const vizingChainId = z.coerce.number().positive().parse(VITE_VIZING_CHAIN_ID);
  const vizingNetworkId = z.coerce.number().positive().parse(VITE_VIZING_NETWORK_ID);
  const arbitrumChainId = z.coerce.number().positive().parse(VITE_ARBITRUM_CHAIN_ID);
  const arbitrumNetworkId = z.coerce.number().positive().parse(VITE_ARBITRUM_NETWORK_ID);
  const baseChainId = z.coerce.number().positive().parse(VITE_BASE_CHAIN_ID);
  const baseNetworkId = z.coerce.number().positive().parse(VITE_BASE_NETWORK_ID);
  const optimismChainId = z.coerce.number().positive().parse(VITE_OPTIMISM_CHAIN_ID);
  const optimismNetworkId = z.coerce.number().positive().parse(VITE_OPTIMISM_NETWORK_ID);
  const taikoChainId = z.coerce.number().positive().parse(VITE_TAIKO_CHAIN_ID);
  const taikoNetworkId = z.coerce.number().positive().parse(VITE_TAIKO_NETWORK_ID);
  const lineaChainId = z.coerce.number().positive().parse(VITE_LINEA_CHAIN_ID);
  const lineaNetworkId = z.coerce.number().positive().parse(VITE_LINEA_NETWORK_ID);
  const scrollChainId = z.coerce.number().positive().parse(VITE_SCROLL_CHAIN_ID);
  const scrollNetworkId = z.coerce.number().positive().parse(VITE_SCROLL_NETWORK_ID);
  const blastChainId = z.coerce.number().positive().parse(VITE_BLAST_CHAIN_ID);
  const blastNetworkId = z.coerce.number().positive().parse(VITE_BLAST_NETWORK_ID);
  const bobChainId = z.coerce.number().positive().parse(VITE_BOB_CHAIN_ID);
  const bobNetworkId = z.coerce.number().positive().parse(VITE_BOB_NETWORK_ID);
  const isOutdatedNetworkModalEnabled = stringBooleanParser.parse(
    VITE_ENABLE_OUTDATED_NETWORK_MODAL
  );
  const forceUpdateGlobalExitRootForL1 = stringBooleanParser.parse(
    VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT
  );
  const bridgeApiUrl = VITE_BRIDGE_API_URL;
  const outdatedNetworkModal: domain.Env["outdatedNetworkModal"] = isOutdatedNetworkModalEnabled
    ? {
        isEnabled: true,
        messageParagraph1: VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1,
        messageParagraph2: VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2,
        title: VITE_OUTDATED_NETWORK_MODAL_TITLE,
        url: VITE_OUTDATED_NETWORK_MODAL_URL,
      }
    : {
        isEnabled: false,
      };
  const isDepositWarningEnabled = stringBooleanParser.parse(VITE_ENABLE_DEPOSIT_WARNING);

  return getChains({
    arbitrum: {
      bridgeContractAddress: VITE_ARBITRUM_BRIDGE_CONTRACT_ADDRESS,
      chainId: arbitrumChainId,
      explorerUrl: VITE_ARBITRUM_EXPLORER_URL,
      networkId: arbitrumNetworkId,
      rpcUrl: VITE_ARBITRUM_RPC_URL,
    },
    base: {
      bridgeContractAddress: VITE_BASE_BRIDGE_CONTRACT_ADDRESS,
      chainId: baseChainId,
      explorerUrl: VITE_BASE_EXPLORER_URL,
      networkId: baseNetworkId,
      rpcUrl: VITE_BASE_RPC_URL,
    },
    blast: {
      bridgeContractAddress: VITE_BLAST_BRIDGE_CONTRACT_ADDRESS,
      chainId: blastChainId,
      explorerUrl: VITE_BLAST_EXPLORER_URL,
      networkId: blastNetworkId,
      rpcUrl: VITE_BLAST_RPC_URL,
    },
    bob: {
      bridgeContractAddress: VITE_BOB_BRIDGE_CONTRACT_ADDRESS,
      chainId: bobChainId,
      explorerUrl: VITE_BOB_EXPLORER_URL,
      networkId: bobNetworkId,
      rpcUrl: VITE_BOB_RPC_URL,
    },
    ethereum: {
      bridgeContractAddress: VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS,
      explorerUrl: VITE_ETHEREUM_EXPLORER_URL,
      poeContractAddress: VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS,
      rpcUrl: VITE_ETHEREUM_RPC_URL,
    },
    linea: {
      bridgeContractAddress: VITE_LINEA_BRIDGE_CONTRACT_ADDRESS,
      chainId: lineaChainId,
      explorerUrl: VITE_LINEA_EXPLORER_URL,
      networkId: lineaNetworkId,
      rpcUrl: VITE_LINEA_RPC_URL,
    },
    optimism: {
      bridgeContractAddress: VITE_OPTIMISM_BRIDGE_CONTRACT_ADDRESS,
      chainId: optimismChainId,
      explorerUrl: VITE_OPTIMISM_EXPLORER_URL,
      networkId: optimismNetworkId,
      rpcUrl: VITE_OPTIMISM_RPC_URL,
    },
    polygonZkEVM: {
      bridgeContractAddress: VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS,
      chainId: polygonZkEVMChainId,
      explorerUrl: VITE_POLYGON_ZK_EVM_EXPLORER_URL,
      networkId: polygonZkEVMNetworkId,
      rpcUrl: VITE_POLYGON_ZK_EVM_RPC_URL,
    },
    scroll: {
      bridgeContractAddress: VITE_SCROLL_BRIDGE_CONTRACT_ADDRESS,
      chainId: scrollChainId,
      explorerUrl: VITE_SCROLL_EXPLORER_URL,
      networkId: scrollNetworkId,
      rpcUrl: VITE_SCROLL_RPC_URL,
    },
    taiko: {
      bridgeContractAddress: VITE_TAIKO_BRIDGE_CONTRACT_ADDRESS,
      chainId: taikoChainId,
      explorerUrl: VITE_TAIKO_EXPLORER_URL,
      networkId: taikoNetworkId,
      rpcUrl: VITE_TAIKO_RPC_URL,
    },
    vizing: {
      bridgeContractAddress: VITE_VIZING_BRIDGE_CONTRACT_ADDRESS,
      chainId: vizingChainId,
      explorerUrl: VITE_VIZING_EXPLORER_URL,
      networkId: vizingNetworkId,
      rpcUrl: VITE_VIZING_RPC_URL,
    },
  }).then((chains) => {
    const ethereumChain = chains.find((chain) => chain.key === "ethereum");

    if (!ethereumChain) {
      throw new Error("Ethereum chain not found");
    }

    return {
      bridgeApiUrl,
      chains,
      fiatExchangeRates: getFiatExchangeRatesEnv({
        ethereumChain,
        VITE_ENABLE_FIAT_EXCHANGE_RATES,
        VITE_FIAT_EXCHANGE_RATES_API_KEY,
        VITE_FIAT_EXCHANGE_RATES_API_URL,
        VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS,
      }),
      forceUpdateGlobalExitRootForL1,
      isDepositWarningEnabled,
      outdatedNetworkModal,
      reportForm: getReportFormEnv({
        VITE_ENABLE_REPORT_FORM,
        VITE_REPORT_FORM_ERROR_ENTRY,
        VITE_REPORT_FORM_PLATFORM_ENTRY,
        VITE_REPORT_FORM_URL,
        VITE_REPORT_FORM_URL_ENTRY,
      }),
    };
  });
};

const envParser = StrictSchema<Env, domain.Env>()(
  z
    .object({
      VITE_ARBITRUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ARBITRUM_CHAIN_ID: z.string(),
      VITE_ARBITRUM_EXPLORER_URL: z.string().url(),
      VITE_ARBITRUM_NETWORK_ID: z.string(),
      VITE_ARBITRUM_RPC_URL: z.string().url(),
      VITE_BASE_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_BASE_CHAIN_ID: z.string(),
      VITE_BASE_EXPLORER_URL: z.string().url(),
      VITE_BASE_NETWORK_ID: z.string(),
      VITE_BASE_RPC_URL: z.string().url(),
      VITE_BLAST_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_BLAST_CHAIN_ID: z.string(),
      VITE_BLAST_EXPLORER_URL: z.string().url(),
      VITE_BLAST_NETWORK_ID: z.string(),
      VITE_BLAST_RPC_URL: z.string().url(),
      VITE_BOB_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_BOB_CHAIN_ID: z.string(),
      VITE_BOB_EXPLORER_URL: z.string().url(),
      VITE_BOB_NETWORK_ID: z.string(),
      VITE_BOB_RPC_URL: z.string().url(),
      VITE_BRIDGE_API_URL: z.string().url(),
      VITE_ENABLE_DEPOSIT_WARNING: z.string(),
      VITE_ENABLE_FIAT_EXCHANGE_RATES: z.string(),
      VITE_ENABLE_OUTDATED_NETWORK_MODAL: z.string().optional(),
      VITE_ENABLE_REPORT_FORM: z.string(),
      VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_EXPLORER_URL: z.string().url(),
      VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT: z.string(),
      VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS: z.string().length(42),
      VITE_ETHEREUM_RPC_URL: z.string().url(),
      VITE_FIAT_EXCHANGE_RATES_API_KEY: z.string().optional(),
      VITE_FIAT_EXCHANGE_RATES_API_URL: z.string().url().optional(),
      VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS: z.string().length(42).optional(),
      VITE_LINEA_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_LINEA_CHAIN_ID: z.string(),
      VITE_LINEA_EXPLORER_URL: z.string().url(),
      VITE_LINEA_NETWORK_ID: z.string(),
      VITE_LINEA_RPC_URL: z.string().url(),
      VITE_OPTIMISM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_OPTIMISM_CHAIN_ID: z.string(),
      VITE_OPTIMISM_EXPLORER_URL: z.string().url(),
      VITE_OPTIMISM_NETWORK_ID: z.string(),
      VITE_OPTIMISM_RPC_URL: z.string().url(),
      VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_1: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_MESSAGE_PARAGRAPH_2: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_TITLE: z.string().optional(),
      VITE_OUTDATED_NETWORK_MODAL_URL: z.string().optional(),
      VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_POLYGON_ZK_EVM_CHAIN_ID: z.string(),
      VITE_POLYGON_ZK_EVM_EXPLORER_URL: z.string().url(),
      VITE_POLYGON_ZK_EVM_NETWORK_ID: z.string(),
      VITE_POLYGON_ZK_EVM_RPC_URL: z.string().url(),
      VITE_REPORT_FORM_ERROR_ENTRY: z.string().optional(),
      VITE_REPORT_FORM_PLATFORM_ENTRY: z.string().optional(),
      VITE_REPORT_FORM_URL: z.string().optional(),
      VITE_REPORT_FORM_URL_ENTRY: z.string().optional(),
      VITE_SCROLL_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_SCROLL_CHAIN_ID: z.string(),
      VITE_SCROLL_EXPLORER_URL: z.string().url(),
      VITE_SCROLL_NETWORK_ID: z.string(),
      VITE_SCROLL_RPC_URL: z.string().url(),
      VITE_TAIKO_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_TAIKO_CHAIN_ID: z.string(),
      VITE_TAIKO_EXPLORER_URL: z.string().url(),
      VITE_TAIKO_NETWORK_ID: z.string(),
      VITE_TAIKO_RPC_URL: z.string().url(),
      VITE_VIZING_BRIDGE_CONTRACT_ADDRESS: z.string().length(42),
      VITE_VIZING_CHAIN_ID: z.string(),
      VITE_VIZING_EXPLORER_URL: z.string().url(),
      VITE_VIZING_NETWORK_ID: z.string(),
      VITE_VIZING_RPC_URL: z.string().url(),
    })
    .transform(envToDomain)
);

const loadEnv = (): Promise<domain.Env> => {
  console.log("env", import.meta.env);
  const parsedEnv = envParser.parseAsync(import.meta.env);
  console.log("parsedEnv", parsedEnv);
  return parsedEnv;
};

export { loadEnv };
