/**
 * AppError — Custom application error class for ArrowERA CMS
 * Provides structured error codes, HTTP status mapping, and safe serialization.
 */

import { ErrorCode, ERROR_CODE_TO_HTTP_STATUS, type ErrorResponse, type ValidationIssue } from './error.types';

export interface AppErrorOptions {
  /** Error code from ErrorCode enum */
  code?: ErrorCode;
  /** HTTP status code override */
  status?: number;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Validation issues for validation errors */
  issues?: ValidationIssue[];
  /** Documentation URL for this error type */
  docsUrl?: string;
  /** Original error that caused this */
  cause?: Error;
}

export class AppError extends Error {
  /** Machine-readable error code */
  public readonly code: ErrorCode;
  /** HTTP status code */
  public readonly status: number;
  /** Additional error details (never exposed in production unless safe) */
  public readonly details?: Record<string, unknown>;
  /** Validation issues */
  public readonly issues?: ValidationIssue[];
  /** Documentation URL */
  public readonly docsUrl?: string;
  /** Whether this is an operational error (expected) vs programmer error (bug) */
  public readonly isOperational: boolean;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';

    this.code = options.code || ErrorCode.INTERNAL_ERROR;
    this.status = options.status || ERROR_CODE_TO_HTTP_STATUS[this.code] || 500;
    this.details = options.details;
    this.issues = options.issues;
    this.docsUrl = options.docsUrl;
    this.isOperational = true;

    // Capture stack trace using V8 API (safe fallback if unavailable)
    const ErrorWithCapture = Error as typeof Error & { captureStackTrace?: (target: object, constructorOpt?: Function) => void };
    if (ErrorWithCapture.captureStackTrace) {
      ErrorWithCapture.captureStackTrace(this, AppError);
    }

    // Preserve original cause
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Create a serialized error response safe for client consumption
   */
  toResponse(requestId?: string, includeStack = false): ErrorResponse {
    const response: ErrorResponse = {
      code: this.code,
      message: this.message,
      status: this.status,
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (this.issues && this.issues.length > 0) {
      response.issues = this.issues;
    }

    if (this.details) {
      response.details = this.details;
    }

    if (this.docsUrl) {
      response.docsUrl = this.docsUrl;
    }

    return response;
  }

  // Factory methods for common error types

  static validation(message: string, issues?: ValidationIssue[]): AppError {
    return new AppError(message, {
      code: ErrorCode.VALIDATION_ERROR,
      status: 400,
      issues,
    });
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(message, {
      code: ErrorCode.UNAUTHORIZED,
      status: 401,
    });
  }

  static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError(message, {
      code: ErrorCode.FORBIDDEN,
      status: 403,
    });
  }

  static notFound(resource = 'Resource', id?: string): AppError {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    return new AppError(message, {
      code: ErrorCode.NOT_FOUND,
      status: 404,
    });
  }

  static conflict(message: string): AppError {
    return new AppError(message, {
      code: ErrorCode.CONFLICT,
      status: 409,
    });
  }

  static tooManyRequests(message = 'Too many requests', retryAfter?: number): AppError {
    return new AppError(message, {
      code: ErrorCode.RATE_LIMITED,
      status: 429,
      details: retryAfter ? { retryAfter } : undefined,
    });
  }

  static internal(message = 'Internal server error', cause?: Error): AppError {
    return new AppError(message, {
      code: ErrorCode.INTERNAL_ERROR,
      status: 500,
      cause,
    });
  }

  static database(message: string, cause?: Error): AppError {
    return new AppError(message, {
      code: ErrorCode.DATABASE_ERROR,
      status: 500,
      cause,
    });
  }

  static externalService(message: string, cause?: Error): AppError {
    return new AppError(message, {
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      status: 502,
      cause,
    });
  }
}
