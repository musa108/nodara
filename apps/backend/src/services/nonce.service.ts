import { generateNonce } from "siwe";

/**
 * Nonces are short-lived and single-use. In-memory is fine for a single
 * backend instance (matches the Railway deployment target). Swap for a
 * Redis-backed store behind these same three functions if this ever runs
 * multi-instance.
 */
interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

const NONCE_TTL_MS = 5 * 60 * 1000;
const store = new Map<string, NonceEntry>();

function sweepExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key);
  }
}

export function issueNonce(address: string): string {
  sweepExpired();
  const nonce = generateNonce();
  store.set(address.toLowerCase(), { nonce, expiresAt: Date.now() + NONCE_TTL_MS });
  return nonce;
}

export function consumeNonce(address: string, nonce: string): boolean {
  sweepExpired();
  const key = address.toLowerCase();
  const entry = store.get(key);
  if (!entry || entry.nonce !== nonce || entry.expiresAt < Date.now()) return false;
  store.delete(key);
  return true;
}
