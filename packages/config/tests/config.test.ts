import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { Config, EnvSchema, EnvironmentNames } from '../src/index';

describe('Config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('EnvSchema validation', () => {
    it('should validate a complete valid env configuration', () => {
      const validEnv = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
      };

      const result = EnvSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
    });

    it('should apply default values for optional fields', () => {
      const minimalEnv = {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'https://arrowera.com',
      };

      const result = EnvSchema.safeParse(minimalEnv);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.DATABASE_POOL_SIZE).toBe(10);
        expect(result.data.DATABASE_CONNECTION_TIMEOUT).toBe(5000);
        expect(result.data.LOG_LEVEL).toBe('info');
        expect(result.data.PORT).toBe(3000);
        expect(result.data.STORAGE_PROVIDER).toBe('local');
      }
    });

    it('should reject invalid DATABASE_URL', () => {
      const invalidEnv = {
        NODE_ENV: 'development',
        DATABASE_URL: 'not-a-url',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
      };

      const result = EnvSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });

    it('should reject short AUTH_SECRET', () => {
      const invalidEnv = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'short',
        APP_URL: 'http://localhost:3000',
      };

      const result = EnvSchema.safeParse(invalidEnv);
      expect(result.success).toBe(false);
    });

    it('should transform string numbers to integers', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
        PORT: '8080',
        DATABASE_POOL_SIZE: '25',
      };

      const result = EnvSchema.safeParse(env);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.PORT).toBe(8080);
        expect(result.data.DATABASE_POOL_SIZE).toBe(25);
        expect(typeof result.data.PORT).toBe('number');
      }
    });

    it('should handle CORS_ORIGINS comma-separated string', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
        CORS_ORIGINS: 'https://app1.com,https://app2.com',
      };

      const result = EnvSchema.safeParse(env);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.CORS_ORIGINS).toEqual(['https://app1.com', 'https://app2.com']);
      }
    });

    it('should default CORS_ORIGINS to empty array when empty string', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
        CORS_ORIGINS: '',
      };

      const result = EnvSchema.safeParse(env);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.CORS_ORIGINS).toEqual([]);
      }
    });

    it('should validate environment names', () => {
      const validEnvs = ['development', 'staging', 'production', 'test'];
      for (const env of validEnvs) {
        const result = EnvironmentNames.safeParse(env);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid environment names', () => {
      const result = EnvironmentNames.safeParse('invalid');
      expect(result.success).toBe(false);
    });

    it('should accept valid log levels', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
        LOG_LEVEL: 'debug',
      };

      const result = EnvSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.LOG_LEVEL).toBe('debug');
      }
    });

    it('should reject invalid log levels', () => {
      const env = {
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://localhost:5432/arrowera',
        AUTH_SECRET: 'super-secret-key-that-is-at-least-32-chars-long!',
        APP_URL: 'http://localhost:3000',
        LOG_LEVEL: 'verbose',
      };

      const result = EnvSchema.safeParse(env);
      expect(result.success).toBe(false);
    });
  });
});
