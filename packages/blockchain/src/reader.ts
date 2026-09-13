import type { Address, PublicClient } from "viem";
import { formatUnits } from "viem";
import { erc20Abi, erc20ApprovalEvent, erc20TransferEvent } from "./abis/erc20.js";
import { NATIVE_TOKEN_SENTINEL } from "./chains.js";

export interface TokenBalance {
  raw: bigint;
  formatted: string;
  decimals: number;
  symbol: string;
}

export async function getNativeBalance(client: PublicClient, address: Address): Promise<TokenBalance> {
  const raw = await client.getBalance({ address });
  return { raw, formatted: formatUnits(raw, 18), decimals: 18, symbol: "ETH" };
}

export async function getErc20Balance(
  client: PublicClient,
  tokenAddress: Address,
  ownerAddress: Address
): Promise<TokenBalance> {
  const [raw, decimals, symbol] = await Promise.all([
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "balanceOf", args: [ownerAddress] }),
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
    client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" }),
  ]);
  return { raw, formatted: formatUnits(raw, decimals), decimals, symbol };
}

export async function getBalance(
  client: PublicClient,
  tokenAddress: string,
  ownerAddress: Address
): Promise<TokenBalance> {
  if (tokenAddress === NATIVE_TOKEN_SENTINEL) return getNativeBalance(client, ownerAddress);
  return getErc20Balance(client, tokenAddress as Address, ownerAddress);
}

export async function getAllowance(
  client: PublicClient,
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address
): Promise<bigint> {
  return client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [ownerAddress, spenderAddress],
  });
}

export interface ApprovalEvent {
  tokenAddress: Address;
  owner: Address;
  spender: Address;
  value: bigint;
  blockNumber: bigint;
  transactionHash: string;
}

export async function scanApprovalEvents(
  client: PublicClient,
  ownerAddress: Address,
  fromBlock: bigint,
  toBlock: bigint
): Promise<ApprovalEvent[]> {
  const logs = await client.getLogs({
    event: erc20ApprovalEvent,
    args: { owner: ownerAddress },
    fromBlock,
    toBlock,
  });
  return logs.map((log) => ({
    tokenAddress: log.address,
    owner: log.args.owner as Address,
    spender: log.args.spender as Address,
    value: log.args.value as bigint,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
  }));
}

export async function scanIncomingTransfers(
  client: PublicClient,
  ownerAddress: Address,
  tokenAddress: string,
  fromBlock: bigint,
  toBlock: bigint
): Promise<{ value: bigint; transactionHash: string; blockNumber: bigint }[]> {
  if (tokenAddress === NATIVE_TOKEN_SENTINEL) return [];

  const logs = await client.getLogs({
    address: tokenAddress as Address,
    event: erc20TransferEvent,
    args: { to: ownerAddress },
    fromBlock,
    toBlock,
  });

  return logs.map((log) => ({
    value: log.args.value as bigint,
    transactionHash: log.transactionHash,
    blockNumber: log.blockNumber,
  }));
}
