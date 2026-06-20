/**
 * Global error handler middleware for ArrowERA CMS
 * Catches all unhandled errors and returns structured, safe error responses.
 * Environment-aware: hides stack traces in production.
 */

import { AppError } from './app-error';
import { ErrorCode, type ErrorResponse } from './error.types';
import { randomUUID } from 'node:crypto';

export interface ErrorHandlerOptions {
  /** Whether to include stack traces in error responses */
  includeStack?: boolean;
  /** Whether to log errors (defaults to true) */
  logErrors?: boolean;
  /** Custom logger function */
  logger?: (level: string, message: string, meta?: Record<string, unknown>) => void;
  /** Generate request IDs */
  generateRequestId?: () => string;
  /** Environment name */
  environment?: string;
}

/**
 * Create a global error handler middleware
 */
export function createErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    includeStack = false,
    logErrors = true,
    logger = defaultLogger,
    generateRequestId = defaultRequestIdGenerator,
    environment = 'production',
  } = options;

  const isProduction = environment === 'production';

  /**
   * Global error handler function
   */
  function handleError(error: unknown, request?: Record<string, unknown>): ErrorResponse {
    const requestId = generateRequestId();

    // Determine the appropriate error
    const appError = normalizeError(error);
    const stack = isProduction ? undefined : (error instanceof Error ? error.stack : undefined);

    const response = appError.toResponse(requestId);

    // Log the error
    if (logErrors) {
      const logLevel = appError.status >= 500 ? 'error' : 'warn';
      logger(logLevel, appError.message, {
        code: appError.code,
        status: appError.status,
        requestId,
        stack,
        request: sanitizeRequest(request),
      });
    }

    return response;
  }

  /**
   * Express/Fastify-compatible error handling middleware
   */
  function middleware(
    error: unknown,
    _req?: unknown,
    res?: { status: (code: number) => { json: (body: unknown) => unknown }; statusCode?: number },
    _next?: () => void,
  ): unknown {
    const requestId = generateRequestId();
    const appError = normalizeError(error);

    // Log the error
    if (logErrors && !isProduction) {
      const stack = error instanceof Error ? error.stack : undefined;
      const logLevel = appError.status >= 500 ? 'error' : 'warn';
      logger(logLevel, appError.message, {
        code: appError.code,
        status: appError.status,
        requestId,
        stack,
      });
    }

    const response = appError.toResponse(requestId);

    // If response object is available (Express-style), send JSON response
    if (res && typeof res.status === 'function') {
      if (res.statusCode !== undefined) {
        (res as Record<string, unknown>).statusCode = appError.status;
      }
      return res.status(appError.status).json(response);
    }

    // Return plain object for logging or custom handling
    return response;
  }

  return {
    handleError,
    middleware,
    createRequestId: generateRequestId,
  };
}

/**
 * Normalize any thrown value into an AppError
 */
function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(error.message, {
      code: ErrorCode.INTERNAL_ERROR,
      status: 500,
      cause: error,
    });
  }

  // Non-Error thrown value
  if (typeof error === 'string') {
    return new AppError(error, {
      code: ErrorCode.INTERNAL_ERROR,
      status: 500,
    });
  }

  // Unknown type
  return new AppError('An unexpected error occurred', {
    code: ErrorCode.INTERNAL_ERROR,
    status: 500,
    details: { originalError: String(error) },
  });
}

/**
 * Sanitize request data to remove sensitive information before logging
 */
function sanitizeRequest(request?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!request) return undefined;

  const sensitiveKeys = ['password', 'secret', 'token', 'authorization', 'cookie', 'apiKey'];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(request)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Default logger that outputs to console
 */
function defaultLogger(level: string, message: string, meta?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

  switch (level) {
    case 'error':
      console.error(`[${timestamp}] [ERROR] ${message}${metaStr}`);
      break;
    case 'warn':
      console.warn(`[${timestamp}] [WARN] ${message}${metaStr}`);
      break;
    default:
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
  }
}

/**
 * Default request ID generator using crypto
 */
function defaultRequestIdGenerator(): string {
  return randomUUID();
}

// Export pre-configured handlers
export const errorHandler = createErrorHandler();
export const developmentErrorHandler = createErrorHandler({
  includeStack: true,
  environment: 'development',
});
export const productionErrorHandler = createErrorHandler({
  includeStack: false,
  environment: 'production',
});
