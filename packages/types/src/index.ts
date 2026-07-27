/**
 * Branded types catch a whole class of bugs at compile time — e.g.
 * accidentally passing a token address where a wallet address was
 * expected. They're erased at runtime, so this package has zero deps.
 */

declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type EvmAddress = Brand<string, "EvmAddress">;
export type TxHash = Brand<string, "TxHash">;
export type ChainId = Brand<number, "ChainId">;

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export function isEvmAddress(value: string): value is EvmAddress {
  return EVM_ADDRESS_RE.test(value);
}

export function toEvmAddress(value: string): EvmAddress {
  if (!isEvmAddress(value)) {
    throw new Error(`"${value}" is not a valid EVM address`);
  }
  return value.toLowerCase() as EvmAddress;
}

export function isTxHash(value: string): value is TxHash {
  return TX_HASH_RE.test(value);
}

export type NullableFields<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };
export type WithTimestamps<T> = T & { createdAt: string; updatedAt: string };
