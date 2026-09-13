import type { Request, Response } from "express";
import { executionService } from "../services/execution.service.js";
import { workflowService } from "../services/workflow.service.js";
import { walletService } from "../services/wallet.service.js";
import { ManualTriggerParamSchema, ExecutionListQuerySchema } from "../validators/execution.validator.js";

export async function listExecutions(req: Request, res: Response): Promise<void> {
  const query = ExecutionListQuerySchema.parse(req.query);
  const wallets = await walletService.listForUser(req.user!.userId);
  // Workflow ownership is scoped through the user's wallets — listing
  // executions doesn't need each workflow individually re-validated here
  // since workflowRepository queries are already wallet-scoped.
  const workflows = await workflowService.listForUser(req.user!.userId, wallets.map((w) => w.id));
  const result = await executionService.listForWorkflows(workflows.map((w) => w.id), query);
  res.status(200).json({ success: true, data: result });
}

export async function triggerWorkflowManually(req: Request, res: Response): Promise<void> {
  const { workflowId } = ManualTriggerParamSchema.parse(req.params);
  const workflow = await workflowService.assertWorkflowOwnership(req.user!.userId, workflowId);
  const execution = await executionService.triggerManually(workflow);
  res.status(202).json({ success: true, data: executionService.toDTO(execution) });
}
