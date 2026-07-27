import { ChainId } from "@nodara/shared";
import { env } from "./env.js";
import { ValidationError } from "../utils/errors.js";

const rpcByChainId: Partial<Record<number, string | undefined>> = {
  [ChainId.ETHEREUM_MAINNET]: env.RPC_URL_MAINNET,
  [ChainId.SEPOLIA]: env.RPC_URL_SEPOLIA,
  [ChainId.BASE]: env.RPC_URL_BASE,
  [ChainId.BASE_SEPOLIA]: env.RPC_URL_BASE_SEPOLIA,
};

export function resolveRpcUrl(chainId: number): string {
  const url = rpcByChainId[chainId];
  if (!url) throw new ValidationError(`No RPC URL configured for chainId ${chainId}`);
  return url;
}
