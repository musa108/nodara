/**
 * Run with: npm run prisma:seed -w apps/backend
 * Seeds a demo user + wallet. Extended in later phases as Workflow,
 * Trigger, and Action come online.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const demoUser = await prisma.user.upsert({
    where: { address: "0x0000000000000000000000000000000000dead" },
    update: {},
    create: {
      address: "0x0000000000000000000000000000000000dead",
      wallets: {
        create: { address: "0x0000000000000000000000000000000000dead", chainId: 11155111, isPrimary: true },
      },
    },
    include: { wallets: true },
  });

  console.log(`Seeded demo user ${demoUser.id} with ${demoUser.wallets.length} wallet(s).`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
