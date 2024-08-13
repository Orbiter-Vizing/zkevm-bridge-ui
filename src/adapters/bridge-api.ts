import axios from "axios";
import { BigNumberish } from "ethers";
import { z } from "zod";

import { PAGE_SIZE } from "src/constants";
import * as domain from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

interface DepositInput {
  amount: string;
  block_num: number;
  claim_tx_hash: string;
  deposit_cnt: number;
  dest_addr: string;
  dest_net: number;
  network_id: number;
  orig_addr: string;
  orig_net: number;
  ready_for_claim: boolean;
  time_at: string;
  tx_hash: string;
}

interface DepositOutput {
  amount: string;
  block_num: number;
  claim_tx_hash: string | null;
  deposit_cnt: number;
  dest_addr: string;
  dest_net: number;
  network_id: number;
  orig_addr: string;
  orig_net: number;
  ready_for_claim: boolean;
  time_at: string;
  tx_hash: string;
}

interface MerkleProof {
  main_exit_root: string;
  merkle_proof: string[];
  rollup_exit_root: string;
}

const depositParser = StrictSchema<DepositInput, DepositOutput>()(
  z.object({
    amount: z.string(),
    block_num: z.coerce.number().int().nonnegative(),
    claim_tx_hash: z
      .string()
      .transform((v) => (v.length === 0 ? null : v))
      .refine((val) => val === null || val.length === 66, {
        message: "The length of claim_tx_hash must be 66 characters",
      }),
    deposit_cnt: z.coerce.number().int(),
    dest_addr: z.string(),
    dest_net: z.number(),
    network_id: z.number(),
    orig_addr: z.string(),
    orig_net: z.number(),
    ready_for_claim: z.boolean(),
    time_at: z.string(),
    tx_hash: z.string(),
  })
);

const getDepositResponseParser = StrictSchema<
  {
    deposit: DepositInput;
  },
  {
    deposit: DepositOutput;
  }
>()(
  z.object({
    deposit: depositParser,
  })
);

const getDepositsResponseParser = StrictSchema<
  {
    deposits?: DepositInput[];
    total_cnt?: number;
  },
  {
    deposits?: DepositOutput[];
    total_cnt?: number;
  }
>()(
  z.object({
    deposits: z.array(depositParser).optional(),
    total_cnt: z.coerce.number().int().nonnegative().optional(),
  })
);

const apiMerkleProofToDomain = ({
  main_exit_root,
  merkle_proof,
  rollup_exit_root,
}: MerkleProof): domain.MerkleProof => ({
  mainExitRoot: main_exit_root,
  merkleProof: merkle_proof,
  rollupExitRoot: rollup_exit_root,
});

const merkleProofParser = StrictSchema<MerkleProof, domain.MerkleProof>()(
  z
    .object({
      main_exit_root: z.string().length(66),
      merkle_proof: z.array(z.string().length(66)),
      rollup_exit_root: z.string().length(66),
    })
    .transform(apiMerkleProofToDomain)
);

const getMerkleProofResponseParser = StrictSchema<
  {
    proof: MerkleProof;
  },
  {
    proof: domain.MerkleProof;
  }
>()(
  z.object({
    proof: merkleProofParser,
  })
);

interface GetDepositsParams {
  abortSignal?: AbortSignal;
  apiUrl: string;
  ethereumAddress: string;
  limit?: number;
  offset?: number;
}

// get user all tx data, no matter with deposit or withdraw
// ethereumAddress is the public key of user wallet
export const getDeposits = ({
  apiUrl,
  ethereumAddress,
  limit = PAGE_SIZE,
  offset = 0,
  abortSignal,
}: GetDepositsParams): Promise<{
  deposits: DepositOutput[];
  total: number;
}> => {
  console.log("getDeposits params:");
  console.log("apiUrl", apiUrl);
  console.log("ethereumAddress", ethereumAddress);
  console.log("limit", limit);
  console.log("abortSignal", abortSignal);
  return axios
    .request({
      baseURL: apiUrl,
      method: "GET",
      params: {
        limit,
        offset,
      },
      signal: abortSignal,
      url: `/bridges/${ethereumAddress}`,
    })
    .then((res) => {
      // console.log("getDeposits res", res);
      // validate res.data through the rules provided by getDepositsResponseParser
      const parsedData = getDepositsResponseParser.safeParse(res.data);

      // after the validation, parsedData will have the following result
      // success: is validation successed
      // data(validation success data) or error(validation failed reason)
      if (parsedData.success) {
        // data.deposit
        // data: {
        //   deposits: [
        //     {
        //       amount: "1000000000000000",
        //       block_num: "7393",
        //       claim_tx_hash: "",
        //       deposit_cnt: "7",
        //       dest_addr: "0x24F4F8e83eA08b7DCb7A579B1236fc3155300854",
        //       dest_net: 0,
        //       leaf_type: 0,
        //       metadata: "0x",
        //       network_id: 1,
        //       orig_addr: "0x0000000000000000000000000000000000000000",
        //       orig_net: 0,
        //       ready_for_claim: false,
        //       time_at: "1722826989",
        //       tx_hash: "0x0656e17b3ca9b21dead145c923a307ad62f9abd52f54fc059bb1a73a0ad55fb7"
        //     },
        //     // ...
        //   ],
        //   total_cnt: "26"
        // }
        return {
          deposits: parsedData.data.deposits !== undefined ? parsedData.data.deposits : [],
          total: parsedData.data.total_cnt !== undefined ? parsedData.data.total_cnt : 0,
        };
      } else {
        throw parsedData.error;
      }
    });
};

interface PushBridgeInfoParams {
  abortSignal?: AbortSignal;
  amount: string;
  apiUrl: string;
  destinationAddress: string;
  detinationNetwork: number;
  originAddress: string;
  originNetwork: number;
  txHash: string;
}

export const pushBridgeInfo = ({
  abortSignal,
  amount,
  apiUrl,
  destinationAddress,
  detinationNetwork,
  originAddress,
  originNetwork,
  txHash,
}: PushBridgeInfoParams): Promise<number> => {
  return axios.request({
    baseURL: apiUrl,
    data: {
      amount: amount,
      dest_addr: destinationAddress,
      dest_net: detinationNetwork,
      orig_addr: originAddress,
      orig_net: originNetwork,
      tx_hash: txHash,
    },
    method: "POST",
    signal: abortSignal,
    url: "/push-bridge",
  });
};

interface GetDepositParams {
  abortSignal?: AbortSignal;
  apiUrl: string;
  depositCount: number;
  networkId: number;
}

export const getDeposit = ({
  abortSignal,
  apiUrl,
  depositCount,
  networkId,
}: GetDepositParams): Promise<DepositOutput> => {
  return axios
    .request({
      baseURL: apiUrl,
      method: "GET",
      params: {
        deposit_cnt: depositCount,
        net_id: networkId,
      },
      signal: abortSignal,
      url: "/bridge",
    })
    .then((res) => {
      const parsedData = getDepositResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.deposit;
      } else {
        throw parsedData.error;
      }
    });
};

interface GetMerkleProofParams {
  apiUrl: string;
  depositCount: number;
  networkId: number;
}

export const getMerkleProof = ({
  apiUrl,
  depositCount,
  networkId,
}: GetMerkleProofParams): Promise<domain.MerkleProof> => {
  return axios
    .request({
      baseURL: apiUrl,
      method: "GET",
      params: {
        deposit_cnt: depositCount,
        net_id: networkId,
      },
      url: "/merkle-proof",
    })
    .then((res) => {
      const parsedData = getMerkleProofResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.proof;
      } else {
        throw parsedData.error;
      }
    });
};

export function isCancelRequestError(error: unknown): boolean {
  return axios.isCancel(error);
}
