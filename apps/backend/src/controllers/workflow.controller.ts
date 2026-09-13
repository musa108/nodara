import type { Request, Response } from "express";
import { workflowService } from "../services/workflow.service.js";
import { walletService } from "../services/wallet.service.js";
import { CreateWorkflowSchema, UpdateWorkflowSchema } from "@nodara/shared";
import { WorkflowIdParamSchema, SetEnabledSchema } from "../validators/workflow.validator.js";

export async function listWorkflows(req: Request, res: Response): Promise<void> {
  const wallets = await walletService.listForUser(req.user!.userId);
  const workflows = await workflowService.listForUser(req.user!.userId, wallets.map((w) => w.id));
  res.status(200).json({ success: true, data: workflows });
}

export async function createWorkflow(req: Request, res: Response): Promise<void> {
  const input = CreateWorkflowSchema.parse(req.body);
  const workflow = await workflowService.create(req.user!.userId, input);
  res.status(201).json({ success: true, data: workflow });
}

export async function updateWorkflow(req: Request, res: Response): Promise<void> {
  const { id } = WorkflowIdParamSchema.parse(req.params);
  const input = UpdateWorkflowSchema.parse({ ...req.body, id });
  const workflow = await workflowService.update(req.user!.userId, input);
  res.status(200).json({ success: true, data: workflow });
}

export async function setWorkflowEnabled(req: Request, res: Response): Promise<void> {
  const { id } = WorkflowIdParamSchema.parse(req.params);
  const { enabled } = SetEnabledSchema.parse(req.body);
  const workflow = await workflowService.setEnabled(req.user!.userId, id, enabled);
  res.status(200).json({ success: true, data: workflow });
}

export async function deleteWorkflow(req: Request, res: Response): Promise<void> {
  const { id } = WorkflowIdParamSchema.parse(req.params);
  await workflowService.remove(req.user!.userId, id);
  res.status(204).send();
}
