import { getPublicClient, NATIVE_TOKEN_SENTINEL, erc20DecimalsFunction } from "@nodara/blockchain";
import type { Address } from "viem";
import { resolveRpcUrl } from "../config/rpc.js";

const cache = new Map<string, number>();

export async function getTokenDecimals(tokenAddress: string, chainId: number): Promise<number> {
  if (tokenAddress === NATIVE_TOKEN_SENTINEL) return 18;

  const cacheKey = `${chainId}:${tokenAddress.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const client = getPublicClient({ chainId, rpcUrl: resolveRpcUrl(chainId) });
  const decimals = await client.readContract({
    address: tokenAddress as Address,
    abi: [erc20DecimalsFunction],
    functionName: "decimals",
  });

  cache.set(cacheKey, decimals);
  return decimals;
}
