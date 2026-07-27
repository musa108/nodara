import type { ConditionHandler, ConditionEvaluationContext } from "@nodara/monitor";
import { ConditionOperator, type ConditionConfig } from "@nodara/shared";

type Config = Extract<ConditionConfig, { operator: "IS_UNLIMITED" }>;

/**
 * Treats anything above half of max uint256 as practically unlimited —
 * no realistic token balance ever needs an allowance that large, so this
 * safely catches both `type(uint256).max` and slightly-smaller
 * "unlimited" values some wallet UIs use.
 */
const PRACTICALLY_UNLIMITED_THRESHOLD =
  57896044618658097711785492504343953926634992332820282019728792003956564819968n; // 2^255

export const isUnlimitedConditionHandler: ConditionHandler<Config> = {
  operator: ConditionOperator.IS_UNLIMITED,
  evaluate(_config, ctx: ConditionEvaluationContext): boolean {
    const raw = ctx.evidence.approvedAmountRaw;
    if (typeof raw !== "string") return false;
    try {
      return BigInt(raw) >= PRACTICALLY_UNLIMITED_THRESHOLD;
    } catch {
      return false;
    }
  },
};
