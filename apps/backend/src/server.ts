import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/prisma.js";
import { createModuleLogger } from "./utils/logger.js";
import { createMonitoringWorker } from "./workers/monitoring.worker.js";
import { createExecutionTrackerWorker } from "./workers/execution-tracker.worker.js";

const log = createModuleLogger("bootstrap");

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    log.info(`Nodara backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const monitoringWorker = createMonitoringWorker();
  const executionTracker = createExecutionTrackerWorker();
  if (env.MONITOR_ENABLED) {
    monitoringWorker.start();
    executionTracker.start();
  }

  const shutdown = async (signal: string): Promise<void> => {
    log.info(`received ${signal}, shutting down gracefully`);
    monitoringWorker.stop();
    executionTracker.stop();
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => log.error({ reason }, "Unhandled promise rejection"));
  process.on("uncaughtException", (err) => log.error({ err }, "Uncaught exception"));
}

main().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
