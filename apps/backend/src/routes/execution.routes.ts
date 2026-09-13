import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { mutationRateLimiter } from "../middleware/rateLimit.middleware.js";
import * as executionController from "../controllers/execution.controller.js";

export const executionRouter = Router();
executionRouter.use(requireAuth);

executionRouter.get("/", asyncHandler(executionController.listExecutions));
executionRouter.post("/workflows/:workflowId/trigger", mutationRateLimiter, asyncHandler(executionController.triggerWorkflowManually));
