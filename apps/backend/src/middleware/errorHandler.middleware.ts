import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { createModuleLogger } from "../utils/logger.js";
import type { ApiError } from "@nodara/shared";

const log = createModuleLogger("error-handler");

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiError = {
    success: false,
    error: { code: "ROUTE_NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
  };
  res.status(404).json(body);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const body: ApiError = {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: err.flatten() },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      log.error({ err, path: req.path }, err.message);
    }
    const body: ApiError = { success: false, error: { code: err.code, message: err.message, details: err.details } };
    res.status(err.statusCode).json(body);
    return;
  }

  log.error({ err, path: req.path }, "Unhandled error");
  const body: ApiError = {
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." },
  };
  res.status(500).json(body);
}

/** Wraps async controller handlers so rejected promises reach errorHandler instead of crashing the process. */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
