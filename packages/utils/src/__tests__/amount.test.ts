import { describe, it, expect } from "vitest";
import { formatUnitsSimple, parseUnitsSimple, truncateAddress } from "../amount.js";

describe("formatUnitsSimple / parseUnitsSimple round-trip", () => {
  it("formats whole numbers without a decimal point", () => {
    expect(formatUnitsSimple(2000000000000000000n, 18)).toBe("2");
  });

  it("formats fractional amounts and trims trailing zeros", () => {
    expect(formatUnitsSimple(2500000000000000000n, 18)).toBe("2.5");
  });

  it("handles negative amounts", () => {
    expect(formatUnitsSimple(-1500000n, 6)).toBe("-1.5");
  });

  it("parses decimal strings back to the correct raw bigint", () => {
    expect(parseUnitsSimple("2.5", 18)).toBe(2500000000000000000n);
  });

  it("round-trips an arbitrary value through format then parse", () => {
    const raw = 123456789000000000n;
    const formatted = formatUnitsSimple(raw, 18);
    expect(parseUnitsSimple(formatted, 18)).toBe(raw);
  });

  it("parses whole numbers with no decimal point", () => {
    expect(parseUnitsSimple("10", 6)).toBe(10000000n);
  });
});

describe("truncateAddress", () => {
  it("shortens a full address to a head…tail form", () => {
    expect(truncateAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234…5678");
  });

  it("leaves short strings untouched", () => {
    expect(truncateAddress("0xshort")).toBe("0xshort");
  });
});
