import { randomUUID } from 'crypto';

/**
 * Metric types supported by ArrowERA Monitoring
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * Metric label key-value pairs
 */
export interface MetricLabels {
  [key: string]: string;
}

/**
 * Base metric interface
 */
export interface Metric {
  name: string;
  help: string;
  type: MetricType;
  labels?: MetricLabels;
}

/**
 * Counter metric - only increases
 */
export class Counter {
  private value: number = 0;
  private labels: MetricLabels;

  constructor(public name: string, public help: string, labels?: MetricLabels) {
    this.labels = labels || {};
  }

  inc(amount: number = 1, labels?: MetricLabels): void {
    this.value += amount;
  }

  get(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

/**
 * Gauge metric - can increase or decrease
 */
export class Gauge {
  private value: number = 0;
  private labels: MetricLabels;

  constructor(public name: string, public help: string, labels?: MetricLabels) {
    this.labels = labels || {};
  }

  inc(amount: number = 1): void {
    this.value += amount;
  }

  dec(amount: number = 1): void {
    this.value -= amount;
  }

  set(value: number): void {
    this.value = value;
  }

  get(): number {
    return this.value;
  }

  setToCurrentTime(): void {
    this.value = Date.now();
  }

  time(): () => void {
    const start = Date.now();
    return () => {
      this.set(Date.now() - start);
    };
  }
}

/**
 * Histogram metric - tracks distribution of values
 */
export class Histogram {
  private buckets: Map<number, number>;
  private sum: number = 0;
  private count: number = 0;
  private labels: MetricLabels;
  private bucketBoundaries: number[];

  constructor(
    public name: string,
    public help: string,
    bucketBoundaries?: number[],
    labels?: MetricLabels
  ) {
    this.bucketBoundaries = bucketBoundaries || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    this.labels = labels || {};
    this.buckets = new Map(this.bucketBoundaries.map(boundary => [boundary, 0]));
    this.buckets.set(Infinity, 0);
  }

  observe(value: number): void {
    this.sum += value;
    this.count++;

    for (const boundary of this.bucketBoundaries) {
      if (value <= boundary) {
        this.buckets.set(boundary, (this.buckets.get(boundary) || 0) + 1);
      }
    }
    this.buckets.set(Infinity, (this.buckets.get(Infinity) || 0) + 1);
  }

  startTimer(): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.observe(duration);
      return duration;
    };
  }

  getStats(): { sum: number; count: number; avg: number } {
    return {
      sum: this.sum,
      count: this.count,
      avg: this.count > 0 ? this.sum / this.count : 0
    };
  }

  reset(): void {
    this.sum = 0;
    this.count = 0;
    this.buckets = new Map(this.bucketBoundaries.map(boundary => [boundary, 0]));
    this.buckets.set(Infinity, 0);
  }
}

/**
 * Prometheus-compatible metrics registry
 */
export class MetricsRegistry {
  private metrics: Map<string, Counter | Gauge | Histogram> = new Map();
  private prefix: string;

  constructor(prefix: string = 'arrowera') {
    this.prefix = prefix;
  }

  /**
   * Create and register a counter metric
   */
  createCounter(name: string, help: string, labels?: MetricLabels): Counter {
    const fullName = `${this.prefix}_${name}`;
    const counter = new Counter(fullName, help, labels);
    this.metrics.set(fullName, counter);
    return counter;
  }

  /**
   * Create and register a gauge metric
   */
  createGauge(name: string, help: string, labels?: MetricLabels): Gauge {
    const fullName = `${this.prefix}_${name}`;
    const gauge = new Gauge(fullName, help, labels);
    this.metrics.set(fullName, gauge);
    return gauge;
  }

  /**
   * Create and register a histogram metric
   */
  createHistogram(
    name: string,
    help: string,
    buckets?: number[],
    labels?: MetricLabels
  ): Histogram {
    const fullName = `${this.prefix}_${name}`;
    const histogram = new Histogram(fullName, help, buckets, labels);
    this.metrics.set(fullName, histogram);
    return histogram;
  }

  /**
   * Get metric by name
   */
  getMetric<T extends Counter | Gauge | Histogram>(name: string): T | undefined {
    return this.metrics.get(`${this.prefix}_${name}`) as T | undefined;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, Counter | Gauge | Histogram> {
    return new Map(this.metrics);
  }

  /**
   * Export metrics in Prometheus format
   */
  toPrometheusFormat(): string {
    const lines: string[] = [];

    for (const [name, metric] of this.metrics.entries()) {
      // Add HELP line
      lines.push(`# HELP ${name} ${metric.help}`);
      
      // Add TYPE line
      lines.push(`# TYPE ${name} ${metric.type}`);

      // Add metric values
      if (metric instanceof Counter || metric instanceof Gauge) {
        const labelStr = this.formatLabels(metric.labels || {});
        lines.push(`${name}${labelStr} ${metric.get()}`);
      } else if (metric instanceof Histogram) {
        const stats = metric.getStats();
        const labelStr = this.formatLabels(metric.labels || {});
        
        // Output bucket counts
        for (const [boundary, count] of metric.buckets.entries()) {
          const bucketLabel = boundary === Infinity ? '+Inf' : boundary;
          lines.push(`${name}_bucket{le="${bucketLabel}"${labelStr}} ${count}`);
        }
        
        // Output sum and count
        lines.push(`${name}_sum${labelStr} ${stats.sum}`);
        lines.push(`${name}_count${labelStr} ${stats.count}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format labels for Prometheus
   */
  private formatLabels(labels: MetricLabels): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    
    const formatted = entries.map(([key, value]) => `${key}="${value}"`).join(',');
    return `{${formatted}}`;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * System metrics collector
 */
export class SystemMetricsCollector {
  private registry: MetricsRegistry;
  private intervalId?: NodeJS.Timeout;

  constructor(registry: MetricsRegistry) {
    this.registry = registry;
    
    // Create system metrics
    this.registry.createGauge('memory_heap_used_bytes', 'Heap memory used in bytes');
    this.registry.createGauge('memory_heap_total_bytes', 'Total heap memory in bytes');
    this.registry.createGauge('memory_rss_bytes', 'Resident set size in bytes');
    this.registry.createGauge('cpu_usage_percent', 'CPU usage percentage');
    this.registry.createGauge('uptime_seconds', 'Process uptime in seconds');
    this.registry.createGauge('active_handles', 'Number of active handles');
    this.registry.createGauge('active_requests', 'Number of active requests');
  }

  /**
   * Collect system metrics
   */
  collect(): void {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.registry.getMetric<Gauge>('memory_heap_used_bytes')?.set(memUsage.heapUsed);
    this.registry.getMetric<Gauge>('memory_heap_total_bytes')?.set(memUsage.heapTotal);
    this.registry.getMetric<Gauge>('memory_rss_bytes')?.set(memUsage.rss);
    this.registry.getMetric<Gauge>('uptime_seconds')?.set(process.uptime());
    this.registry.getMetric<Gauge>('active_handles')?.set((process as any)._getActiveHandles?.().length || 0);
    this.registry.getMetric<Gauge>('active_requests')?.set((process as any)._getActiveRequests?.().length || 0);
  }

  /**
   * Start automatic collection
   */
  start(intervalMs: number = 15000): void {
    this.collect(); // Initial collection
    this.intervalId = setInterval(() => this.collect(), intervalMs);
  }

  /**
   * Stop automatic collection
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

/**
 * Default metrics registry instance
 */
let defaultRegistry: MetricsRegistry | null = null;

/**
 * Get or create default metrics registry
 */
export function getMetricsRegistry(prefix?: string): MetricsRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new MetricsRegistry(prefix);
  }
  return defaultRegistry;
}

/**
 * Create standard API metrics
 */
export function createApiMetrics(registry: MetricsRegistry): {
  requestCount: Counter;
  requestDuration: Histogram;
  errorCount: Counter;
  activeRequests: Gauge;
} {
  return {
    requestCount: registry.createCounter(
      'http_requests_total',
      'Total number of HTTP requests'
    ),
    requestDuration: registry.createHistogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    ),
    errorCount: registry.createCounter(
      'http_errors_total',
      'Total number of HTTP errors'
    ),
    activeRequests: registry.createGauge(
      'http_requests_active',
      'Number of active HTTP requests'
    )
  };
}

// Export default instances
export const registry = getMetricsRegistry();
export const systemCollector = new SystemMetricsCollector(registry);
export default registry;
