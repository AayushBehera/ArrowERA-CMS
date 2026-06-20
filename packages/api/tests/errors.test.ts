import { describe, it, expect } from 'vitest';
import { AppError } from '../src/errors/app-error';
import { ErrorCode, ERROR_CODE_TO_HTTP_STATUS } from '../src/errors/error.types';
import { createErrorHandler, errorHandler, developmentErrorHandler, productionErrorHandler } from '../src/errors/error-handler';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an AppError with default code', () => {
      const error = new AppError('Something went wrong');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.status).toBe(500);
      expect(error.name).toBe('AppError');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom error code', () => {
      const error = new AppError('Not found', {
        code: ErrorCode.NOT_FOUND,
        status: 404,
      });
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.status).toBe(404);
    });

    it('should accept custom status override', () => {
      const error = new AppError('Validation failed', {
        code: ErrorCode.VALIDATION_ERROR,
        status: 422,
      });
      expect(error.status).toBe(422);
    });

    it('should accept details object', () => {
      const error = new AppError('Error with details', {
        details: { field: 'email', reason: 'invalid' },
      });
      expect(error.details).toEqual({ field: 'email', reason: 'invalid' });
    });

    it('should accept validation issues', () => {
      const issues = [{ field: 'email', message: 'Invalid email' }];
      const error = new AppError('Validation error', {
        code: ErrorCode.VALIDATION_ERROR,
        issues,
      });
      expect(error.issues).toEqual(issues);
    });

    it('should accept documentation URL', () => {
      const error = new AppError('Error', {
        docsUrl: 'https://docs.arrowera.com/errors/validation',
      });
      expect(error.docsUrl).toBe('https://docs.arrowera.com/errors/validation');
    });

    it('should accept cause error', () => {
      const cause = new Error('Original error');
      const error = new AppError('Wrapped error', { cause });
      expect(error.cause).toBe(cause);
    });
  });

  describe('toResponse', () => {
    it('should serialize to ErrorResponse format', () => {
      const error = new AppError('Not found', {
        code: ErrorCode.NOT_FOUND,
        status: 404,
      });
      const response = error.toResponse('req-123');
      expect(response.code).toBe(ErrorCode.NOT_FOUND);
      expect(response.message).toBe('Not found');
      expect(response.status).toBe(404);
      expect(response.requestId).toBe('req-123');
      expect(response.timestamp).toBeDefined();
    });

    it('should include issues in response', () => {
      const issues = [{ field: 'name', message: 'Required' }];
      const error = new AppError('Validation', {
        code: ErrorCode.VALIDATION_ERROR,
        issues,
      });
      const response = error.toResponse();
      expect(response.issues).toEqual(issues);
    });

    it('should include details in response', () => {
      const error = new AppError('Error', {
        details: { debug: 'info' },
      });
      const response = error.toResponse();
      expect(response.details).toEqual({ debug: 'info' });
    });

    it('should include docsUrl in response when provided', () => {
      const error = new AppError('Error', {
        docsUrl: 'https://docs.example.com',
      });
      const response = error.toResponse();
      expect(response.docsUrl).toBe('https://docs.example.com');
    });
  });

  describe('factory methods', () => {
    it('should create validation error', () => {
      const error = AppError.validation('Invalid input');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.status).toBe(400);
    });

    it('should create unauthorized error', () => {
      const error = AppError.unauthorized();
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.status).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should create forbidden error', () => {
      const error = AppError.forbidden();
      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.status).toBe(403);
    });

    it('should create not found error', () => {
      const error = AppError.notFound('User', '123');
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.status).toBe(404);
      expect(error.message).toContain('User');
      expect(error.message).toContain('123');
    });

    it('should create not found error without ID', () => {
      const error = AppError.notFound('Product');
      expect(error.message).toBe('Product not found');
    });

    it('should create conflict error', () => {
      const error = AppError.conflict('Already exists');
      expect(error.code).toBe(ErrorCode.CONFLICT);
      expect(error.status).toBe(409);
    });

    it('should create too many requests error', () => {
      const error = AppError.tooManyRequests('Rate limited', 60);
      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
      expect(error.status).toBe(429);
      expect(error.details).toEqual({ retryAfter: 60 });
    });

    it('should create internal error', () => {
      const cause = new Error('DB connection lost');
      const error = AppError.internal('Something broke', cause);
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.status).toBe(500);
      expect(error.cause).toBe(cause);
    });

    it('should create database error', () => {
      const error = AppError.database('Query failed');
      expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.status).toBe(500);
    });

    it('should create external service error', () => {
      const error = AppError.externalService('API timeout');
      expect(error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR);
      expect(error.status).toBe(502);
    });
  });
});

describe('ErrorCode', () => {
  it('should have HTTP status mapping for all codes', () => {
    const codes = Object.values(ErrorCode);
    for (const code of codes) {
      expect(ERROR_CODE_TO_HTTP_STATUS[code]).toBeDefined();
    }
  });

  it('should have correct status codes for common errors', () => {
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.NOT_FOUND]).toBe(404);
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.UNAUTHORIZED]).toBe(401);
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.FORBIDDEN]).toBe(403);
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.VALIDATION_ERROR]).toBe(400);
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.CONFLICT]).toBe(409);
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.RATE_LIMITED]).toBe(429);
    expect(ERROR_CODE_TO_HTTP_STATUS[ErrorCode.INTERNAL_ERROR]).toBe(500);
  });
});

describe('createErrorHandler', () => {
  describe('handleError', () => {
    it('should handle AppError', () => {
      const handler = createErrorHandler({ environment: 'test' });
      const error = AppError.notFound('User', 'abc');
      const response = handler.handleError(error);
      expect(response.code).toBe(ErrorCode.NOT_FOUND);
      expect(response.status).toBe(404);
      expect(response.requestId).toBeDefined();
    });

    it('should handle standard Error', () => {
      const handler = createErrorHandler({ environment: 'test' });
      const error = new Error('Something broke');
      const response = handler.handleError(error);
      expect(response.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.status).toBe(500);
    });

    it('should handle string errors', () => {
      const handler = createErrorHandler({ environment: 'test' });
      const response = handler.handleError('Just a string error');
      expect(response.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.status).toBe(500);
    });

    it('should handle unknown error types', () => {
      const handler = createErrorHandler({ environment: 'test' });
      const response = handler.handleError(42);
      expect(response.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.status).toBe(500);
    });
  });

  describe('middleware', () => {
    it('should send JSON response for AppError', () => {
      const handler = createErrorHandler({ environment: 'test' });
      const error = AppError.validation('Invalid');
      let responseBody: unknown;
      let statusCode: number;

      const res = {
        statusCode: 200,
        status(code: number) {
          statusCode = code;
          return {
            json(body: unknown) {
              responseBody = body;
              return body;
            },
          };
        },
      };

      handler.middleware(error, undefined, res);
      const body = responseBody as Record<string, unknown>;
      expect(body.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(body.status).toBe(400);
    });

    it('should return plain object when no response object available', () => {
      const handler = createErrorHandler({ environment: 'test' });
      const error = AppError.unauthorized();
      const result = handler.middleware(error);
      expect(result).toBeDefined();
      expect((result as Record<string, unknown>).code).toBe(ErrorCode.UNAUTHORIZED);
    });
  });
});

describe('default error handlers', () => {
  it('should export default error handler', () => {
    expect(errorHandler).toBeDefined();
    expect(developmentErrorHandler).toBeDefined();
    expect(productionErrorHandler).toBeDefined();
  });
});
