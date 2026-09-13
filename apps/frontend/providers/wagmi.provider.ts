"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, mainnet } from "wagmi/chains";
import { botChainMainnet } from "@nodara/blockchain";

/** Get a free WalletConnect Cloud project ID at https://cloud.walletconnect.com */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Nodara",
  projectId: projectId || "nodara-dev-placeholder",
  chains: [mainnet, base, botChainMainnet],
  ssr: true,
});
