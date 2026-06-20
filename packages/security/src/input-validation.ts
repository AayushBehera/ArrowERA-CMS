/**
 * Input Validation Middleware for ArrowERA CMS
 * Provides Zod-based request validation for body, query, and URL parameters.
 */

import { z, ZodError } from 'zod';

export interface ValidationConfig {
  /** Whether to strip unknown properties from validated objects */
  stripUnknown?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
  /** Maximum payload size in bytes */
  maxPayloadSize?: number;
}

export interface ValidationResult {
  /** Whether validation passed */
  success: boolean;
  /** Validated and parsed data (if successful) */
  data?: unknown;
  /** Validation error details (if failed) */
  errors?: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  /** Field path (e.g. 'body.email', 'query.page') */
  field: string;
  /** Error message */
  message: string;
  /** Error code from Zod */
  code: string;
}

export type ValidationSource = 'body' | 'query' | 'params' | 'headers';

/**
 * Input validation service using Zod schemas
 */
export class InputValidator {
  private readonly config: Required<ValidationConfig>;

  constructor(config: ValidationConfig = {}) {
    this.config = {
      stripUnknown: config.stripUnknown ?? true,
      errorPrefix: config.errorPrefix ?? 'Validation failed',
      maxPayloadSize: config.maxPayloadSize ?? 10 * 1024 * 1024, // 10MB default
    };
  }

  /**
   * Validate data against a Zod schema
   */
  validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
    try {
      const parseOptions = this.config.stripUnknown
        ? {} // Zod strips unknown by default in strict/parse
        : {};

      const parsed = schema.parse(data);

      return { success: true, data: parsed };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: error.errors.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        };
      }

      return {
        success: false,
        errors: [
          {
            field: 'unknown',
            message: error instanceof Error ? error.message : 'Unknown validation error',
            code: 'unknown_error',
          },
        ],
      };
    }
  }

  /**
   * Create a validation middleware for a specific source and schema
   */
  createMiddleware<T>(
    source: ValidationSource,
    schema: z.ZodType<T, z.ZodTypeDef, any>,
  ) {
    const self = this;

    return function validationMiddleware(
      req: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        headers?: unknown;
      },
      res: {
        status?: (code: number) => { json: (body: unknown) => unknown };
      },
      next: () => void,
    ): void {
      const data = self.getSourceData(req, source);

      if (data === undefined) {
        if (res.status) {
          res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: `Request ${source} is required but was not provided`,
            status: 400,
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }

      const result = self.validate(schema, data);

      if (!result.success) {
        if (res.status) {
          res.status(400).json({
            code: 'VALIDATION_ERROR',
            message: self.config.errorPrefix,
            status: 400,
            timestamp: new Date().toISOString(),
            issues: result.errors,
          });
        }
        return;
      }

      // Attach validated data back to request
      self.setSourceData(req, source, result.data);

      next();
    };
  }

  /**
   * Safely validate and return parsed data (non-middleware usage)
   */
  validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
    const result = this.validate(schema, body);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.errors?.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
      );
    }
    return result.data as T;
  }

  /**
   * Validate query parameters
   */
  validateQuery<T>(schema: z.ZodSchema<T>, query: unknown): T {
    const result = this.validate(schema, query);
    if (!result.success) {
      throw new Error(
        `Query validation failed: ${result.errors?.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
      );
    }
    return result.data as T;
  }

  /**
   * Validate URL parameters
   */
  validateParams<T>(schema: z.ZodSchema<T>, params: unknown): T {
    const result = this.validate(schema, params);
    if (!result.success) {
      throw new Error(
        `Params validation failed: ${result.errors?.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
      );
    }
    return result.data as T;
  }

  /**
   * Extract data from request based on source
   */
  private getSourceData(
    req: { body?: unknown; query?: unknown; params?: unknown; headers?: unknown },
    source: ValidationSource,
  ): unknown {
    switch (source) {
      case 'body':
        return req.body;
      case 'query':
        return req.query;
      case 'params':
        return req.params;
      case 'headers':
        return req.headers;
      default:
        return undefined;
    }
  }

  /**
   * Set validated data back on request
   */
  private setSourceData(
    req: { body?: unknown; query?: unknown; params?: unknown; headers?: unknown },
    source: ValidationSource,
    data: unknown,
  ): void {
    switch (source) {
      case 'body':
        req.body = data;
        break;
      case 'query':
        req.query = data;
        break;
      case 'params':
        req.params = data;
        break;
      case 'headers':
        req.headers = data as Record<string, unknown>;
        break;
    }
  }
}

// Pre-built validation middleware factories

/**
 * Create body validation middleware
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return new InputValidator().createMiddleware('body', schema);
}

/**
 * Create query validation middleware
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return new InputValidator().createMiddleware('query', schema);
}

/**
 * Create URL params validation middleware
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return new InputValidator().createMiddleware('params', schema);
}

/**
 * Create headers validation middleware
 */
export function validateHeaders<T>(schema: z.ZodSchema<T>) {
  return new InputValidator().createMiddleware('headers', schema);
}
