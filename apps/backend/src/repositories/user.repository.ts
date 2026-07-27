import { prisma } from "../database/prisma.js";
import type { User } from "@prisma/client";

export const userRepository = {
  findByAddress(address: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { address: address.toLowerCase() } });
  },

  upsertByAddress(address: string): Promise<User> {
    const normalized = address.toLowerCase();
    return prisma.user.upsert({
      where: { address: normalized },
      update: {},
      create: { address: normalized },
    });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },
};
