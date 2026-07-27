import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import pinoHttpImport from "pino-http";
import type { Request } from "express";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { auditLogRouter } from "./routes/auditLog.routes.js";
import { workflowRouter } from "./routes/workflow.routes.js";
import { executionRouter } from "./routes/execution.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";

// pino-http ships a CJS default export; NodeNext interop surfaces it as a
// namespace object at the type level even though the runtime value is
// callable, so we re-type it explicitly here.
const pinoHttp = pinoHttpImport as unknown as typeof import("pino-http").default;

/**
 * All route modules are live as of Phase 6. Kept explicit (not
 * auto-globbed) so the API surface is easy to audit at a glance.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req: Request) => req.url === "/health" } }));
  app.use(apiRateLimiter);

  app.use(healthRouter);

  app.use("/api/auth", authRouter);
  app.use("/api/wallets", walletRouter);
  app.use("/api/audit-logs", auditLogRouter);
  app.use("/api/workflows", workflowRouter);
  app.use("/api/executions", executionRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/analytics", analyticsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
