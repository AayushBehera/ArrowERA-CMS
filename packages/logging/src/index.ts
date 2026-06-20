import pino, { Logger, LoggerOptions } from 'pino';
import { randomUUID } from 'crypto';

/**
 * Log levels for ArrowERA CMS
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'trace';

/**
 * Log context interface
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  action?: string;
  duration?: number;
  error?: Error;
  [key: string]: any;
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  timestamp: string;
  level: string;
  service: string;
  action: string;
  userId?: string;
  requestId: string;
  resource?: string;
  resourceType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  service: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  prettyPrint?: boolean;
  redactPaths?: string[];
}

/**
 * Redactable sensitive paths
 */
const DEFAULT_REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'body.password',
  'body.secret',
  'body.token',
  'body.authSecret',
  'authSecret',
  'password',
  'secret',
  'token',
  'apiKey',
  'accessKey',
  'secretKey'
];

/**
 * ArrowERA Logger - Enterprise structured logging with Pino
 */
export class ArrowERALogger {
  private logger: Logger;
  private config: LoggerConfig;
  private defaultContext: LogContext;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.defaultContext = { service: config.service };
    this.logger = this.createLogger();
  }

  /**
   * Create Pino logger instance
   */
  private createLogger(): Logger {
    const options: LoggerOptions = {
      level: this.config.level,
      base: {
        service: this.config.service,
        environment: this.config.environment
      },
      redact: {
        paths: this.config.redactPaths || DEFAULT_REDACT_PATHS,
        censor: '[REDACTED]'
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`
    };

    // Pretty print for development
    if (this.config.prettyPrint || this.config.environment === 'development') {
      options.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      };
    }

    return pino(options);
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): ArrowERALogger {
    const childLogger = new ArrowERALogger(this.config);
    childLogger.defaultContext = { ...this.defaultContext, ...context };
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }

  /**
   * Set default context for all logs
   */
  setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
    this.logger = this.logger.child(context);
  }

  /**
   * Generate correlation ID for request tracing
   */
  static generateRequestId(): string {
    return randomUUID();
  }

  /**
   * Create request-specific logger
   */
  forRequest(requestId: string, userId?: string): ArrowERALogger {
    return this.child({ requestId, userId });
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug({ ...this.defaultContext, ...context }, message);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.logger.info({ ...this.defaultContext, ...context }, message);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn({ ...this.defaultContext, ...context }, message);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? { ...this.defaultContext, ...context, error: { message: error.message, stack: error.stack, name: error.name } }
      : { ...this.defaultContext, ...context };
    
    this.logger.error(errorContext, message);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? { ...this.defaultContext, ...context, error: { message: error.message, stack: error.stack, name: error.name } }
      : { ...this.defaultContext, ...context };
    
    this.logger.fatal(errorContext, message);
  }

  /**
   * Log trace message
   */
  trace(message: string, context?: LogContext): void {
    this.logger.trace({ ...this.defaultContext, ...context }, message);
  }

  /**
   * Log audit event
   */
  audit(entry: Omit<AuditLogEntry, 'timestamp' | 'level'>): void {
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      level: 'info'
    };

    this.logger.info({
      ...this.defaultContext,
      audit: true,
      ...auditEntry
    }, `AUDIT: ${entry.action}`);
  }

  /**
   * Measure execution time
   */
  measure<T>(action: string, fn: () => Promise<T>): Promise<T>;
  measure<T>(action: string, fn: () => T): T;
  measure<T>(action: string, fn: () => T | Promise<T>): T | Promise<T> {
    const startTime = Date.now();
    const requestId = ArrowERALogger.generateRequestId();
    
    this.debug(`Starting ${action}`, { action, requestId });

    const result = fn();

    if (result instanceof Promise) {
      return result.then(resolved => {
        const duration = Date.now() - startTime;
        this.info(`Completed ${action}`, { action, requestId, duration, success: true });
        return resolved;
      }).catch(err => {
        const duration = Date.now() - startTime;
        this.error(`Failed ${action}`, err, { action, requestId, duration, success: false });
        throw err;
      });
    } else {
      const duration = Date.now() - startTime;
      this.info(`Completed ${action}`, { action, requestId, duration, success: true });
      return result;
    }
  }
}

/**
 * Default logger instance
 */
let defaultLogger: ArrowERALogger | null = null;

/**
 * Get or create default logger
 */
export function getLogger(config?: Partial<LoggerConfig>): ArrowERALogger {
  if (!defaultLogger) {
    const fullConfig: LoggerConfig = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      service: process.env.SERVICE_NAME || 'arrowera-cms',
      environment: (process.env.NODE_ENV as any) || 'development',
      prettyPrint: process.env.PRETTY_LOGS === 'true',
      ...config
    };
    
    defaultLogger = new ArrowERALogger(fullConfig);
  }
  
  return defaultLogger;
}

/**
 * Create middleware for Express/Fastify to add request logging
 */
export function createRequestLoggingMiddleware() {
  return (req: any, res: any, next: () => void) => {
    const logger = getLogger();
    const requestId = req.headers['x-request-id'] || ArrowERALogger.generateRequestId();
    const requestLogger = logger.forRequest(requestId);
    
    // Add requestId to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Attach logger to request
    req.logger = requestLogger;
    
    const startTime = Date.now();
    
    // Log request start
    requestLogger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      query: req.query,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for']
    });
    
    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      
      requestLogger[level](`${req.method} ${req.path} ${res.statusCode}`, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length')
      });
    });
    
    next();
  };
}

// Export default instance
export const logger = getLogger();
export default logger;
