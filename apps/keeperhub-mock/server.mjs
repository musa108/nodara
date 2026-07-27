/**
 * KeeperHub Mock Server
 * Implements the full KeeperHub API contract for local development.
 *
 * Endpoints:
 *   POST /v1/simulate       → SimulationResult
 *   POST /v1/estimate-gas   → GasEstimate
 *   POST /v1/submit         → SubmissionResult
 *   GET  /v1/jobs/:id       → TrackingResult
 *   GET  /v1/jobs/:id/status        → TrackingResult
 *   GET  /v1/jobs/:id/audit-trail   → KeeperHubAuditEntry[]
 *
 * Usage: node server.mjs
 * Set KEEPERHUB_API_URL=http://localhost:4001 in apps/backend/.env
 */

import http from "http";
import crypto from "crypto";

const PORT = 4001;
const API_KEY = process.env.MOCK_API_KEY ?? null; // optional auth check

// In-memory job store: jobId → TrackingResult
const jobs = new Map();

// ── Helpers ──────────────────────────────────────────────────────────────────

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(json),
  });
  res.end(json);
}

function badRequest(res, message) {
  send(res, 400, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function log(method, path, status) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${method} ${path} → ${status}`);
}

// ── Route Handlers ────────────────────────────────────────────────────────────

/**
 * POST /v1/simulate
 * Always returns a successful simulation so the pipeline can proceed.
 * Change `success: false` and set `revertReason` to test failure paths.
 */
async function handleSimulate(req, res) {
  const body = await readBody(req);

  if (!body.tx || !body.chainId) {
    return badRequest(res, "Missing required fields: tx, chainId");
  }

  console.log(
    `  → simulating tx to ${body.tx.to} on chain ${body.chainId} (workflow: ${body.workflowId})`
  );

  const result = {
    success: true,
    revertReason: null,
    simulatedGasUsed: "142000",
    stateChanges: [
      {
        address: body.tx.to,
        kind: "STORAGE_WRITE",
        slot: "0x0000000000000000000000000000000000000000000000000000000000000001",
        before: "0x0000000000000000000000000000000000000000000000000000000000000000",
        after:  "0x0000000000000000000000000000000000000000000000000000000000000001",
      },
    ],
    raw: { mockServer: true },
  };

  send(res, 200, result);
}

/**
 * POST /v1/estimate-gas
 */
async function handleEstimateGas(req, res) {
  const body = await readBody(req);

  if (!body.tx || !body.chainId) {
    return badRequest(res, "Missing required fields: tx, chainId");
  }

  console.log(`  → estimating gas on chain ${body.chainId}`);

  const result = {
    gasLimit: "180000",
    maxFeePerGas: "15000000000",        // 15 gwei
    maxPriorityFeePerGas: "1000000000", // 1 gwei
    estimatedCostWei: "2700000000000000",  // 0.0027 ETH
    estimatedCostNative: "0.0027",
  };

  send(res, 200, result);
}

/**
 * POST /v1/submit
 */
async function handleSubmit(req, res) {
  const body = await readBody(req);

  if (!body.tx || !body.chainId || !body.executionId) {
    return badRequest(res, "Missing required fields: tx, chainId, executionId");
  }

  // Idempotency: reuse existing job if same idempotencyKey
  if (body.idempotencyKey) {
    for (const [jobId, job] of jobs) {
      if (job._idempotencyKey === body.idempotencyKey) {
        console.log(`  → idempotent resubmit, returning existing job ${jobId}`);
        send(res, 200, {
          keeperHubJobId: jobId,
          transactionHash: job.transactionHash,
          status: job.status,
        });
        return;
      }
    }
  }

  const jobId = `mock-job-${crypto.randomUUID()}`;
  const txHash = `0x${crypto.randomBytes(32).toString("hex")}`;

  // Store job — starts as SUBMITTED, transitions to CONFIRMED after 5s
  jobs.set(jobId, {
    keeperHubJobId: jobId,
    transactionHash: txHash,
    status: "SUBMITTED",
    blockNumber: null,
    gasUsed: null,
    effectiveGasPrice: null,
    errorMessage: null,
    confirmedAt: null,
    _idempotencyKey: body.idempotencyKey ?? null,
    _submittedAt: Date.now(),
  });

  console.log(`  → submitted job ${jobId}, tx ${txHash}`);

  // Auto-confirm after 5 seconds (simulates on-chain confirmation)
  setTimeout(() => {
    const job = jobs.get(jobId);
    if (job && job.status === "SUBMITTED") {
      job.status = "CONFIRMED";
      job.blockNumber = Math.floor(Math.random() * 1_000_000) + 20_000_000;
      job.gasUsed = "142000";
      job.effectiveGasPrice = "12000000000";
      job.confirmedAt = new Date().toISOString();
      console.log(`[mock] job ${jobId} auto-confirmed at block ${job.blockNumber}`);
    }
  }, 5_000);

  send(res, 200, {
    keeperHubJobId: jobId,
    transactionHash: txHash,
    status: "SUBMITTED",
  });
}

/**
 * GET /v1/jobs/:id  and  GET /v1/jobs/:id/status
 */
function handleTrack(req, res, jobId) {
  const job = jobs.get(jobId);

  if (!job) {
    // Return SUBMITTED for unknown jobs so the tracker doesn't crash
    console.log(`  → unknown job ${jobId}, returning SUBMITTED`);
    send(res, 200, {
      keeperHubJobId: jobId,
      transactionHash: null,
      status: "SUBMITTED",
      blockNumber: null,
      gasUsed: null,
      effectiveGasPrice: null,
      errorMessage: null,
      confirmedAt: null,
    });
    return;
  }

  console.log(`  → tracking job ${jobId}: ${job.status}`);

  const { _idempotencyKey, _submittedAt, ...trackingResult } = job;
  send(res, 200, trackingResult);
}

/**
 * GET /v1/jobs/:id/audit-trail
 */
function handleAuditTrail(req, res, jobId) {
  const job = jobs.get(jobId);
  const now = new Date().toISOString();

  const trail = [
    { timestamp: now, stage: "RECEIVED", message: "Transaction received by mock server", metadata: { jobId } },
    { timestamp: now, stage: "SIMULATED", message: "Simulation passed", metadata: { simulatedGasUsed: "142000" } },
    { timestamp: now, stage: "SUBMITTED", message: "Transaction submitted to mempool", metadata: { txHash: job?.transactionHash ?? "unknown" } },
  ];

  if (job?.status === "CONFIRMED") {
    trail.push({
      timestamp: job.confirmedAt ?? now,
      stage: "CONFIRMED",
      message: "Transaction confirmed on-chain",
      metadata: { blockNumber: job.blockNumber, gasUsed: job.gasUsed },
    });
  }

  send(res, 200, trail);
}

// ── Router ────────────────────────────────────────────────────────────────────

const router = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  // Optional API key check
  if (API_KEY) {
    const auth = req.headers["authorization"] ?? "";
    if (auth !== `Bearer ${API_KEY}`) {
      log(method, path, 401);
      send(res, 401, { error: "Unauthorized" });
      return;
    }
  }

  try {
    // POST /v1/simulate
    if (method === "POST" && path === "/v1/simulate") {
      log(method, path, 200);
      await handleSimulate(req, res);

    // POST /v1/estimate-gas
    } else if (method === "POST" && path === "/v1/estimate-gas") {
      log(method, path, 200);
      await handleEstimateGas(req, res);

    // POST /v1/submit
    } else if (method === "POST" && path === "/v1/submit") {
      log(method, path, 200);
      await handleSubmit(req, res);

    // GET /v1/jobs/:id/audit-trail
    } else if (method === "GET" && path.match(/^\/v1\/jobs\/[^/]+\/audit-trail$/)) {
      const jobId = path.split("/")[3];
      log(method, path, 200);
      handleAuditTrail(req, res, jobId);

    // GET /v1/jobs/:id/status
    } else if (method === "GET" && path.match(/^\/v1\/jobs\/[^/]+\/status$/)) {
      const jobId = path.split("/")[3];
      log(method, path, 200);
      handleTrack(req, res, jobId);

    // GET /v1/jobs/:id
    } else if (method === "GET" && path.match(/^\/v1\/jobs\/[^/]+$/)) {
      const jobId = path.split("/")[3];
      log(method, path, 200);
      handleTrack(req, res, jobId);

    // Health check
    } else if (method === "GET" && path === "/health") {
      send(res, 200, { status: "ok", jobs: jobs.size });

    } else {
      log(method, path, 404);
      send(res, 404, { error: `No route: ${method} ${path}` });
    }
  } catch (err) {
    console.error(`[error] ${method} ${path}:`, err.message);
    send(res, 500, { error: err.message });
  }
});

router.listen(PORT, () => {
  console.log(`\n🟢 KeeperHub Mock Server running on http://localhost:${PORT}`);
  console.log(`   POST /v1/simulate`);
  console.log(`   POST /v1/estimate-gas`);
  console.log(`   POST /v1/submit`);
  console.log(`   GET  /v1/jobs/:id`);
  console.log(`   GET  /v1/jobs/:id/status`);
  console.log(`   GET  /v1/jobs/:id/audit-trail`);
  console.log(`   GET  /health\n`);
  console.log(`   Jobs auto-confirm after 5 seconds.\n`);
});
