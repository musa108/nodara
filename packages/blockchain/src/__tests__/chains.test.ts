import { describe, it, expect } from "vitest";
import { ChainId } from "@nodara/shared";
import { resolveChain, getPublicClient, botChainMainnet } from "../chains.js";

/**
 * Nodara is mainnet-only — no testnet chains are defined or selectable
 * anywhere in the app. These tests cover what's verifiable without a
 * live RPC connection: chain metadata correctness and client
 * construction. They do NOT exercise real network calls (block number,
 * balance reads, event scans) — that requires a reachable RPC endpoint,
 * which this test environment does not have. Connectivity should be
 * verified manually against RPC_URL_BOTCHAIN before relying on this in
 * production; see docs/botchain-deployment.md.
 */

describe("BOT Chain mainnet definition", () => {
  it("chain ID matches the shared ChainId enum", () => {
    expect(botChainMainnet.id).toBe(ChainId.BOT_CHAIN);
    expect(botChainMainnet.id).toBe(677);
  });

  it("uses BOT as the native currency", () => {
    expect(botChainMainnet.nativeCurrency.symbol).toBe("BOT");
    expect(botChainMainnet.nativeCurrency.decimals).toBe(18);
  });

  it("points at the expected default RPC URL", () => {
    expect(botChainMainnet.rpcUrls.default.http[0]).toBe("https://rpc.botchain.ai");
  });

  it("points at the expected block explorer", () => {
    expect(botChainMainnet.blockExplorers?.default.url).toBe("https://scan.botchain.ai");
  });

  it("is not flagged as a testnet", () => {
    expect(botChainMainnet.testnet).not.toBe(true);
  });
});

describe("resolveChain", () => {
  it("resolves BOT Chain by chain ID", () => {
    expect(resolveChain(ChainId.BOT_CHAIN).id).toBe(677);
  });

  it("still resolves the pre-existing chains unchanged", () => {
    expect(resolveChain(ChainId.ETHEREUM_MAINNET).id).toBe(1);
    expect(resolveChain(ChainId.BASE).id).toBe(8453);
  });

  it("throws a clear error for an unregistered chain ID", () => {
    expect(() => resolveChain(999999)).toThrow(/Unsupported chainId: 999999/);
  });

  it("throws for a removed testnet chain ID (Nodara is mainnet-only)", () => {
    expect(() => resolveChain(11155111)).toThrow(/Unsupported chainId/); // Sepolia
    expect(() => resolveChain(968)).toThrow(/Unsupported chainId/); // BOT Chain Testnet
  });
});

describe("getPublicClient", () => {
  it("constructs a client for BOT Chain mainnet without throwing", () => {
    const client = getPublicClient({ chainId: ChainId.BOT_CHAIN, rpcUrl: "https://rpc.botchain.ai" });
    expect(client.chain?.id).toBe(677);
  });

  it("caches the client per chain ID rather than recreating it", () => {
    const a = getPublicClient({ chainId: ChainId.BOT_CHAIN, rpcUrl: "https://rpc.botchain.ai" });
    const b = getPublicClient({ chainId: ChainId.BOT_CHAIN, rpcUrl: "https://rpc.botchain.ai" });
    expect(a).toBe(b);
  });
});
