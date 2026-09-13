import type { ActionHandler } from "@nodara/monitor";
import { ActionType, type ActionConfig } from "@nodara/shared";
import { encodeFunctionData, type Address } from "viem";
import { erc20Abi } from "@nodara/blockchain";

type Config = Extract<ActionConfig, { type: typeof ActionType.REVOKE_APPROVAL }>;

export const revokeApprovalActionHandler: ActionHandler<Config> = {
  type: ActionType.REVOKE_APPROVAL,

  async buildTransaction(config) {
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [config.spenderAddress as Address, 0n],
    });
    return { to: config.tokenAddress, data, value: "0" };
  },
};
