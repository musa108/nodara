import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as auditLogController from "../controllers/auditLog.controller.js";

export const auditLogRouter = Router();
auditLogRouter.use(requireAuth);
auditLogRouter.get("/", asyncHandler(auditLogController.listAuditLogs));
