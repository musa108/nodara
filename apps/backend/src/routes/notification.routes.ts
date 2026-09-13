import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as notificationController from "../controllers/notification.controller.js";

export const notificationRouter = Router();
notificationRouter.use(requireAuth);

notificationRouter.get("/", asyncHandler(notificationController.listNotifications));
notificationRouter.patch("/:id/read", asyncHandler(notificationController.markNotificationRead));
