/**
 * Health check type definitions for ArrowERA CMS
 */

/**
 * Health status values
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Individual component health check result
 */
export interface ComponentHealth {
  /** Component name (e.g. 'database', 'cache', 'auth') */
  component: string;
  /** Current health status */
  status: HealthStatus;
  /** Optional response latency in milliseconds */
  latency?: number;
  /** Optional error message if unhealthy */
  error?: string;
  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated health check response
 */
export interface HealthCheckResult {
  /** Overall system health status */
  status: HealthStatus;
  /** ISO timestamp of the check */
  timestamp: string;
  /** Application uptime in seconds */
  uptime: number;
  /** Individual component health checks */
  components: ComponentHealth[];
  /** Application version */
  version: string;
  /** Environment name */
  environment: string;
  /** Optional: memory usage info */
  memory?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
}

/**
 * Health check options for configuring checks
 */
export interface HealthCheckOptions {
  /** Components to include in the check (empty = all) */
  components?: string[];
  /** Timeout per component check in milliseconds */
  timeout?: number;
  /** Include detailed memory information */
  includeMemory?: boolean;
}
