/**
 * Health check route handlers for ArrowERA CMS
 * Provides endpoints for load balancers, Kubernetes probes, and monitoring systems.
 */

import { HealthService, type HealthServiceDependencies } from './health.service';
import type { HealthCheckResult } from './health.types';

/**
 * Create health check route handlers with the given dependencies
 */
export function createHealthRoutes(deps: HealthServiceDependencies = {}) {
  const healthService = new HealthService(deps);

  /**
   * GET /health — Aggregated health check for all components
   */
  async function handleHealthCheck(): Promise<Response> {
    try {
      const result = await healthService.check();
      const statusCode = mapStatusToHttpCode(result.status);

      return new Response(JSON.stringify(result), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Health-Status': result.status,
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          uptime: 0,
          components: [],
          version: deps.version || '1.0.0',
          environment: deps.environment || 'development',
          error: error instanceof Error ? error.message : 'Health check failed',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Health-Status': 'unhealthy',
          },
        },
      );
    }
  }

  /**
   * GET /health/db — Database-specific health check
   */
  async function handleDatabaseHealth(): Promise<Response> {
    try {
      const result = await healthService.check({ components: ['database'], includeMemory: false });
      const dbComponent = result.components.find((c) => c.component === 'database');

      return new Response(
        JSON.stringify({
          status: dbComponent?.status || 'unhealthy',
          component: 'database',
          latency: dbComponent?.latency,
          error: dbComponent?.error,
          timestamp: result.timestamp,
        }),
        {
          status: dbComponent?.status === 'healthy' ? 200 : 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          component: 'database',
          error: error instanceof Error ? error.message : 'Database health check failed',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  /**
   * GET /health/cache — Cache/Redis-specific health check
   */
  async function handleCacheHealth(): Promise<Response> {
    try {
      const result = await healthService.check({ components: ['cache'], includeMemory: false });
      const cacheComponent = result.components.find((c) => c.component === 'cache');

      return new Response(
        JSON.stringify({
          status: cacheComponent?.status || 'unhealthy',
          component: 'cache',
          latency: cacheComponent?.latency,
          error: cacheComponent?.error,
          timestamp: result.timestamp,
        }),
        {
          status: cacheComponent?.status === 'healthy' ? 200 : 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          component: 'cache',
          error: error instanceof Error ? error.message : 'Cache health check failed',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  /**
   * GET /health/auth — Auth service-specific health check
   */
  async function handleAuthHealth(): Promise<Response> {
    try {
      const result = await healthService.check({ components: ['auth'], includeMemory: false });
      const authComponent = result.components.find((c) => c.component === 'auth');

      return new Response(
        JSON.stringify({
          status: authComponent?.status || 'unhealthy',
          component: 'auth',
          latency: authComponent?.latency,
          error: authComponent?.error,
          timestamp: result.timestamp,
        }),
        {
          status: authComponent?.status === 'healthy' ? 200 : 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          component: 'auth',
          error: error instanceof Error ? error.message : 'Auth health check failed',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  /**
   * GET /health/live — Kubernetes liveness probe (lightweight)
   * Returns 200 if the process is alive.
   */
  function handleLiveness(): Response {
    return new Response(JSON.stringify({ status: 'alive', timestamp: new Date().toISOString() }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  /**
   * GET /health/ready — Kubernetes readiness probe
   * Returns 200 only if all critical components are healthy.
   */
  async function handleReadiness(): Promise<Response> {
    try {
      const result = await healthService.check();
      const isReady = result.status !== 'unhealthy';

      return new Response(
        JSON.stringify({
          status: isReady ? 'ready' : 'not ready',
          timestamp: result.timestamp,
        }),
        {
          status: isReady ? 200 : 503,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        },
      );
    } catch {
      return new Response(
        JSON.stringify({ status: 'not ready', timestamp: new Date().toISOString() }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  return {
    handleHealthCheck,
    handleDatabaseHealth,
    handleCacheHealth,
    handleAuthHealth,
    handleLiveness,
    handleReadiness,
  };
}

/**
 * Map health status to appropriate HTTP status code
 */
function mapStatusToHttpCode(status: string): number {
  switch (status) {
    case 'healthy':
      return 200;
    case 'degraded':
      return 200;
    case 'unhealthy':
      return 503;
    default:
      return 200;
  }
}

// Export type for consumers
export type HealthRouteHandlers = ReturnType<typeof createHealthRoutes>;
