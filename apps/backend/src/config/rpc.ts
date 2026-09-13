import { ChainId } from "@nodara/shared";
import { env } from "./env.js";
import { ValidationError } from "../utils/errors.js";

const rpcByChainId: Partial<Record<number, string | undefined>> = {
  [ChainId.ETHEREUM_MAINNET]: env.RPC_URL_MAINNET,
  [ChainId.BASE]: env.RPC_URL_BASE,
  [ChainId.BOT_CHAIN]: env.RPC_URL_BOTCHAIN || "https://rpc.botchain.ai",
  84532: "https://sepolia.base.org",
};

export function resolveRpcUrl(chainId: number): string {
  const url = rpcByChainId[chainId];
  if (!url) throw new ValidationError(`No RPC URL configured for chainId ${chainId}`);
  return url;
}
