import { createPublicClient, http, type PublicClient } from "viem";
import { base, baseSepolia, mainnet, sepolia } from "viem/chains";
import { ChainId } from "@nodara/shared";

/**
 * Read-only by construction: no private key ever enters this package. It
 * gives the monitoring engine eyes on-chain; every write goes through
 * apps/backend/src/keeperhub instead.
 */
const chainByIdMap = {
  [ChainId.ETHEREUM_MAINNET]: mainnet,
  [ChainId.SEPOLIA]: sepolia,
  [ChainId.BASE]: base,
  [ChainId.BASE_SEPOLIA]: baseSepolia,
} as const;

export function resolveChain(chainId: number) {
  const chain = chainByIdMap[chainId as ChainId];
  if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
  return chain;
}

export interface RpcConfig {
  chainId: number;
  rpcUrl: string;
}

const clientCache = new Map<number, PublicClient>();

export function getPublicClient(config: RpcConfig): PublicClient {
  const cached = clientCache.get(config.chainId);
  if (cached) return cached;

  const chain = resolveChain(config.chainId);
  const client = createPublicClient({
    chain,
    transport: http(config.rpcUrl, { retryCount: 3, retryDelay: 500, timeout: 10_000 }),
  }) as PublicClient;

  clientCache.set(config.chainId, client);
  return client;
}

export const NATIVE_TOKEN_SENTINEL = "NATIVE";
export const UNLIMITED_APPROVAL_THRESHOLD =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;
