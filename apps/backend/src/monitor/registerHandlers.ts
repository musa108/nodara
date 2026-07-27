import { triggerRegistry, conditionRegistry, actionRegistry } from "@nodara/monitor";
import { ConditionOperator } from "@nodara/shared";
import { manualTriggerHandler } from "./triggers/manual.trigger.js";
import { scheduleTriggerHandler } from "./triggers/schedule.trigger.js";
import { walletReceivesFundsTriggerHandler } from "./triggers/wallet-receives-funds.trigger.js";
import { tokenApprovalDetectedTriggerHandler } from "./triggers/token-approval-detected.trigger.js";
import { makeThresholdConditionHandler } from "./conditions/threshold.condition.js";
import { isUnlimitedConditionHandler } from "./conditions/unlimited-approval.condition.js";
import { alwaysConditionHandler } from "./conditions/always.condition.js";
import { transferTokensActionHandler } from "../keeperhub/actions/transfer-tokens.action.js";
import { revokeApprovalActionHandler } from "../keeperhub/actions/revoke-approval.action.js";
import { swapTokensActionHandler } from "../keeperhub/actions/swap-tokens.action.js";

let registered = false;

/** Idempotent — tsx watch / tests may call this more than once per process, and HandlerRegistry throws on duplicates. */
export function registerHandlers(): void {
  if (registered) return;

  triggerRegistry.register(manualTriggerHandler.type, manualTriggerHandler);
  triggerRegistry.register(scheduleTriggerHandler.type, scheduleTriggerHandler);
  triggerRegistry.register(walletReceivesFundsTriggerHandler.type, walletReceivesFundsTriggerHandler);
  triggerRegistry.register(tokenApprovalDetectedTriggerHandler.type, tokenApprovalDetectedTriggerHandler);

  for (const operator of [
    ConditionOperator.GREATER_THAN,
    ConditionOperator.GREATER_THAN_OR_EQUAL,
    ConditionOperator.LESS_THAN,
    ConditionOperator.LESS_THAN_OR_EQUAL,
    ConditionOperator.EQUAL,
    ConditionOperator.NOT_EQUAL,
  ] as const) {
    conditionRegistry.register(operator, makeThresholdConditionHandler(operator));
  }
  conditionRegistry.register(isUnlimitedConditionHandler.operator, isUnlimitedConditionHandler);
  conditionRegistry.register(alwaysConditionHandler.operator, alwaysConditionHandler);

  actionRegistry.register(transferTokensActionHandler.type, transferTokensActionHandler);
  actionRegistry.register(revokeApprovalActionHandler.type, revokeApprovalActionHandler);
  actionRegistry.register(swapTokensActionHandler.type, swapTokensActionHandler);

  registered = true;
}
