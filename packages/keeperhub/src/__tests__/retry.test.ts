import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../retry.js";
import { KeeperHubError } from "../errors.js";

describe("withRetry", () => {
  it("returns the result on first success without retrying", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries a retryable error until it succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new KeeperHubError({ code: "X", message: "transient", retryable: true }))
      .mockResolvedValueOnce("ok");

    const result = await withRetry(fn, { baseDelayMs: 1, maxDelayMs: 2 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-retryable error", async () => {
    const fn = vi.fn().mockRejectedValue(new KeeperHubError({ code: "SIM_FAILED", message: "reverted", retryable: false }));
    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow("reverted");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after maxAttempts and throws the last error", async () => {
    const fn = vi.fn().mockRejectedValue(new KeeperHubError({ code: "X", message: "still failing", retryable: true }));
    await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 2 })).rejects.toThrow("still failing");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("treats a plain network TypeError as retryable", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")).mockResolvedValueOnce("ok");
    const result = await withRetry(fn, { baseDelayMs: 1, maxDelayMs: 2 });
    expect(result).toBe("ok");
  });
});
