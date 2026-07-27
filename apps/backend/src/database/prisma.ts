import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger("database");

declare global {
  // eslint-disable-next-line no-var
  var __nodaraPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__nodaraPrisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ],
  });

if (env.NODE_ENV === "development") {
  global.__nodaraPrisma = prisma;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on("warn", (e: { message: string }) => log.warn(e.message));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$on("error", (e: { message: string }) => log.error(e.message));

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  log.info("connected to database");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  log.info("disconnected from database");
}
