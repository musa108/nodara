import type { ConditionHandler } from "@nodara/monitor";
import { ConditionOperator, type ConditionConfig } from "@nodara/shared";

type Config = Extract<ConditionConfig, { operator: "ALWAYS" }>;

export const alwaysConditionHandler: ConditionHandler<Config> = {
  operator: ConditionOperator.ALWAYS,
  evaluate(): boolean {
    return true;
  },
};
