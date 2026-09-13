import { createHash, randomUUID } from "node:crypto";

/**
 * Deterministic per-firing key: same workflow + same trigger evidence
 * fingerprint => same key, so re-evaluating the same block range twice
 * (e.g. after a crash/restart) can't submit the same execution twice.
 * KeeperHub's submitTransaction is expected to treat this as an
 * idempotency token.
 */
export function generateIdempotencyKey(params: {
  workflowId: string;
  evidenceFingerprint: Record<string, unknown>;
}): string {
  const hash = createHash("sha256")
    .update(params.workflowId)
    .update(JSON.stringify(sortKeys(params.evidenceFingerprint)))
    .digest("hex");
  return `wf_${params.workflowId}_${hash.slice(0, 24)}`;
}

/** Manual triggers have no reusable evidence fingerprint — each firing is unique. */
export function generateManualIdempotencyKey(workflowId: string): string {
  return `wf_${workflowId}_manual_${randomUUID()}`;
}

function sortKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}
