/**
 * Health check service for ArrowERA CMS
 * Aggregates health status from database, cache, auth, and system components.
 */

import type { ComponentHealth, HealthCheckResult, HealthCheckOptions, HealthStatus } from './health.types';

export interface HealthServiceDependencies {
  /** Database health check function (optional) */
  checkDatabase?: () => Promise<{ healthy: boolean; latency?: number }>;
  /** Cache/Redis health check function (optional) */
  checkCache?: () => Promise<{ healthy: boolean; latency?: number }>;
  /** Auth service health check function (optional) */
  checkAuth?: () => Promise<{ healthy: boolean; latency?: number }>;
  /** Application version string */
  version?: string;
  /** Environment name */
  environment?: string;
}

export class HealthService {
  private readonly deps: HealthServiceDependencies;
  private readonly startTime: number;

  constructor(deps: HealthServiceDependencies = {}) {
    this.deps = deps;
    this.startTime = Date.now();
  }

  /**
   * Run all health checks and return aggregated result
   */
  async check(options: HealthCheckOptions = {}): Promise<HealthCheckResult> {
    const { components, timeout = 5000, includeMemory = false } = options;
    const componentChecks: Promise<ComponentHealth>[] = [];

    const shouldCheck = (name: string): boolean => {
      if (!components || components.length === 0) return true;
      return components.includes(name);
    };

    // Database health check
    if (shouldCheck('database') && this.deps.checkDatabase) {
      componentChecks.push(this.checkComponent('database', this.deps.checkDatabase, timeout));
    }

    // Cache health check
    if (shouldCheck('cache') && this.deps.checkCache) {
      componentChecks.push(this.checkComponent('cache', this.deps.checkCache, timeout));
    }

    // Auth health check
    if (shouldCheck('auth') && this.deps.checkAuth) {
      componentChecks.push(this.checkComponent('auth', this.deps.checkAuth, timeout));
    }

    // Always run a system check
    componentChecks.push(this.checkSystemHealth());

    const results = await Promise.all(componentChecks);

    // Determine overall status
    const overallStatus = this.aggregateStatus(results);

    const response: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      components: results,
      version: this.deps.version || '1.0.0',
      environment: this.deps.environment || process.env.NODE_ENV || 'development',
    };

    if (includeMemory) {
      const mem = process.memoryUsage();
      response.memory = {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rss: mem.rss,
        external: mem.external,
      };
    }

    return response;
  }

  /**
   * Check a single component with timeout
   */
  private async checkComponent(
    name: string,
    checkFn: () => Promise<{ healthy: boolean; latency?: number }>,
    timeout: number,
  ): Promise<ComponentHealth> {
    try {
      const result = await this.withTimeout(checkFn(), timeout);
      return {
        component: name,
        status: result.healthy ? 'healthy' : 'unhealthy',
        latency: result.latency,
      };
    } catch (error) {
      return {
        component: name,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * System-level health check (always runs)
   */
  private async checkSystemHealth(): Promise<ComponentHealth> {
    const mem = process.memoryUsage();
    const heapUsageRatio = mem.heapUsed / mem.heapTotal;

    // Consider degraded if heap usage exceeds 90%
    if (heapUsageRatio > 0.9) {
      return {
        component: 'system',
        status: 'degraded',
        metadata: {
          heapUsagePercent: Math.round(heapUsageRatio * 100),
          uptime: Math.floor((Date.now() - this.startTime) / 1000),
        },
      };
    }

    return {
      component: 'system',
      status: 'healthy',
      metadata: {
        heapUsagePercent: Math.round(heapUsageRatio * 100),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
      },
    };
  }

  /**
   * Aggregate individual component statuses into an overall status
   */
  private aggregateStatus(components: ComponentHealth[]): HealthStatus {
    const hasUnhealthy = components.some((c) => c.status === 'unhealthy');
    const hasDegraded = components.some((c) => c.status === 'degraded');

    if (hasUnhealthy) return 'unhealthy';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  }

  /**
   * Execute a promise with a timeout
   */
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Health check timed out after ${ms}ms`));
      }, ms);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
