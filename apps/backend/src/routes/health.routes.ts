import { Router } from "express";
import { getLiveness, getReadiness } from "../controllers/health.controller.js";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";

export const healthRouter = Router();

healthRouter.get("/health", getLiveness);
healthRouter.get("/health/ready", asyncHandler(getReadiness));
