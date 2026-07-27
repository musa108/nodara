/**
 * Minimal fixed-point helpers for token amounts. Kept dependency-free
 * (no viem) so the frontend can use these without pulling in a wallet
 * library just to render a number.
 */

export function formatUnitsSimple(raw: bigint, decimals: number): string {
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const divisor = 10n ** BigInt(decimals);
  const whole = abs / divisor;
  const fraction = abs % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  const sign = negative ? "-" : "";
  return fractionStr ? `${sign}${whole}.${fractionStr}` : `${sign}${whole}`;
}

export function parseUnitsSimple(value: string, decimals: number): bigint {
  const [whole = "0", fraction = ""] = value.trim().split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const combined = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");
  return BigInt(combined || "0");
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function truncateHash(hash: string, chars = 6): string {
  return truncateAddress(hash, chars);
}
