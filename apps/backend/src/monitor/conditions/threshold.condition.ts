import type { ConditionHandler, ConditionEvaluationContext } from "@nodara/monitor";
import { ConditionOperator, type ConditionConfig } from "@nodara/shared";
import { parseUnits } from "viem";

type Config = Extract<
  ConditionConfig,
  { operator: "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "EQUAL" | "NOT_EQUAL" }
>;

function compare(operator: Config["operator"], amount: bigint, threshold: bigint): boolean {
  switch (operator) {
    case ConditionOperator.GREATER_THAN:
      return amount > threshold;
    case ConditionOperator.GREATER_THAN_OR_EQUAL:
      return amount >= threshold;
    case ConditionOperator.LESS_THAN:
      return amount < threshold;
    case ConditionOperator.LESS_THAN_OR_EQUAL:
      return amount <= threshold;
    case ConditionOperator.EQUAL:
      return amount === threshold;
    case ConditionOperator.NOT_EQUAL:
      return amount !== threshold;
  }
}

/** Reads evidence.amountRaw (set by triggers like WALLET_RECEIVES_FUNDS) and compares against config.value. */
export function makeThresholdConditionHandler(operator: Config["operator"]): ConditionHandler<Config> {
  return {
    operator,
    evaluate(config, ctx: ConditionEvaluationContext): boolean {
      const amountRaw = ctx.evidence.amountRaw;
      if (typeof amountRaw !== "string") return false;
      const amount = BigInt(amountRaw);
      const threshold = parseUnits(config.value, ctx.tokenDecimals);
      return compare(operator, amount, threshold);
    },
  };
}
