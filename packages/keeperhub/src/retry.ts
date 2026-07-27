import { KeeperHubError } from "./errors.js";

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = { maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 5_000 };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown): boolean {
  if (error instanceof KeeperHubError) return error.retryable;
  return error instanceof TypeError;
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const canRetry = attempt < opts.maxAttempts && isRetryable(error);
      if (!canRetry) throw error;

      const exponential = Math.min(opts.baseDelayMs * 2 ** (attempt - 1), opts.maxDelayMs);
      const jitter = Math.random() * exponential * 0.25;
      await sleep(exponential + jitter);
    }
  }
  throw lastError;
}
