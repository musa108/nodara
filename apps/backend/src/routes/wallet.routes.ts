import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as walletController from "../controllers/wallet.controller.js";

export const walletRouter = Router();
walletRouter.use(requireAuth);

walletRouter.get("/", asyncHandler(walletController.listWallets));
walletRouter.patch("/:id/cold-wallet", asyncHandler(walletController.updateColdWallet));
