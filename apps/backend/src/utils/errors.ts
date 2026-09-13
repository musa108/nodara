export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
    isOperational?: boolean;
  }) {
    super(params.message);
    this.name = "AppError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
    this.isOperational = params.isOperational ?? true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super({
      statusCode: 404,
      code: "NOT_FOUND",
      message: id ? `${resource} with id "${id}" was not found` : `${resource} was not found`,
    });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ statusCode: 400, code: "VALIDATION_ERROR", message, details });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super({ statusCode: 401, code: "UNAUTHORIZED", message });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super({ statusCode: 403, code: "FORBIDDEN", message });
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ statusCode: 409, code: "CONFLICT", message, details });
    this.name = "ConflictError";
  }
}

export class UpstreamServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super({ statusCode: 502, code: "UPSTREAM_SERVICE_ERROR", message: `${service}: ${message}`, details });
    this.name = "UpstreamServiceError";
  }
}
