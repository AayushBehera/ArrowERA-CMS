import { describe, it, expect, beforeEach } from 'vitest';
import { ArrowERALogger, getLogger, createRequestLoggingMiddleware } from '../src/index';

describe('ArrowERALogger', () => {
  let logger: ArrowERALogger;

  beforeEach(() => {
    logger = new ArrowERALogger({
      level: 'debug',
      service: 'test-service',
      environment: 'test',
    });
  });

  describe('constructor', () => {
    it('should create a logger instance', () => {
      expect(logger).toBeInstanceOf(ArrowERALogger);
    });
  });

  describe('generateRequestId', () => {
    it('should generate a UUID v4 format', () => {
      const id = ArrowERALogger.generateRequestId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should generate unique IDs', () => {
      const id1 = ArrowERALogger.generateRequestId();
      const id2 = ArrowERALogger.generateRequestId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('forRequest', () => {
    it('should create a child logger for a request', () => {
      const requestLogger = logger.forRequest('req-123');
      expect(requestLogger).toBeInstanceOf(ArrowERALogger);
    });
  });

  describe('child', () => {
    it('should create a child logger with additional context', () => {
      const child = logger.child({ module: 'auth' });
      expect(child).toBeInstanceOf(ArrowERALogger);
    });
  });

  describe('log methods', () => {
    it('should have debug method', () => {
      expect(() => logger.debug('test message')).not.toThrow();
    });

    it('should have info method', () => {
      expect(() => logger.info('test message')).not.toThrow();
    });

    it('should have warn method', () => {
      expect(() => logger.warn('test message')).not.toThrow();
    });

    it('should have error method', () => {
      expect(() => logger.error('test error', new Error('Test'))).not.toThrow();
    });

    it('should have error method without Error object', () => {
      expect(() => logger.error('test error')).not.toThrow();
    });

    it('should have fatal method', () => {
      expect(() => logger.fatal('fatal error', new Error('Critical'))).not.toThrow();
    });

    it('should have trace method', () => {
      expect(() => logger.trace('trace message')).not.toThrow();
    });
  });

  describe('measure', () => {
    it('should measure synchronous execution time', () => {
      const result = logger.measure('sync-op', () => {
        return 42;
      });
      expect(result).toBe(42);
    });

    it('should measure async execution time', async () => {
      const result = await logger.measure('async-op', async () => {
        return 'done';
      });
      expect(result).toBe('done');
    });

    it('should propagate errors from measured functions', async () => {
      await expect(
        logger.measure('failing-op', async () => {
          throw new Error('Operation failed');
        }),
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('audit', () => {
    it('should log audit entries', () => {
      expect(() =>
        logger.audit({
          service: 'auth',
          action: 'user.login',
          userId: 'user-1',
          requestId: 'req-123',
          success: true,
        }),
      ).not.toThrow();
    });

    it('should log failed audit entries', () => {
      expect(() =>
        logger.audit({
          service: 'auth',
          action: 'user.login',
          userId: 'user-2',
          requestId: 'req-456',
          success: false,
          errorCode: 'INVALID_CREDENTIALS',
          errorMessage: 'Invalid password',
        }),
      ).not.toThrow();
    });
  });

  describe('setDefaultContext', () => {
    it('should set default context for all subsequent logs', () => {
      logger.setDefaultContext({ userId: 'user-1' });
      expect(() => logger.info('test')).not.toThrow();
    });
  });
});

describe('getLogger', () => {
  it('should return a logger instance', () => {
    const log = getLogger({
      level: 'info',
      service: 'test',
      environment: 'test',
    });
    expect(log).toBeInstanceOf(ArrowERALogger);
  });
});

describe('createRequestLoggingMiddleware', () => {
  it('should return a middleware function', () => {
    const middleware = createRequestLoggingMiddleware();
    expect(typeof middleware).toBe('function');
  });

  it('should not throw when called with mock request/response', () => {
    const middleware = createRequestLoggingMiddleware();
    const req = {
      method: 'GET',
      path: '/api/test',
      query: {},
      headers: {},
    };
    const res: { headers: Record<string, string>; statusCode?: number; setHeader: (name: string, value: string) => void; get: (name: string) => string | undefined; on: (event: string, fn: () => void) => void } = {
      headers: {},
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      get(name: string) {
        return this.headers[name];
      },
      on(_event: string, fn: () => void) {
        // Simulate finish event immediately
        fn();
      },
    };
    let nextCalled = false;

    expect(() => {
      middleware(req, res, () => {
        nextCalled = true;
      });
    }).not.toThrow();

    expect(nextCalled).toBe(true);
  });
});
