"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia, mainnet, sepolia } from "wagmi/chains";

/** Get a free WalletConnect Cloud project ID at https://cloud.walletconnect.com */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Nodara",
  projectId: projectId || "nodara-dev-placeholder",
  chains: [mainnet, sepolia, base, baseSepolia],
  ssr: true,
});
