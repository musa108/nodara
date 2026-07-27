import { describe, it, expect } from "vitest";
import { generateIdempotencyKey, generateManualIdempotencyKey } from "../idempotency.js";

describe("generateIdempotencyKey", () => {
  it("is deterministic for the same workflow + evidence", () => {
    const a = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { amountRaw: "100", tokenAddress: "NATIVE" } });
    const b = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { amountRaw: "100", tokenAddress: "NATIVE" } });
    expect(a).toBe(b);
  });

  it("is insensitive to evidence key ordering", () => {
    const a = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { a: 1, b: 2 } });
    const b = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { b: 2, a: 1 } });
    expect(a).toBe(b);
  });

  it("differs for different workflows with identical evidence", () => {
    const a = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { amountRaw: "100" } });
    const b = generateIdempotencyKey({ workflowId: "wf_2", evidenceFingerprint: { amountRaw: "100" } });
    expect(a).not.toBe(b);
  });

  it("differs for different evidence on the same workflow", () => {
    const a = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { amountRaw: "100" } });
    const b = generateIdempotencyKey({ workflowId: "wf_1", evidenceFingerprint: { amountRaw: "200" } });
    expect(a).not.toBe(b);
  });

  it("prefixes the key with the workflow id for readability", () => {
    const key = generateIdempotencyKey({ workflowId: "wf_abc123", evidenceFingerprint: {} });
    expect(key.startsWith("wf_wf_abc123_")).toBe(true);
  });
});

describe("generateManualIdempotencyKey", () => {
  it("produces a unique key on every call, even for the same workflow", () => {
    const a = generateManualIdempotencyKey("wf_1");
    const b = generateManualIdempotencyKey("wf_1");
    expect(a).not.toBe(b);
  });
});
