import { ChainId } from "@nodara/shared";

const EXPLORER_BASE_URL: Record<number, string> = {
  [ChainId.ETHEREUM_MAINNET]: "https://etherscan.io",
  [ChainId.SEPOLIA]: "https://sepolia.etherscan.io",
  [ChainId.BASE]: "https://basescan.org",
  [ChainId.BASE_SEPOLIA]: "https://sepolia.basescan.org",
};

export function getTxExplorerUrl(chainId: number, txHash: string): string | null {
  const base = EXPLORER_BASE_URL[chainId];
  if (!base) return null;
  return `${base}/tx/${txHash}`;
}