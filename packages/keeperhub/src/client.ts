import type {
  GasEstimate,
  KeeperHubAuditEntry,
  SimulationRequest,
  SimulationResult,
  SubmissionRequest,
  SubmissionResult,
  TrackingResult,
} from "@nodara/shared";
import {
  GasEstimateSchema,
  KeeperHubAuditEntrySchema,
  SimulationResultSchema,
  SubmissionResultSchema,
  TrackingResultSchema,
} from "@nodara/shared";
import { KeeperHubError, KeeperHubTimeoutError } from "./errors.js";
import { withRetry, type RetryOptions } from "./retry.js";
import { z } from "zod";

export interface KeeperHubClientConfig {
  apiUrl: string;
  apiKey: string;
  timeoutMs?: number;
  retry?: Partial<RetryOptions>;
}

interface RequestOptions {
  method: "GET" | "POST";
  path: string;
  body?: unknown;
  operation: string;
  retryable?: boolean;
}

/**
 * KEEPERHUB SERVICE CLIENT
 * The ONLY module in Nodara allowed to make an outbound call that results
 * in an on-chain state change. apps/backend/src/keeperhub wraps this with
 * persistence + business rules, but every network call to the execution
 * layer happens here.
 */
export class KeeperHubClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly retryOptions: Partial<RetryOptions>;

  constructor(config: KeeperHubClientConfig) {
    if (!config.apiUrl) throw new Error("KeeperHubClient: apiUrl is required");
    if (!config.apiKey) throw new Error("KeeperHubClient: apiKey is required");
    this.apiUrl = config.apiUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.retryOptions = config.retry ?? {};
  }

  async simulateTransaction(request: SimulationRequest): Promise<SimulationResult> {
    const raw = await this.request({ method: "POST", path: "/v1/simulate", body: request, operation: "simulateTransaction", retryable: true });
    return SimulationResultSchema.parse(raw);
  }

  async estimateGas(request: SimulationRequest): Promise<GasEstimate> {
    const raw = await this.request({ method: "POST", path: "/v1/estimate-gas", body: request, operation: "estimateGas", retryable: true });
    return GasEstimateSchema.parse(raw);
  }

  /** Idempotent: resubmitting the same idempotencyKey returns the original job. */
  async submitTransaction(request: SubmissionRequest): Promise<SubmissionResult> {
    const raw = await this.request({
      method: "POST",
      path: "/v1/submit",
      body: request,
      operation: "submitTransaction",
      // Not blindly retried — a timeout doesn't tell us whether the tx
      // broadcast. Retries happen at the service layer, after explicitly
      // checking job status first.
      retryable: false,
    });
    return SubmissionResultSchema.parse(raw);
  }

  async trackTransaction(keeperHubJobId: string): Promise<TrackingResult> {
    const raw = await this.request({ method: "GET", path: `/v1/jobs/${encodeURIComponent(keeperHubJobId)}`, operation: "trackTransaction", retryable: true });
    return TrackingResultSchema.parse(raw);
  }

  /** Point-in-time status check — a lighter-weight alternative to trackTransaction for polling loops. */
  async getExecutionStatus(keeperHubJobId: string): Promise<TrackingResult> {
    const raw = await this.request({ method: "GET", path: `/v1/jobs/${encodeURIComponent(keeperHubJobId)}/status`, operation: "getExecutionStatus", retryable: true });
    return TrackingResultSchema.parse(raw);
  }

  /** Full stage-by-stage audit trail KeeperHub recorded for a job. */
  async getAuditTrail(keeperHubJobId: string): Promise<KeeperHubAuditEntry[]> {
    const raw = await this.request({ method: "GET", path: `/v1/jobs/${encodeURIComponent(keeperHubJobId)}/audit-trail`, operation: "getAuditTrail", retryable: true });
    return z.array(KeeperHubAuditEntrySchema).parse(raw);
  }

  private async request(opts: RequestOptions): Promise<unknown> {
    const exec = async (): Promise<unknown> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(`${this.apiUrl}${opts.path}`, {
          method: opts.method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
          body: opts.body ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });

        if (!response.ok) {
          const bodyText = await response.text().catch(() => "");
          throw new KeeperHubError({
            code: `KEEPERHUB_HTTP_${response.status}`,
            message: `KeeperHub ${opts.operation} failed with status ${response.status}: ${bodyText}`,
            statusCode: response.status,
            retryable: (opts.retryable ?? false) && response.status >= 500,
          });
        }
        return await response.json();
      } catch (error) {
        if (error instanceof KeeperHubError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new KeeperHubTimeoutError(opts.operation, error);
        }
        throw new KeeperHubError({
          code: "KEEPERHUB_NETWORK_ERROR",
          message: `Network error during ${opts.operation}: ${(error as Error).message}`,
          retryable: opts.retryable ?? false,
          cause: error,
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    return withRetry(() => exec(), this.retryOptions);
  }
}
