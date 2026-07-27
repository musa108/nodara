export interface PollerLogger {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
}

const consoleLogger: PollerLogger = {
  info: (msg, meta) => console.log(`[monitor] ${msg}`, meta ?? ""),
  warn: (msg, meta) => console.warn(`[monitor] ${msg}`, meta ?? ""),
  error: (msg, meta) => console.error(`[monitor] ${msg}`, meta ?? ""),
};

export interface PollerOptions {
  intervalMs?: number;
  logger?: PollerLogger;
  onTickError?: (error: unknown) => void;
}

/**
 * Self-scheduling interval runner: never overlaps runs, isolates errors so
 * one bad tick can't kill the worker process, and supports graceful
 * start/stop. The Monitoring Engine wires its workflow-evaluation sweep
 * into this via the `tick` callback — this is also how the engine
 * "gracefully recovers from crashes": a crashed tick just gets logged and
 * the next tick still fires on schedule.
 */
export class Poller {
  private readonly intervalMs: number;
  private readonly logger: PollerLogger;
  private readonly onTickError?: (error: unknown) => void;
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private ticking = false;
  private tickCount = 0;

  constructor(
    private readonly name: string,
    private readonly tick: () => Promise<void>,
    options: PollerOptions = {}
  ) {
    this.intervalMs = options.intervalMs ?? 30_000;
    this.logger = options.logger ?? consoleLogger;
    this.onTickError = options.onTickError;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.logger.info(`starting poller "${this.name}"`, { intervalMs: this.intervalMs });
    this.scheduleNext(0);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.logger.info(`stopped poller "${this.name}"`);
  }

  private scheduleNext(delayMs: number): void {
    if (!this.running) return;
    this.timer = setTimeout(() => void this.runTick(), delayMs);
  }

  private async runTick(): Promise<void> {
    if (this.ticking) {
      this.logger.warn(`skipping tick for "${this.name}" — previous tick still running`);
      this.scheduleNext(this.intervalMs);
      return;
    }

    this.ticking = true;
    const startedAt = Date.now();
    this.tickCount += 1;
    const currentTick = this.tickCount;

    try {
      await this.tick();
      this.logger.info(`tick #${currentTick} for "${this.name}" completed`, { durationMs: Date.now() - startedAt });
    } catch (error) {
      this.logger.error(`tick #${currentTick} for "${this.name}" failed`, {
        error: error instanceof Error ? error.message : error,
      });
      this.onTickError?.(error);
    } finally {
      this.ticking = false;
      this.scheduleNext(this.intervalMs);
    }
  }
}
