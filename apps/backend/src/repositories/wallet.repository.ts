import { prisma } from "../database/prisma.js";
import type { Wallet } from "@prisma/client";

export const walletRepository = {
  countForUser(userId: string): Promise<number> {
    return prisma.wallet.count({ where: { userId } });
  },

  upsertByAddressAndChain(params: { userId: string; address: string; chainId: number; isPrimary: boolean }): Promise<Wallet> {
    const address = params.address.toLowerCase();
    return prisma.wallet.upsert({
      where: { address_chainId: { address, chainId: params.chainId } },
      update: {},
      create: { userId: params.userId, address, chainId: params.chainId, isPrimary: params.isPrimary },
    });
  },

  findManyForUser(userId: string): Promise<Wallet[]> {
    return prisma.wallet.findMany({ where: { userId }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] });
  },

  findById(id: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({ where: { id } });
  },

  updateColdWallet(id: string, coldWalletAddress: string): Promise<Wallet> {
    return prisma.wallet.update({ where: { id }, data: { coldWalletAddress: coldWalletAddress.toLowerCase() } });
  },

  updateScanCursor(id: string, params: { lastScannedBlock: bigint; lastKnownNativeBalance: string }): Promise<Wallet> {
    return prisma.wallet.update({
      where: { id },
      data: { lastScannedBlock: params.lastScannedBlock, lastKnownNativeBalance: params.lastKnownNativeBalance },
    });
  },
};
