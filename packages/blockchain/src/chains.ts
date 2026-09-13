import { createPublicClient, defineChain, http, type PublicClient } from "viem";
import { base, baseSepolia, mainnet } from "viem/chains";
import { ChainId } from "@nodara/shared";

/**
 * BOT Chain isn't in viem's bundled chain registry (it's a new L1,
 * mainnet launched Feb 2026), so it's defined here explicitly. This is
 * the single source of truth for BOT Chain's network metadata — both
 * the backend (via this package) and the frontend (which imports these
 * exports directly for its wagmi config) use the same definition, so
 * chain ID / RPC / explorer never drift between the two.
 *
 * Verified independently against ChainList (chainlist.org/chain/677):
 * chain ID 677, BOT native currency, scan.botchain.ai explorer — matches.
 *
 * Nodara is mainnet-only by design — no testnet chains are configured
 * or selectable anywhere in the app.
 */
export const botChainMainnet = /*#__PURE__*/ defineChain({
  id: ChainId.BOT_CHAIN,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai"] },
  },
  blockExplorers: {
    default: { name: "BOTScan", url: "https://scan.botchain.ai" },
  },
});

/**
 * Read-only by construction: no private key ever enters this package. It
 * gives the monitoring engine eyes on-chain; every write goes through
 * apps/backend/src/keeperhub instead.
 */
const chainByIdMap = {
  [ChainId.ETHEREUM_MAINNET]: mainnet,
  [ChainId.BASE]: base,
  [ChainId.BOT_CHAIN]: botChainMainnet,
  84532: baseSepolia,
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
