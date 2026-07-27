import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { mutationRateLimiter } from "../middleware/rateLimit.middleware.js";
import * as workflowController from "../controllers/workflow.controller.js";

export const workflowRouter = Router();
workflowRouter.use(requireAuth);

workflowRouter.get("/", asyncHandler(workflowController.listWorkflows));
workflowRouter.post("/", mutationRateLimiter, asyncHandler(workflowController.createWorkflow));
workflowRouter.patch("/:id", mutationRateLimiter, asyncHandler(workflowController.updateWorkflow));
workflowRouter.patch("/:id/enabled", mutationRateLimiter, asyncHandler(workflowController.setWorkflowEnabled));
workflowRouter.delete("/:id", asyncHandler(workflowController.deleteWorkflow));
