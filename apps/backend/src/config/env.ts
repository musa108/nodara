import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  SIWE_DOMAIN: z.string().default("localhost:3000"),

  KEEPERHUB_API_URL: z.string(),
  KEEPERHUB_API_KEY: z.string().default("mock-key"),

  EXECUTION_MODE: z.enum(["KEEPERHUB", "DIRECT"]).default("KEEPERHUB"),
  EXECUTION_PRIVATE_KEY: z.string().optional(),

  RPC_URL_MAINNET: z.string().url().optional(),
  RPC_URL_SEPOLIA: z.string().url().optional(),
  RPC_URL_BASE: z.string().url().optional(),
  RPC_URL_BASE_SEPOLIA: z.string().url().optional(),

  MONITOR_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  MONITOR_ENABLED: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),

  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    for (const issue of parsed.error.issues) {
      console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
