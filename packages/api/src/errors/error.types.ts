/**
 * Error code enumerations for ArrowERA CMS
 * Provides consistent error classification across the entire application.
 */

/**
 * Standard error codes used across ArrowERA CMS
 */
export enum ErrorCode {
  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_REQUIRED = 'MISSING_REQUIRED',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  MFA_REQUIRED = 'MFA_REQUIRED',

  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INSUFFICIENT_ROLE = 'INSUFFICIENT_ROLE',
  RATE_LIMITED = 'RATE_LIMITED',
  CSRF_INVALID = 'CSRF_INVALID',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  GONE = 'GONE',

  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  UNIQUE_VIOLATION = 'UNIQUE_VIOLATION',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  CONNECTION_FAILED = 'CONNECTION_FAILED',

  // Cache errors
  CACHE_ERROR = 'CACHE_ERROR',
  CACHE_MISS = 'CACHE_MISS',

  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  WEBHOOK_FAILED = 'WEBHOOK_FAILED',
}

/**
 * Mapping of error codes to HTTP status codes
 */
export const ERROR_CODE_TO_HTTP_STATUS: Record<string, number> = {
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.TIMEOUT]: 504,

  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.MISSING_REQUIRED]: 400,
  [ErrorCode.PAYLOAD_TOO_LARGE]: 413,

  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.MFA_REQUIRED]: 401,

  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.INSUFFICIENT_ROLE]: 403,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.CSRF_INVALID]: 403,

  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.RESOURCE_LOCKED]: 423,
  [ErrorCode.GONE]: 410,

  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.QUERY_FAILED]: 500,
  [ErrorCode.UNIQUE_VIOLATION]: 409,
  [ErrorCode.FOREIGN_KEY_VIOLATION]: 400,
  [ErrorCode.CONNECTION_FAILED]: 503,

  [ErrorCode.CACHE_ERROR]: 500,
  [ErrorCode.CACHE_MISS]: 404,

  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.UPSTREAM_ERROR]: 502,
  [ErrorCode.WEBHOOK_FAILED]: 502,
};

/**
 * Standard error response body
 */
export interface ErrorResponse {
  /** Machine-readable error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Unique request identifier for tracing */
  requestId?: string;
  /** Timestamp of the error */
  timestamp: string;
  /** Optional details for the error */
  details?: Record<string, unknown>;
  /** Optional array of validation issues */
  issues?: ValidationIssue[];
  /** Optional documentation URL for the error */
  docsUrl?: string;
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  /** Field path (e.g. 'body.email', 'params.id') */
  field: string;
  /** Validation error message */
  message: string;
  /** The error code from validation */
  code?: string;
}

/**
 * Options for error serialization
 */
export interface ErrorSerializationOptions {
  /** Whether to include stack traces (false in production) */
  includeStack?: boolean;
  /** Whether to include internal error details */
  includeInternalDetails?: boolean;
  /** Custom request ID for tracing */
  requestId?: string;
}
