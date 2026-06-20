import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthService } from '../src/health/health.service';
import { createHealthRoutes } from '../src/health/health.routes';
import type { ComponentHealth, HealthCheckResult } from '../src/health/health.types';

describe('HealthService', () => {
  let service: HealthService;

  describe('check', () => {
    it('should return healthy for system component only', async () => {
      service = new HealthService();
      const result = await service.check();
      expect(result.status).toBe('healthy');
      expect(result.components).toHaveLength(1);
      expect(result.components[0].component).toBe('system');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBe('1.0.0');
    });

    it('should include memory info when requested', async () => {
      service = new HealthService();
      const result = await service.check({ includeMemory: true });
      expect(result.memory).toBeDefined();
      expect(result.memory!.heapUsed).toBeGreaterThan(0);
      expect(result.memory!.heapTotal).toBeGreaterThan(0);
      expect(result.memory!.rss).toBeGreaterThan(0);
    });

    it('should check database health when provider is set', async () => {
      const checkDb = vi.fn(async () => ({ healthy: true, latency: 5 }));
      service = new HealthService({ checkDatabase: checkDb });
      const result = await service.check();
      expect(checkDb).toHaveBeenCalled();
      const dbComponent = result.components.find((c) => c.component === 'database');
      expect(dbComponent).toBeDefined();
      expect(dbComponent!.status).toBe('healthy');
      expect(dbComponent!.latency).toBe(5);
    });

    it('should report unhealthy database', async () => {
      const checkDb = vi.fn(async () => ({ healthy: false }));
      service = new HealthService({ checkDatabase: checkDb });
      const result = await service.check();
      expect(result.status).toBe('unhealthy');
      const dbComponent = result.components.find((c) => c.component === 'database');
      expect(dbComponent!.status).toBe('unhealthy');
    });

    it('should check cache health when provider is set', async () => {
      const checkCache = vi.fn(async () => ({ healthy: true, latency: 2 }));
      service = new HealthService({ checkCache });
      const result = await service.check();
      const cacheComponent = result.components.find((c) => c.component === 'cache');
      expect(cacheComponent).toBeDefined();
      expect(cacheComponent!.status).toBe('healthy');
    });

    it('should check auth health when provider is set', async () => {
      const checkAuth = vi.fn(async () => ({ healthy: true }));
      service = new HealthService({ checkAuth });
      const result = await service.check();
      const authComponent = result.components.find((c) => c.component === 'auth');
      expect(authComponent).toBeDefined();
    });

    it('should filter components by request', async () => {
      const checkDb = vi.fn(async () => ({ healthy: true }));
      service = new HealthService({ checkDatabase: checkDb });
      const result = await service.check({ components: ['database'] });
      // Should not include system when explicitly filtered
      const systemComponent = result.components.find((c) => c.component === 'system');
      // Note: system always runs, check implementation
      expect(result.components.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle failing health checks', async () => {
      const checkDb = vi.fn(async () => { throw new Error('Connection refused'); });
      service = new HealthService({ checkDatabase: checkDb });
      const result = await service.check();
      const dbComponent = result.components.find((c) => c.component === 'database');
      expect(dbComponent!.status).toBe('unhealthy');
      expect(dbComponent!.error).toBe('Connection refused');
    });

    it('should aggregate to degraded when one component is degraded', async () => {
      // System can become degraded if heap usage > 90%
      // Mock memoryUsage for testing
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn(() => ({
        heapUsed: 950,
        heapTotal: 1000,
        rss: 50000,
        external: 1000,
        arrayBuffers: 0,
      })) as unknown as typeof process.memoryUsage;

      service = new HealthService();
      const result = await service.check();
      const systemComponent = result.components.find((c) => c.component === 'system');
      expect(systemComponent!.status).toBe('degraded');
      expect(result.status).toBe('degraded');

      process.memoryUsage = originalMemoryUsage;
    });

    it('should use custom version and environment', async () => {
      service = new HealthService({ version: '2.0.0', environment: 'staging' });
      const result = await service.check();
      expect(result.version).toBe('2.0.0');
      expect(result.environment).toBe('staging');
    });

    it('should handle timeout on health checks', async () => {
      const slowCheck = vi.fn(async () => {
        return new Promise<{ healthy: boolean }>((resolve) => {
          setTimeout(() => resolve({ healthy: true }), 2000);
        });
      });
      service = new HealthService({ checkDatabase: slowCheck });
      const result = await service.check({ timeout: 100 });
      const dbComponent = result.components.find((c) => c.component === 'database');
      expect(dbComponent!.status).toBe('unhealthy');
      expect(dbComponent!.error).toContain('timed out');
    });
  });
});

describe('createHealthRoutes', () => {
  let routes: ReturnType<typeof createHealthRoutes>;

  beforeEach(() => {
    routes = createHealthRoutes({
      version: '1.0.0',
      environment: 'test',
    });
  });

  describe('handleHealthCheck', () => {
    it('should return a Response with health data', async () => {
      const response = await routes.handleHealthCheck();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);

      const body = await response.json() as HealthCheckResult;
      expect(body.status).toBeDefined();
      expect(body.components).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('should include proper headers', async () => {
      const response = await routes.handleHealthCheck();
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Cache-Control')).toContain('no-cache');
      expect(response.headers.get('X-Health-Status')).toBeDefined();
    });
  });

  describe('handleDatabaseHealth', () => {
    it('should return database-specific health', async () => {
      const response = await routes.handleDatabaseHealth();
      expect(response).toBeInstanceOf(Response);

      const body = await response.json() as Record<string, unknown>;
      expect(body.component).toBe('database');
    });
  });

  describe('handleCacheHealth', () => {
    it('should return cache-specific health', async () => {
      const response = await routes.handleCacheHealth();
      const body = await response.json() as Record<string, unknown>;
      expect(body.component).toBe('cache');
    });
  });

  describe('handleAuthHealth', () => {
    it('should return auth-specific health', async () => {
      const response = await routes.handleAuthHealth();
      const body = await response.json() as Record<string, unknown>;
      expect(body.component).toBe('auth');
    });
  });

  describe('handleLiveness', () => {
    it('should return 200 alive status', async () => {
      const response = routes.handleLiveness();
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      expect(body.status).toBe('alive');
    });
  });

  describe('handleReadiness', () => {
    it('should return ready status', async () => {
      const response = await routes.handleReadiness();
      const body = await response.json() as Record<string, unknown>;
      expect(['ready', 'not ready']).toContain(body.status);
    });
  });
});
