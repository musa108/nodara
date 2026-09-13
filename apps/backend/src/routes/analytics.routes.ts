import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as analyticsController from "../controllers/analytics.controller.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.get("/summary", asyncHandler(analyticsController.getSummary));
