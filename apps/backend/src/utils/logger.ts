import pino from "pino";
import { env } from "../config/env.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pinoFactory = (typeof pino === "function" ? pino : (pino as any).default || pino) as any;

export const logger = pinoFactory({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
      : undefined,
  base: { service: "nodara-backend" },
});

export function createModuleLogger(moduleName: string) {
  return logger.child({ module: moduleName });
}
