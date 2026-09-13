import type { TriggerHandler, TriggerEvaluationContext, TriggerEvaluationResult } from "@nodara/monitor";
import { TriggerType, type TriggerConfig } from "@nodara/shared";
import type { Address } from "viem";
import { getPublicClient, getBalance, scanIncomingTransfers, NATIVE_TOKEN_SENTINEL } from "@nodara/blockchain";
import { resolveRpcUrl } from "../../config/rpc.js";
import { walletRepository } from "../../repositories/wallet.repository.js";

type Config = Extract<TriggerConfig, { type: typeof TriggerType.WALLET_RECEIVES_FUNDS }>;

export const walletReceivesFundsTriggerHandler: TriggerHandler<Config> = {
  type: TriggerType.WALLET_RECEIVES_FUNDS,

  async evaluate(config, ctx: TriggerEvaluationContext): Promise<TriggerEvaluationResult> {
    const client = getPublicClient({ chainId: ctx.chainId, rpcUrl: resolveRpcUrl(ctx.chainId) });
    const owner = ctx.walletAddress as Address;

    if (config.tokenAddress === NATIVE_TOKEN_SENTINEL) {
      // Native transfers emit no logs, so we poll balance and diff against
      // the balance recorded at the wallet's last scan.
      const balance = await getBalance(client, NATIVE_TOKEN_SENTINEL, owner);
      const wallet = await walletRepository.findById(ctx.walletId);
      const lastKnown = wallet ? BigInt(wallet.lastKnownNativeBalance) : balance.raw;
      const delta = balance.raw - lastKnown;

      if (delta <= 0n) return { triggered: false, evidence: {} };

      return {
        triggered: true,
        evidence: {
          tokenAddress: NATIVE_TOKEN_SENTINEL,
          amountRaw: delta.toString(),
          amountFormatted: balance.formatted,
          decimals: balance.decimals,
          symbol: balance.symbol,
        },
      };
    }

    const transfers = await scanIncomingTransfers(client, owner, config.tokenAddress, ctx.fromBlock, ctx.toBlock);
    if (transfers.length === 0) return { triggered: false, evidence: {} };

    const total = transfers.reduce((sum, t) => sum + t.value, 0n);
    return {
      triggered: true,
      evidence: {
        tokenAddress: config.tokenAddress,
        amountRaw: total.toString(),
        transferCount: transfers.length,
        transactionHashes: transfers.map((t) => t.transactionHash),
      },
    };
  },
};
