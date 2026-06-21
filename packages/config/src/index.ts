import { z } from 'zod';

/**
 * Environment names supported by ArrowERA CMS
 */
export const EnvironmentNames = z.enum(['development', 'staging', 'production', 'test']);

export type EnvironmentName = z.infer<typeof EnvironmentNames>;

/**
 * Database configuration schema
 */
const DatabaseConfigSchema = z.object({
  url: z.string().url('DATABASE_URL must be a valid URL'),
  poolSize: z.number().int().positive().default(10),
  connectionTimeout: z.number().int().positive().default(5000),
});

/**
 * Authentication configuration schema
 */
const AuthConfigSchema = z.object({
  secret: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  sessionDuration: z.number().int().positive().default(86400000), // 24 hours
  refresh_token_duration: z.number().int().positive().default(604800000), // 7 days
});

/**
 * Redis configuration schema (optional)
 */
const RedisConfigSchema = z.object({
  url: z.string().url().optional(),
  host: z.string().optional(),
  port: z.number().int().optional(),
  password: z.string().optional(),
  db: z.number().int().default(0),
}).optional();

/**
 * Application configuration schema
 */
const AppConfigSchema = z.object({
  url: z.string().url('APP_URL must be a valid URL'),
  name: z.string().default('ArrowERA CMS'),
  environment: EnvironmentNames.default('development'),
  port: z.number().int().positive().default(3000),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/**
 * Security configuration schema
 */
const SecurityConfigSchema = z.object({
  csrfSecret: z.string().min(32).optional(),
  rateLimitWindowMs: z.number().int().positive().default(60000),
  rateLimitMaxRequests: z.number().int().positive().default(100),
  corsOrigins: z.array(z.string().url()).default([]),
});

/**
 * Storage configuration schema
 */
const StorageConfigSchema = z.object({
  provider: z.enum(['local', 's3', 'r2']).default('local'),
  s3Bucket: z.string().optional(),
  s3Region: z.string().optional(),
  s3AccessKeyId: z.string().optional(),
  s3SecretAccessKey: z.string().optional(),
  s3Endpoint: z.string().url().optional(),
});

/**
 * Complete environment configuration schema
 */
export const EnvSchema = z.object({
  NODE_ENV: EnvironmentNames.default('development'),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  
  // Optional configurations
  DATABASE_POOL_SIZE: z.string().transform(v => parseInt(v, 10)).default('10'),
  DATABASE_CONNECTION_TIMEOUT: z.string().transform(v => parseInt(v, 10)).default('5000'),
  SESSION_DURATION: z.string().transform(v => parseInt(v, 10)).optional(),
  REDIS_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.string().transform(v => parseInt(v, 10)).default('3000'),
  
  // Security
  CSRF_SECRET: z.string().min(32).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(v => parseInt(v, 10)).optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(v => parseInt(v, 10)).optional(),
  CORS_ORIGINS: z.string().transform(v => v ? v.split(',') : []).default(''),
  
  // Storage
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Configuration class with validation and defaults
 */
export class Config {
  private static instance: Config;
  private config: EnvConfig;

  private constructor() {
    this.config = this.loadAndValidate();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Load and validate environment variables
   */
  private loadAndValidate(): EnvConfig {
    try {
      const env = {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        APP_URL: process.env.APP_URL,
        DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE,
        DATABASE_CONNECTION_TIMEOUT: process.env.DATABASE_CONNECTION_TIMEOUT,
        SESSION_DURATION: process.env.SESSION_DURATION,
        REDIS_URL: process.env.REDIS_URL,
        LOG_LEVEL: process.env.LOG_LEVEL,
        PORT: process.env.PORT,
        CSRF_SECRET: process.env.CSRF_SECRET,
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
        RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
        CORS_ORIGINS: process.env.CORS_ORIGINS,
        STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
        S3_BUCKET: process.env.S3_BUCKET,
        S3_REGION: process.env.S3_REGION,
        S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
        S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
        S3_ENDPOINT: process.env.S3_ENDPOINT,
      };

      const result = EnvSchema.safeParse(env);

      if (!result.success) {
        console.error('❌ Environment validation failed:');
        result.error.errors.forEach((err) => {
          console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        console.error('\nPlease check your .env file against .env.example');
        process.exit(1);
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      process.exit(1);
    }
  }

  /**
   * Get configuration value
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  /**
   * Get database configuration
   */
  getDatabase() {
    return {
      url: this.config.DATABASE_URL,
      poolSize: this.config.DATABASE_POOL_SIZE,
      connectionTimeout: this.config.DATABASE_CONNECTION_TIMEOUT,
    };
  }

  /**
   * Get authentication configuration
   */
  getAuth() {
    return {
      secret: this.config.AUTH_SECRET,
      sessionDuration: parseInt(this.config.SESSION_DURATION?.toString() || '86400000', 10),
    };
  }

  /**
   * Get application configuration
   */
  getApp() {
    return {
      url: this.config.APP_URL,
      name: 'ArrowERA CMS',
      environment: this.config.NODE_ENV,
      port: this.config.PORT,
      logLevel: this.config.LOG_LEVEL,
    };
  }

  /**
   * Get security configuration
   */
  getSecurity() {
    return {
      csrfSecret: this.config.CSRF_SECRET,
      rateLimitWindowMs: this.config.RATE_LIMIT_WINDOW_MS || 60000,
      rateLimitMaxRequests: this.config.RATE_LIMIT_MAX_REQUESTS || 100,
      corsOrigins: this.config.CORS_ORIGINS,
    };
  }

  /**
   * Get storage configuration
   */
  getStorage() {
    return {
      provider: this.config.STORAGE_PROVIDER,
      s3: {
        bucket: this.config.S3_BUCKET,
        region: this.config.S3_REGION,
        accessKeyId: this.config.S3_ACCESS_KEY_ID,
        secretAccessKey: this.config.S3_SECRET_ACCESS_KEY,
        endpoint: this.config.S3_ENDPOINT,
      },
    };
  }

  /**
   * Get Redis configuration
   */
  getRedis() {
    if (!this.config.REDIS_URL) {
      return null;
    }
    return {
      url: this.config.REDIS_URL,
    };
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if running in test mode
   */
  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}

// Export singleton instance.
//
// Resolved lazily via a Proxy so that merely importing this module has no side
// effects: environment validation (which may call process.exit on failure) is
// deferred until the config is actually accessed. This keeps the module safe to
// import from tests and tooling that do not provide a full runtime environment.
export const config: Config = new Proxy({} as Config, {
  get(_target, prop) {
    const instance = Config.getInstance() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// Export for direct access
export default config;
