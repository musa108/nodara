import type { ActionType, TriggerType } from "@nodara/shared";

/**
 * PLUGIN ARCHITECTURE
 * The monitoring/execution engines never switch on workflow type
 * internally — they resolve a handler from a registry keyed by `type`.
 * Adding a new trigger/condition/action means writing one handler and
 * registering it; the engine loop itself never changes. Concrete
 * (DB-aware, chain-aware) handlers live in
 * apps/backend/src/monitor/{triggers,conditions} and
 * apps/backend/src/keeperhub/actions.
 */

export interface TriggerEvaluationContext {
  workflowId: string;
  walletId: string;
  walletAddress: string;
  chainId: number;
  fromBlock: bigint;
  toBlock: bigint;
}

export interface TriggerEvaluationResult {
  triggered: boolean;
  evidence: Record<string, unknown>;
}

export interface TriggerHandler<TConfig = unknown> {
  type: TriggerType;
  evaluate(config: TConfig, ctx: TriggerEvaluationContext): Promise<TriggerEvaluationResult>;
}

export interface ConditionEvaluationContext {
  evidence: Record<string, unknown>;
  tokenDecimals: number;
}

export interface ConditionHandler<TConfig = unknown> {
  operator: string;
  evaluate(config: TConfig, ctx: ConditionEvaluationContext): boolean;
}

export interface ActionBuildContext {
  walletAddress: string;
  coldWalletAddress: string | null;
  chainId: number;
  evidence: Record<string, unknown>;
}

export interface ActionHandler<TConfig = unknown> {
  type: ActionType;
  buildTransaction(config: TConfig, ctx: ActionBuildContext): Promise<{ to: string; data: string; value: string }>;
}

export class HandlerRegistry<K extends string, H> {
  private readonly handlers = new Map<K, H>();

  register(key: K, handler: H): void {
    if (this.handlers.has(key)) throw new Error(`Handler already registered for key: ${key}`);
    this.handlers.set(key, handler);
  }

  resolve(key: K): H {
    const handler = this.handlers.get(key);
    if (!handler) throw new Error(`No handler registered for key: ${key}`);
    return handler;
  }

  has(key: K): boolean {
    return this.handlers.has(key);
  }

  keys(): K[] {
    return Array.from(this.handlers.keys());
  }
}

export const triggerRegistry = new HandlerRegistry<TriggerType, TriggerHandler>();
export const conditionRegistry = new HandlerRegistry<string, ConditionHandler>();
export const actionRegistry = new HandlerRegistry<ActionType, ActionHandler>();
