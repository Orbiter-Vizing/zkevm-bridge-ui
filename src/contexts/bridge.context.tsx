import {
  BigNumber,
  BigNumberish,
  CallOverrides,
  ContractTransaction,
  ethers,
  utils as ethersUtils,
} from "ethers";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useMemo } from "react";
import { toast } from "react-toastify";

import { getDeposit, getDeposits, getMerkleProof, pushBridgeInfo } from "src/adapters/bridge-api";
import {
  getErc20TokenEncodedMetadata,
  hasTxBeenReverted,
  isTxCanceled,
  isTxMined,
  permit,
} from "src/adapters/ethereum";
import * as storage from "src/adapters/storage";
import {
  BRIDGE_CALL_GAS_LIMIT_INCREASE_PERCENTAGE,
  BRIDGE_CALL_PERMIT_GAS_LIMIT_INCREASE,
  ETH_TOKEN_LOGO_URI,
  FIAT_DISPLAY_PRECISION,
  GAS_PRICE_INCREASE_PERCENTAGE,
  PENDING_TX_TIMEOUT,
  getEtherToken,
} from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { useTxStatusContext } from "src/contexts/tx-status.context";
import {
  Bridge,
  Chain,
  Deposit,
  Env,
  Gas,
  OnHoldBridge,
  PendingBridge,
  Token,
  TokenSpendPermission,
  VizingChain,
} from "src/domain";
import { Bridge__factory } from "src/types/contracts/bridge";
import { formatTokenAmount, multiplyAmounts } from "src/utils/amounts";
import { serializeBridgeId } from "src/utils/serializers";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import { TxToastContent } from "src/views/shared/tx-toast-content/tx-toast-content.view";
// import { formatTokenAmount } from "src/utils/amounts";

interface EstimateBridgeGasParams {
  destinationAddress: string;
  from: Chain;
  to: Chain;
  token: Token;
  tokenSpendPermission: TokenSpendPermission;
}

interface EstimateVizingBridgeGasParams {
  // tokenSpendPermission: TokenSpendPermission;
  account: string;
  destinationAddress: string;
  from: Chain;
  to: Chain;
  token: Token;
  totalValue: BigNumber;
  // value: BigNumber;
  userInputValue: BigNumber;
}

type FetchBridgeParams = {
  abortSignal?: AbortSignal;
  depositCount: number;
  env: Env;
  networkId: number;
};

interface PushBridgeParams {
  abortSignal?: AbortSignal;
  amount: string;
  destinationAddress: string;
  detinationNetwork: number;
  env: Env;
  originAddress: string;
  originNetwork: number;
  txHash: string;
  // uint32 orig_net = 1;
  // string orig_addr = 2;
  // uint32 dest_net = 3;
  // string dest_addr = 4;
  // string tx_hash = 5;
  // string amount = 6;
}

interface GetBridgesParams {
  abortSignal?: AbortSignal;
  env: Env;
  ethereumAddress: string;
  limit: number;
  offset: number;
}

interface RefreshBridgesParams {
  abortSignal?: AbortSignal;
  env: Env;
  ethereumAddress: string;
  quantity: number;
}

type FetchBridgesParams = {
  abortSignal?: AbortSignal;
  env: Env;
  ethereumAddress: string;
} & (
  | {
      limit: number;
      offset: number;
      type: "load";
    }
  | {
      quantity: number;
      type: "reload";
    }
);

interface BridgeParams {
  amount: BigNumber;
  destinationAddress: string;
  from: Chain;
  gas?: Gas;
  to: Chain;
  token: Token;
  tokenSpendPermission: TokenSpendPermission;
}

interface ClaimParams {
  bridge: OnHoldBridge;
}

interface BridgeContext {
  bridge: (params: BridgeParams) => Promise<ContractTransaction>;
  claim: (params: ClaimParams) => Promise<ContractTransaction>;
  estimateBridgeGas: (params: EstimateBridgeGasParams) => Promise<Gas>;
  estimateVizingBridgeGas: (params: EstimateVizingBridgeGasParams) => Promise<Gas>;
  fetchBridge: (params: FetchBridgeParams) => Promise<Bridge>;
  fetchBridges: (params: FetchBridgesParams) => Promise<{
    bridges: Bridge[];
    total: number;
  }>;
  getPendingBridges: (bridges?: Bridge[]) => Promise<PendingBridge[]>;
  pushBridge: (params: PushBridgeParams) => Promise<void>;
}

enum TransactionType {
  L1 = "l1",
  L2 = "l2",
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  estimateBridgeGas: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  estimateVizingBridgeGas: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  fetchBridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  fetchBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getPendingBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  pushBridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { setTxQueue, txQueue } = useTxStatusContext();
  const { changeNetwork, connectedProvider } = useProvidersContext();
  const { addWrappedToken, getToken } = useTokensContext();
  const { getTokenPrice } = usePriceOracleContext();

  type Price = BigNumber | null;
  type TokenPrices = Partial<Record<string, Price>>;

  const fetchBridge = useCallback(
    async ({ abortSignal, depositCount, env, networkId }: FetchBridgeParams): Promise<Bridge> => {
      const apiUrl = env.bridgeApiUrl;
      const apiDeposit = await getDeposit({
        abortSignal,
        apiUrl,
        depositCount,
        networkId,
      });

      const {
        amount,
        block_num,
        claim_tx_hash,
        deposit_cnt,
        dest_addr,
        dest_net,
        network_id,
        orig_addr,
        orig_net,
        ready_for_claim,
        time_at,
        tx_hash,
      } = apiDeposit;

      const from = env.chains.find((chain) => chain.networkId === network_id);
      if (from === undefined) {
        throw new Error(
          `The specified network_id "${network_id}" can not be found in the list of supported Chains`
        );
      }

      const to = env.chains.find((chain) => chain.networkId === dest_net);
      if (to === undefined) {
        throw new Error(
          `The specified dest_net "${dest_net}" can not be found in the list of supported Chains`
        );
      }

      const token = await getToken({
        env,
        originNetwork: orig_net,
        tokenOriginAddress: orig_addr,
      });

      const claim: Deposit["claim"] =
        claim_tx_hash !== null
          ? { status: "claimed", txHash: claim_tx_hash }
          : ready_for_claim
          ? { status: "ready" }
          : { status: "pending" };

      const tokenPrice: BigNumber | undefined = env.fiatExchangeRates.areEnabled
        ? await getTokenPrice({
            chain: from,
            token,
          }).catch(() => undefined)
        : undefined;

      const fiatAmount =
        tokenPrice &&
        multiplyAmounts(
          {
            precision: FIAT_DISPLAY_PRECISION,
            value: tokenPrice,
          },
          {
            precision: token.decimals,
            value: BigNumber.from(amount),
          },
          FIAT_DISPLAY_PRECISION
        );

      const id = serializeBridgeId({
        depositCount,
        networkId,
      });

      switch (claim.status) {
        case "pending": {
          return {
            amount: BigNumber.from(amount),
            blockNumber: block_num,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            destinationAddress: dest_addr,
            fiatAmount,
            from,
            id,
            status: "initiated",
            timeAt: time_at,
            to,
            token,
            tokenOriginNetwork: orig_net,
          };
        }
        case "ready": {
          return {
            amount: BigNumber.from(amount),
            blockNumber: block_num,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            destinationAddress: dest_addr,
            fiatAmount,
            from,
            id,
            status: "on-hold",
            timeAt: time_at,
            to,
            token,
            tokenOriginNetwork: orig_net,
          };
        }
        case "claimed": {
          return {
            amount: BigNumber.from(amount),
            blockNumber: block_num,
            claimTxHash: claim.txHash,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            destinationAddress: dest_addr,
            fiatAmount,
            from,
            id,
            status: "completed",
            timeAt: time_at,
            to,
            token,
            tokenOriginNetwork: orig_net,
          };
        }
      }
    },
    [getTokenPrice, getToken]
  );

  const pushBridge = useCallback(
    async ({
      abortSignal,
      amount,
      destinationAddress,
      detinationNetwork,
      env,
      originAddress,
      originNetwork,
      txHash,
    }: PushBridgeParams) => {
      const apiUrl = env.bridgeApiUrl;
      const res = await pushBridgeInfo({
        abortSignal,
        amount,
        apiUrl,
        destinationAddress,
        detinationNetwork,
        originAddress,
        originNetwork,
        txHash,
      });
      console.log("push bridge res", res);
      // return 123;
    },
    []
  );

  // initial fetch params
  // {
  //   abortSignal: fetchBridgesAbortController.current.signal,
  //   env,
  //   ethereumAddress: connectedProvider.data.account,
  //   limit: PAGE_SIZE,
  //   offset: 0,
  //   type: "load",
  // }
  const getBridges = useCallback(
    async ({
      abortSignal,
      env,
      ethereumAddress,
      limit,
      offset,
    }: GetBridgesParams): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      const apiUrl = env.bridgeApiUrl;
      // get original deposits list: apiDeposits
      const { deposits: apiDeposits, total } = await getDeposits({
        abortSignal,
        apiUrl,
        ethereumAddress,
        limit,
        offset,
      });
      // recreate original deposits list to deposits(add some attributes)
      // especially, claim from deposit claim status
      const deposits = await apiDeposits.reduce(
        async (acc: Promise<Deposit[]>, apiDeposit): Promise<Deposit[]> => {
          console.log("apiDeposits.reduce acc", acc);
          console.log("apiDeposits.reduce apiDeposit", apiDeposit);
          const {
            amount,
            block_num,
            claim_tx_hash,
            deposit_cnt,
            dest_addr,
            dest_net,
            network_id,
            orig_addr,
            orig_net,
            ready_for_claim,
            time_at,
            tx_hash,
          } = apiDeposit;

          // get the from chain of tx
          const from = env.chains.find((chain) => chain.networkId === network_id);
          if (from === undefined) {
            throw new Error(
              `The specified network_id "${network_id}" can not be found in the list of supported Chains`
            );
          }
          // get the to chain of tx
          const to = env.chains.find((chain) => chain.networkId === dest_net);
          if (to === undefined) {
            throw new Error(
              `The specified dest_net "${dest_net}" can not be found in the list of supported Chains`
            );
          }

          return acc.then((accDeposits) => {
            const zeroAddress = ethers.constants.AddressZero;
            if (orig_net === 0 || dest_net === 0) {
              return getToken({
                env,
                originNetwork: orig_net,
                // type
                tokenOriginAddress: orig_addr,
                // tokenOriginAddress: "0x0000000000000000000000000000000000000000",
                // dest_addr === "0x0000000000000000000000000000000000000000" ||
                // orig_addr === "0x0000000000000000000000000000000000000000"
                //   ? "0x0000000000000000000000000000000000000000"
                //   : orig_addr,
              }).then((token) => [
                // after get the token info
                // recreate every deposit
                // especially focus on claim, token
                ...accDeposits,
                {
                  amount: BigNumber.from(amount),
                  blockNumber: block_num,
                  claim:
                    claim_tx_hash !== null
                      ? { status: "claimed", txHash: claim_tx_hash }
                      : ready_for_claim
                      ? { status: "ready" }
                      : { status: "pending" },
                  depositCount: deposit_cnt,
                  depositTxHash: tx_hash,
                  destinationAddress: dest_addr,
                  fiatAmount: undefined,
                  from,
                  timeAt: time_at,
                  to,
                  token,
                  tokenOriginNetwork: orig_net,
                },
              ]);
            } else {
              // const chain = env.chains.find((chain) => chain.networkId === orig_net);
              // const token = getEtherToken(chain);
              const token = {
                address: ethers.constants.AddressZero,
                chainId: orig_net,
                decimals: 18,
                logoURI: ETH_TOKEN_LOGO_URI,
                name: "Ether",
                symbol: "ETH",
              };
              return [
                // after get the token info
                // recreate every deposit
                // especially focus on claim, token
                ...accDeposits,
                {
                  amount: BigNumber.from(amount),
                  blockNumber: block_num,
                  claim:
                    claim_tx_hash !== null
                      ? { status: "claimed", txHash: claim_tx_hash }
                      : ready_for_claim
                      ? { status: "ready" }
                      : { status: "pending" },
                  depositCount: deposit_cnt,
                  depositTxHash: tx_hash,
                  destinationAddress: dest_addr,
                  fiatAmount: undefined,
                  from,
                  timeAt: time_at,
                  to,
                  token,
                  tokenOriginNetwork: orig_net,
                },
              ];
            }
          });
        },
        Promise.resolve([])
      );

      // price temp ignore
      const tokenPrices: TokenPrices = env.fiatExchangeRates.areEnabled
        ? await deposits.reduce(
            async (
              accTokenPrices: Promise<TokenPrices>,
              deposit: Deposit
            ): Promise<TokenPrices> => {
              const tokenPrices = await accTokenPrices;
              const tokenCachedPrice = tokenPrices[deposit.token.address];
              const tokenPrice =
                tokenCachedPrice !== undefined
                  ? tokenCachedPrice
                  : await getTokenPrice({ chain: deposit.from, token: deposit.token }).catch(
                      () => null
                    );

              return {
                ...tokenPrices,
                [deposit.token.address]: tokenPrice,
              };
            },
            Promise.resolve({})
          )
        : {};

      const bridges = deposits.map((partialDeposit): Bridge => {
        const {
          amount,
          blockNumber,
          claim,
          depositCount,
          depositTxHash,
          destinationAddress,
          from,
          timeAt,
          to,
          token,
          tokenOriginNetwork,
        } = partialDeposit;

        const tokenPrice = tokenPrices[token.address];

        const fiatAmount =
          tokenPrice !== undefined && tokenPrice !== null
            ? multiplyAmounts(
                {
                  precision: FIAT_DISPLAY_PRECISION,
                  value: tokenPrice,
                },
                {
                  precision: token.decimals,
                  value: amount,
                },
                FIAT_DISPLAY_PRECISION
              )
            : undefined;

        const id = depositTxHash;
        // const id = serializeBridgeId({
        //   depositCount,
        //   networkId: to.chainId,
        //   // networkId: from.networkId,
        // });

        switch (claim.status) {
          case "pending": {
            return {
              amount,
              blockNumber,
              depositCount,
              depositTxHash,
              destinationAddress,
              fiatAmount,
              from,
              id,
              status: "initiated",
              timeAt,
              to,
              token,
              tokenOriginNetwork,
            };
          }
          case "ready": {
            return {
              amount,
              blockNumber,
              depositCount,
              depositTxHash,
              destinationAddress,
              fiatAmount,
              from,
              id,
              status: "on-hold",
              timeAt,
              to,
              token,
              tokenOriginNetwork,
            };
          }
          case "claimed": {
            return {
              amount,
              blockNumber,
              claimTxHash: claim.txHash,
              depositCount,
              depositTxHash,
              destinationAddress,
              fiatAmount,
              from,
              id,
              status: "completed",
              timeAt,
              to,
              token,
              tokenOriginNetwork,
            };
          }
        }
      });

      return {
        bridges,
        total,
      };
    },
    [getTokenPrice, getToken]
  );

  const REFRESH_PAGE_SIZE = 100;

  // poll-reloading params
  // {
  //   abortSignal: fetchBridgesAbortController.current.signal,
  //   env,
  //   ethereumAddress: connectedProvider.data.account,
  //   quantity: lastLoadedItem,
  //   type: "reload",
  // }
  const refreshBridges = useCallback(
    async ({
      abortSignal,
      env,
      ethereumAddress,
      quantity,
    }: RefreshBridgesParams): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      const completePages = Math.floor(quantity / REFRESH_PAGE_SIZE);
      const remainderBridges = quantity % REFRESH_PAGE_SIZE;
      const requiredRequests = Math.max(
        remainderBridges === 0 ? completePages : completePages + 1,
        1
      );
      return (
        await Promise.all(
          Array(requiredRequests)
            .fill(null)
            .map((_, index) => {
              const offset = index * REFRESH_PAGE_SIZE;
              const isLast = index + 1 === requiredRequests;
              const isRemainderRequestRequired = isLast && remainderBridges !== 0;
              const limit = isRemainderRequestRequired ? remainderBridges : REFRESH_PAGE_SIZE;
              return getBridges({
                abortSignal,
                env,
                ethereumAddress,
                limit,
                offset,
              });
            })
        )
      ).reduce((acc, curr) => ({ bridges: [...acc.bridges, ...curr.bridges], total: curr.total }), {
        bridges: [],
        total: 0,
      });
    },
    [getBridges]
  );

  // initial fetch params
  // {
  //   abortSignal: fetchBridgesAbortController.current.signal,
  //   env,
  //   ethereumAddress: connectedProvider.data.account,
  //   limit: PAGE_SIZE,
  //   offset: 0,
  //   type: "load",
  // }
  // poll-reloading params
  // {
  //   abortSignal: fetchBridgesAbortController.current.signal,
  //   env,
  //   ethereumAddress: connectedProvider.data.account,
  //   quantity: lastLoadedItem,
  //   type: "reload",
  // }
  const fetchBridges = useCallback(
    async (
      params: FetchBridgesParams
    ): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      // for initial case, type params is the following
      // type: "load",
      if (params.type === "load") {
        return getBridges({
          abortSignal: params.abortSignal,
          env: params.env,
          ethereumAddress: params.ethereumAddress,
          limit: params.limit,
          offset: params.offset,
        });
      } else {
        return refreshBridges({
          abortSignal: params.abortSignal,
          env: params.env,
          ethereumAddress: params.ethereumAddress,
          quantity: params.quantity,
        });
      }
    },
    [getBridges, refreshBridges]
  );

  const cleanPendingTxs = useCallback(
    async (bridges: Bridge[]): Promise<void> => {
      if (!env) {
        return Promise.reject("Env is not defined");
      }
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        return Promise.reject("connectedProvider data is not available");
      }

      const account = connectedProvider.data.account;
      const pendingTxs = storage.getAccountPendingTxs(account, env);
      const isPendingDepositInApiBridges = (depositTxHash: string) => {
        return bridges.find((bridge) => {
          return (
            (bridge.status === "initiated" || bridge.status === "on-hold") &&
            bridge.depositTxHash === depositTxHash
          );
        });
      };
      const isPendingClaimInApiBridges = (claimTxHash: string) => {
        return bridges.find((bridge) => {
          return bridge.status === "completed" && bridge.claimTxHash === claimTxHash;
        });
      };

      await Promise.all(
        pendingTxs.map(async (pendingTx) => {
          if (
            pendingTx.type === "deposit" &&
            isPendingDepositInApiBridges(pendingTx.depositTxHash)
          ) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }

          if (pendingTx.type === "claim" && isPendingClaimInApiBridges(pendingTx.claimTxHash)) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }

          const txHash =
            pendingTx.type === "deposit" ? pendingTx.depositTxHash : pendingTx.claimTxHash;
          const provider =
            pendingTx.type === "deposit" ? pendingTx.from.provider : pendingTx.to.provider;
          const tx = await provider.getTransaction(txHash);

          if (isTxCanceled(tx)) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }

          if (isTxMined(tx)) {
            const txReceipt = await provider.getTransactionReceipt(txHash);

            if (txReceipt && hasTxBeenReverted(txReceipt)) {
              return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
            }
          }

          if (Date.now() > pendingTx.timestamp + PENDING_TX_TIMEOUT) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }
        })
      );
    },
    [connectedProvider, env]
  );

  const getPendingBridges = useCallback(
    async (bridges?: Bridge[]): Promise<PendingBridge[]> => {
      if (bridges) {
        await cleanPendingTxs(bridges);
      }

      if (!env) {
        throw new Error("Env is not available");
      }

      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        return Promise.reject("connectedProvider data is not available");
      }

      return Promise.all(
        storage.getAccountPendingTxs(connectedProvider.data.account, env).map(async (tx) => {
          const chain = env.chains.find((chain) => chain.key === tx.from.key);
          const token = await addWrappedToken({ token: tx.token });
          const tokenPrice =
            chain && env.fiatExchangeRates.areEnabled
              ? await getTokenPrice({ chain, token: tx.token })
              : undefined;
          const fiatAmount =
            tokenPrice &&
            multiplyAmounts(
              {
                precision: FIAT_DISPLAY_PRECISION,
                value: tokenPrice,
              },
              {
                precision: token.decimals,
                value: tx.amount,
              },
              FIAT_DISPLAY_PRECISION
            );

          return {
            amount: tx.amount,
            claimTxHash: tx.type === "claim" ? tx.claimTxHash : undefined,
            depositTxHash: tx.depositTxHash,
            destinationAddress: tx.destinationAddress,
            fiatAmount,
            from: tx.from,
            status: "pending",
            timeAt: "",
            to: tx.to,
            token,
          };
        })
      );
    },
    [env, connectedProvider, cleanPendingTxs, addWrappedToken, getTokenPrice]
  );

  const estimateBridgeGas = useCallback(
    async ({
      destinationAddress,
      from,
      to,
      token,
      tokenSpendPermission,
    }: EstimateBridgeGasParams): Promise<Gas> => {
      if (!env) {
        throw new Error("Env is not available");
      }

      const contract = Bridge__factory.connect(from.bridgeContractAddress, from.provider);
      const amount = BigNumber.from(0);
      const overrides: CallOverrides = isTokenEther(token)
        ? { from: destinationAddress, value: amount }
        : { from: destinationAddress };

      const tokenAddress = selectTokenAddress(token, from);
      const forceUpdateGlobalExitRoot = true;
      // from.key === "polygon-zkevm" ? true : env.forceUpdateGlobalExitRootForL1;

      const gasLimit =
        from.key === "ethereum"
          ? await contract.estimateGas // contract is bridge contract
              .bridgeAsset(
                to.networkId,
                destinationAddress,
                amount,
                tokenAddress,
                forceUpdateGlobalExitRoot,
                "0x",
                overrides
              )
              .then((gasLimit) => {
                const gasLimitIncrease = gasLimit
                  .div(BigNumber.from(100))
                  .mul(BRIDGE_CALL_GAS_LIMIT_INCREASE_PERCENTAGE);

                const increasedGasLimit = gasLimit.add(gasLimitIncrease);

                return tokenSpendPermission.type === "permit"
                  ? increasedGasLimit.add(BRIDGE_CALL_PERMIT_GAS_LIMIT_INCREASE)
                  : increasedGasLimit;
              })
          : BigNumber.from(300000);

      const { gasPrice, maxFeePerGas } = await from.provider.getFeeData();

      if (maxFeePerGas) {
        return { data: { gasLimit, maxFeePerGas }, type: "eip-1559" };
      } else {
        const legacyGasPrice = gasPrice || (await from.provider.getGasPrice());
        const gasPriceIncrease = legacyGasPrice
          .div(BigNumber.from(100))
          .mul(GAS_PRICE_INCREASE_PERCENTAGE);

        return {
          data: {
            gasLimit,
            gasPrice: legacyGasPrice.add(gasPriceIncrease),
          },
          type: "legacy",
        };
      }
    },
    [env]
  );

  const estimateVizingBridgeGas = useCallback(
    async ({
      account,
      destinationAddress,
      from,
      to,
      token,
      totalValue,
      userInputValue,
    }: // tokenSpendPermission,
    EstimateVizingBridgeGasParams): Promise<Gas> => {
      if (!env) {
        throw new Error("Env is not available");
      }
      console.log("estimateVizingBridgeGas 111");
      let contractAddress = from.bridgeContractAddress;
      console.log("estimateVizingBridgeGas from contractAddress", contractAddress);
      if (from.key === "vizing") {
        contractAddress = from.omniContractAddress;
      }
      const contract = Bridge__factory.connect(contractAddress, from.provider);
      // const amount = BigNumber.from(0);
      // console.log("amount xxx", amount);
      const overrides: CallOverrides = isTokenEther(token)
        ? { from: destinationAddress, value: totalValue }
        : { from: destinationAddress };
      console.log("estimateVizingBridgeGas 222");
      const tokenAddress = selectTokenAddress(token, from);
      const forceUpdateGlobalExitRoot =
        from.key === "vizing" ? true : env.forceUpdateGlobalExitRootForL1;

      // if (!isAsyncTaskDataAvailable(connectedProvider)) {
      //   throw new Error("Connected provider is not available");
      // }
      console.log("estimateVizingBridgeGas 333");
      // const { account, chainId, provider } = connectedProvider.data;

      const fakePostMessage = ethersUtils.solidityPack(
        ["uint8", "uint256", "uint24"],
        [4, account, 50000]
      );

      console.log("before Launch gasLimit");
      let gasLimit;
      try {
        gasLimit = await contract.estimateGas // contract is bridge contract
          .Launch(
            0, // earliestArrivalTimestamp
            0, // latestArrivalTimestamp
            ethers.constants.AddressZero, // relayer
            account, // sender
            userInputValue, // value that user input
            to.chainId, // destChainid
            "0x", // additionalParams
            fakePostMessage, // usrMessage
            overrides
          );
      } catch (error) {
        console.error("estimateGas.Launch error", error);
      }
      console.log("Launch gasLimit", gasLimit);
      console.log("Launch gasLimit format", ethers.utils.formatUnits(gasLimit, "gwei"));
      // from.key === "ethereum"
      //   ? await contract.estimateGas // contract is bridge contract
      //       .bridgeAsset(
      //         to.networkId,
      //         destinationAddress,
      //         amount,
      //         tokenAddress,
      //         forceUpdateGlobalExitRoot,
      //         "0x",
      //         overrides
      //       )
      //       .then((gasLimit) => {
      //         const gasLimitIncrease = gasLimit
      //           .div(BigNumber.from(100))
      //           .mul(BRIDGE_CALL_GAS_LIMIT_INCREASE_PERCENTAGE);

      //         const increasedGasLimit = gasLimit.add(gasLimitIncrease);

      //         return tokenSpendPermission.type === "permit"
      //           ? increasedGasLimit.add(BRIDGE_CALL_PERMIT_GAS_LIMIT_INCREASE)
      //           : increasedGasLimit;
      //       })
      //   : BigNumber.from(300000);

      console.log("estimatedVizingGas from chain", from);
      const { gasPrice, maxFeePerGas } = await from.provider.getFeeData();
      // ethers.utils.formatUnits(gasPrice, 'gwei');
      // console.log("estimatedVizingGas gasPrice", ethers.utils.formatUnits(gasPrice, "gwei"));
      // console.log(
      //   "estimatedVizingGas maxFeePerGas",
      //   ethers.utils.formatUnits(maxFeePerGas, "gwei")
      // );

      if (maxFeePerGas) {
        return { data: { gasLimit, maxFeePerGas }, type: "eip-1559" };
      } else {
        const legacyGasPrice = gasPrice || (await from.provider.getGasPrice());
        const gasPriceIncrease = legacyGasPrice
          .div(BigNumber.from(100))
          .mul(GAS_PRICE_INCREASE_PERCENTAGE);

        return {
          data: {
            gasLimit,
            gasPrice: legacyGasPrice.add(gasPriceIncrease),
          },
          type: "legacy",
        };
      }
    },
    [env]
  );

  const bridge = useCallback(
    async ({
      amount,
      destinationAddress,
      from,
      gas,
      to,
      token,
      tokenSpendPermission,
    }: BridgeParams): Promise<ContractTransaction> => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        throw new Error("Connected provider is not available");
      }

      const { account, chainId, provider } = connectedProvider.data;

      if (from.key === "ethereum" || to.key === "ethereum") {
        const contract = Bridge__factory.connect(from.bridgeContractAddress, provider.getSigner());
        console.log("L1 trans contract", contract);
        console.log("L1 from,to chain in on bridge", from, to);
        const overrides: CallOverrides = {
          value: isTokenEther(token) ? amount : undefined,
          ...(gas
            ? gas.data
            : (
                await estimateBridgeGas({
                  destinationAddress,
                  from,
                  to,
                  token,
                  tokenSpendPermission,
                })
              ).data),
        };

        const executeBridge = async () => {
          const permitData =
            tokenSpendPermission.type === "permit"
              ? await permit({
                  account: account,
                  from: from,
                  permit: tokenSpendPermission.permit,
                  provider: provider,
                  spender: from.bridgeContractAddress,
                  token,
                  value: amount,
                })
              : "0x";

          const forceUpdateGlobalExitRoot =
            from.key === "vizing" ? true : env.forceUpdateGlobalExitRootForL1;

          return contract
            .bridgeAsset(
              to.networkId,
              destinationAddress,
              amount,
              selectTokenAddress(token, from),
              forceUpdateGlobalExitRoot,
              permitData,
              overrides
            )
            .then((txData) => {
              console.log("txData", txData);
              storage.addAccountPendingTx(account, env, {
                amount,
                depositTxHash: txData.hash,
                destinationAddress,
                from,
                timestamp: Date.now(),
                to,
                token,
                type: "deposit",
              });

              // store tx hash and toast id
              console.log("old txQueue l1", txQueue);
              const id = toast.loading(
                <TxToastContent
                  text="The transaction has been submitted for processing."
                  title="Transaction Submitted"
                  type="pending"
                />,
                {
                  isLoading: false,
                }
              );
              const newTxHashQueue = [
                ...txQueue,
                {
                  hash: txData.hash,
                  toastId: id,
                },
              ];
              console.log("newTxHashQueue l1", newTxHashQueue);
              setTxQueue(newTxHashQueue);

              return txData;
            });
        };
        if (from.chainId === chainId) {
          return executeBridge();
        } else {
          return changeNetwork(from)
            .catch(() => {
              throw "wrong-network";
            })
            .then(executeBridge);
        }
      } else {
        const executeBridge = async () => {
          console.log("excute launch");
          console.log("from chain info");
          console.dir(from);
          console.log("L2 bridge contract address", from.bridgeContractAddress);
          console.log("my account address", account);
          let contractAddress = from.bridgeContractAddress;
          console.log("let contractAddress", contractAddress);
          if (from.key === "vizing") {
            contractAddress = from.omniContractAddress;
          }
          console.log("L2 Bridge__factory contractAddress", contractAddress);
          const contract = Bridge__factory.connect(contractAddress, provider.getSigner());
          console.log("L2 contract", contract);
          const fakePostMessage = ethersUtils.solidityPack(
            ["uint8", "uint256", "uint24"],
            [4, account, 50000]
          );
          console.log("before contract.functions.estimateGas amount", amount);
          console.log("before contract.functions.estimateGas toChain", to);
          console.log("before contract.functions.estimateGas fakePostMessage", fakePostMessage);
          try {
            const vizingValue = await contract.functions.estimateGas(
              amount,
              to.chainId,
              ethers.constants.AddressZero,
              fakePostMessage
            );
          } catch (error) {
            console.error("try estimate error", error);
          }
          const vizingValue = await contract.functions.estimateGas(
            amount,
            to.chainId,
            ethers.constants.AddressZero,
            fakePostMessage
          );
          console.log("vizingValue", vizingValue[0]);
          console.log("user amount", amount);
          // const vizingFeeBigNumber = ethers.BigNumber.from(vizingValue);
          const totalValue = vizingValue[0].add(amount);
          console.log("totalValue", totalValue);
          const overrides: CallOverrides = {
            // value: isTokenEther(token) ? vizingValue[0]._hex + userinput : undefined,
            value: isTokenEther(token) ? totalValue : undefined,
            ...(
              await estimateVizingBridgeGas({
                account,
                destinationAddress,
                from,
                to,
                token,
                totalValue,
                userInputValue: amount,
              })
            ).data,
          };
          console.log("overrides", overrides);
          // const
          return contract
            .Launch(
              0, // earliestArrivalTimestamp
              0, // latestArrivalTimestamp
              ethers.constants.AddressZero, // relayer
              account, // sender
              amount, // value
              to.chainId, // destChainid
              "0x", // additionalParams
              fakePostMessage, // usrMessage
              overrides
            )
            .then((txData) => {
              console.log("Launch txData", txData);
              storage.addAccountPendingTx(account, env, {
                amount,
                depositTxHash: txData.hash,
                destinationAddress,
                from,
                timestamp: Date.now(),
                to,
                token,
                type: "deposit",
              });
              // store tx hash
              console.log("old txQueue l2", txQueue);
              const id = toast.loading(
                <TxToastContent
                  text="The transaction has been submitted for processing."
                  title="Transaction Submitted"
                  type="pending"
                />,
                {
                  isLoading: false,
                }
              );
              const newTxHashQueue = [
                ...txQueue,
                {
                  hash: txData.hash,
                  toastId: id,
                },
              ];
              console.log("newTxHashQueue l2", newTxHashQueue);
              setTxQueue(newTxHashQueue);
              // push bridge info
              const weiAmount = ethers.utils.parseUnits(amount.toString(), "wei");
              const weiAmountString = weiAmount.toString();
              console.log("weiAmount", weiAmount);
              console.log("weiAmountString", weiAmountString);
              pushBridge({
                // abortSignal,
                amount: weiAmountString,
                destinationAddress: account,
                detinationNetwork: to.chainId,
                env,
                originAddress: account,
                originNetwork: from.chainId,
                txHash: txData.hash,
              })
                .then((res) => {
                  console.log("pushBridge res after launch", res);
                })
                .catch((error) => {
                  console.log("pushBridge error after launch", error);
                });

              return txData;
            });
        };
        console.log("check network from.chainId", from.chainId);
        console.log("check network connectedProvider.data.chainId", chainId);
        if (from.chainId === chainId) {
          // return executeBridge();
          console.log("network is right");
          return executeBridge();
        } else {
          console.log("network need to change");
          return changeNetwork(from)
            .catch(() => {
              throw "wrong-network";
            })
            .then(executeBridge);
        }
      }
    },
    [
      env,
      connectedProvider,
      estimateBridgeGas,
      estimateVizingBridgeGas,
      changeNetwork,
      pushBridge,
      txQueue,
      setTxQueue,
    ]
  );

  const claim = useCallback(
    async ({
      bridge: {
        amount,
        depositCount,
        depositTxHash,
        destinationAddress,
        from,
        to,
        token,
        tokenOriginNetwork,
      },
    }: ClaimParams): Promise<ContractTransaction> => {
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        throw new Error("Connected provider is not available");
      }
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      console.log("claim fn called");
      const { account, chainId, provider } = connectedProvider.data;
      const contract = Bridge__factory.connect(to.bridgeContractAddress, provider.getSigner());
      const isL2Claim = to.key === "vizing";
      const apiUrl = env.bridgeApiUrl;
      const networkId = from.networkId;

      const { mainExitRoot, merkleProof, rollupExitRoot } = await getMerkleProof({
        apiUrl,
        depositCount,
        networkId,
      });

      const isTokenNativeOfToChain = token.chainId === to.chainId;
      const isMetadataRequired = !isTokenEther(token) && !isTokenNativeOfToChain;
      const metadata = isMetadataRequired
        ? await getErc20TokenEncodedMetadata({ chain: from, token })
        : "0x";

      const executeClaim = () =>
        contract
          .claimAsset(
            merkleProof,
            depositCount,
            mainExitRoot,
            rollupExitRoot,
            tokenOriginNetwork,
            token.address,
            to.networkId,
            destinationAddress,
            amount,
            metadata,
            isL2Claim ? { gasLimit: 1500000, gasPrice: 0 } : {}
          )
          .then((txData) => {
            storage.addAccountPendingTx(account, env, {
              amount,
              claimTxHash: txData.hash,
              depositTxHash,
              destinationAddress,
              from,
              timestamp: Date.now(),
              to,
              token,
              type: "claim",
            });

            return txData;
          });

      if (to.chainId === chainId) {
        return executeClaim();
      } else {
        return changeNetwork(to)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeClaim);
      }
    },
    [connectedProvider, env, changeNetwork]
  );

  const value = useMemo(
    () => ({
      bridge,
      claim,
      estimateBridgeGas,
      estimateVizingBridgeGas,
      fetchBridge,
      fetchBridges,
      getPendingBridges,
      pushBridge,
    }),
    [
      estimateBridgeGas,
      estimateVizingBridgeGas,
      fetchBridge,
      pushBridge,
      fetchBridges,
      getPendingBridges,
      bridge,
      claim,
    ]
  );

  return <bridgeContext.Provider value={value} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
