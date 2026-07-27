import { describe, it, expect } from "vitest";
import { makeThresholdConditionHandler } from "../threshold.condition.js";
import { isUnlimitedConditionHandler } from "../unlimited-approval.condition.js";
import { alwaysConditionHandler } from "../always.condition.js";

describe("threshold condition handler", () => {
  const ctx = (amountRaw: string) => ({ evidence: { amountRaw }, tokenDecimals: 18 });

  it("GREATER_THAN: 3 ETH > 2 ETH is true", () => {
    const handler = makeThresholdConditionHandler("GREATER_THAN");
    expect(handler.evaluate({ operator: "GREATER_THAN", value: "2.0" }, ctx("3000000000000000000"))).toBe(true);
  });

  it("GREATER_THAN: 1 ETH > 2 ETH is false", () => {
    const handler = makeThresholdConditionHandler("GREATER_THAN");
    expect(handler.evaluate({ operator: "GREATER_THAN", value: "2.0" }, ctx("1000000000000000000"))).toBe(false);
  });

  it("EQUAL: exact match is true", () => {
    const handler = makeThresholdConditionHandler("EQUAL");
    expect(handler.evaluate({ operator: "EQUAL", value: "2.0" }, ctx("2000000000000000000"))).toBe(true);
  });

  it("LESS_THAN_OR_EQUAL: boundary value is true", () => {
    const handler = makeThresholdConditionHandler("LESS_THAN_OR_EQUAL");
    expect(handler.evaluate({ operator: "LESS_THAN_OR_EQUAL", value: "2.0" }, ctx("2000000000000000000"))).toBe(true);
  });

  it("returns false when evidence has no amountRaw", () => {
    const handler = makeThresholdConditionHandler("GREATER_THAN");
    expect(handler.evaluate({ operator: "GREATER_THAN", value: "2.0" }, { evidence: {}, tokenDecimals: 18 })).toBe(false);
  });
});

describe("isUnlimitedConditionHandler", () => {
  it("flags max uint256 as unlimited", () => {
    const maxUint256 = (2n ** 256n - 1n).toString();
    expect(
      isUnlimitedConditionHandler.evaluate({ operator: "IS_UNLIMITED" }, { evidence: { approvedAmountRaw: maxUint256 }, tokenDecimals: 18 })
    ).toBe(true);
  });

  it("does not flag a modest approval as unlimited", () => {
    const modest = (1000n * 10n ** 18n).toString(); // 1000 tokens
    expect(
      isUnlimitedConditionHandler.evaluate({ operator: "IS_UNLIMITED" }, { evidence: { approvedAmountRaw: modest }, tokenDecimals: 18 })
    ).toBe(false);
  });

  it("returns false for missing or malformed evidence", () => {
    expect(isUnlimitedConditionHandler.evaluate({ operator: "IS_UNLIMITED" }, { evidence: {}, tokenDecimals: 18 })).toBe(false);
    expect(
      isUnlimitedConditionHandler.evaluate({ operator: "IS_UNLIMITED" }, { evidence: { approvedAmountRaw: "not-a-number" }, tokenDecimals: 18 })
    ).toBe(false);
  });
});

describe("alwaysConditionHandler", () => {
  it("always returns true regardless of evidence", () => {
    expect(alwaysConditionHandler.evaluate({ operator: "ALWAYS" }, { evidence: {}, tokenDecimals: 18 })).toBe(true);
  });
});
