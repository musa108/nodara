export class KeeperHubError extends Error {
  public readonly code: string;
  public readonly statusCode: number | null;
  public readonly retryable: boolean;
  public override readonly cause?: unknown;

  constructor(params: {
    code: string;
    message: string;
    statusCode?: number | null;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "KeeperHubError";
    this.code = params.code;
    this.statusCode = params.statusCode ?? null;
    this.retryable = params.retryable ?? false;
    this.cause = params.cause;
  }
}

export class KeeperHubTimeoutError extends KeeperHubError {
  constructor(operation: string, cause?: unknown) {
    super({
      code: "KEEPERHUB_TIMEOUT",
      message: `KeeperHub request timed out during ${operation}`,
      retryable: true,
      cause,
    });
    this.name = "KeeperHubTimeoutError";
  }
}

export class KeeperHubSimulationFailedError extends KeeperHubError {
  constructor(revertReason: string | null) {
    super({
      code: "KEEPERHUB_SIMULATION_FAILED",
      message: revertReason ? `Simulation reverted: ${revertReason}` : "Simulation failed for an unknown reason",
      retryable: false,
    });
    this.name = "KeeperHubSimulationFailedError";
  }
}
