import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { mutationRateLimiter } from "../middleware/rateLimit.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as authController from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.get("/nonce", asyncHandler(authController.getNonce));
authRouter.post("/verify", mutationRateLimiter, asyncHandler(authController.verify));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
authRouter.post("/logout", requireAuth, asyncHandler(authController.logout));
