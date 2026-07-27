import type { TriggerHandler, TriggerEvaluationContext, TriggerEvaluationResult } from "@nodara/monitor";
import { TriggerType, type TriggerConfig } from "@nodara/shared";
import type { Address } from "viem";
import { getPublicClient, scanApprovalEvents } from "@nodara/blockchain";
import { resolveRpcUrl } from "../../config/rpc.js";

type Config = Extract<TriggerConfig, { type: typeof TriggerType.TOKEN_APPROVAL_DETECTED }>;

export const tokenApprovalDetectedTriggerHandler: TriggerHandler<Config> = {
  type: TriggerType.TOKEN_APPROVAL_DETECTED,

  async evaluate(config, ctx: TriggerEvaluationContext): Promise<TriggerEvaluationResult> {
    const client = getPublicClient({ chainId: ctx.chainId, rpcUrl: resolveRpcUrl(ctx.chainId) });
    const owner = ctx.walletAddress as Address;

    const approvals = await scanApprovalEvents(client, owner, ctx.fromBlock, ctx.toBlock);
    const relevant = config.tokenAddress
      ? approvals.filter((a) => a.tokenAddress.toLowerCase() === config.tokenAddress!.toLowerCase())
      : approvals;

    if (relevant.length === 0) return { triggered: false, evidence: {} };

    const latest = relevant[relevant.length - 1]!;
    return {
      triggered: true,
      evidence: {
        tokenAddress: latest.tokenAddress,
        spenderAddress: latest.spender,
        approvedAmountRaw: latest.value.toString(),
        transactionHash: latest.transactionHash,
      },
    };
  },
};
