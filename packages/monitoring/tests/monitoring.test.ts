import { describe, it, expect, beforeEach } from 'vitest';
import {
  Counter,
  Gauge,
  Histogram,
  MetricsRegistry,
  SystemMetricsCollector,
  getMetricsRegistry,
  createApiMetrics,
} from '../src/index';

describe('Counter', () => {
  it('should start at 0', () => {
    const counter = new Counter('test_requests', 'Test requests');
    expect(counter.get()).toBe(0);
  });

  it('should increment by 1 by default', () => {
    const counter = new Counter('test_requests', 'Test requests');
    counter.inc();
    expect(counter.get()).toBe(1);
  });

  it('should increment by a custom amount', () => {
    const counter = new Counter('test_requests', 'Test requests');
    counter.inc(5);
    expect(counter.get()).toBe(5);
  });

  it('should accumulate multiple increments', () => {
    const counter = new Counter('test_requests', 'Test requests');
    counter.inc(3);
    counter.inc(2);
    counter.inc(1);
    expect(counter.get()).toBe(6);
  });

  it('should reset to 0', () => {
    const counter = new Counter('test_requests', 'Test requests');
    counter.inc(10);
    counter.reset();
    expect(counter.get()).toBe(0);
  });

  it('should store name and help', () => {
    const counter = new Counter('http_requests', 'Total HTTP requests');
    expect(counter.name).toBe('http_requests');
    expect(counter.help).toBe('Total HTTP requests');
  });
});

describe('Gauge', () => {
  it('should start at 0', () => {
    const gauge = new Gauge('test_memory', 'Memory usage');
    expect(gauge.get()).toBe(0);
  });

  it('should increment and decrement', () => {
    const gauge = new Gauge('test_active', 'Active connections');
    gauge.inc(5);
    expect(gauge.get()).toBe(5);
    gauge.dec(2);
    expect(gauge.get()).toBe(3);
  });

  it('should set absolute value', () => {
    const gauge = new Gauge('test_temp', 'Temperature');
    gauge.set(42);
    expect(gauge.get()).toBe(42);
  });

  it('should set to current time', () => {
    const gauge = new Gauge('test_uptime', 'Uptime');
    const before = Date.now();
    gauge.setToCurrentTime();
    const after = Date.now();
    expect(gauge.get()).toBeGreaterThanOrEqual(before);
    expect(gauge.get()).toBeLessThanOrEqual(after);
  });

  it('should time a function using time()', () => {
    const gauge = new Gauge('test_duration', 'Duration');
    const stop = gauge.time();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        stop();
        expect(gauge.get()).toBeGreaterThan(0);
        resolve();
      }, 10);
    });
  });
});

describe('Histogram', () => {
  it('should start with zero observations', () => {
    const histogram = new Histogram('test_latency', 'Request latency');
    const stats = histogram.getStats();
    expect(stats.count).toBe(0);
    expect(stats.sum).toBe(0);
    expect(stats.avg).toBe(0);
  });

  it('should observe values and update stats', () => {
    const histogram = new Histogram('test_latency', 'Request latency');
    histogram.observe(100);
    histogram.observe(200);
    const stats = histogram.getStats();
    expect(stats.count).toBe(2);
    expect(stats.sum).toBe(300);
    expect(stats.avg).toBe(150);
  });

  it('should use default buckets when none provided', () => {
    const histogram = new Histogram('test', 'Test');
    const stats = histogram.getStats();
    expect(stats.count).toBe(0);
  });

  it('should accept custom bucket boundaries', () => {
    const histogram = new Histogram('test', 'Test', [10, 50, 100, 500]);
    histogram.observe(25);
    histogram.observe(200);
    const stats = histogram.getStats();
    expect(stats.count).toBe(2);
  });

  it('should time a function with startTimer()', () => {
    const histogram = new Histogram('test_timer', 'Timer test');
    const stop = histogram.startTimer();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const duration = stop();
        expect(duration).toBeGreaterThan(0);
        expect(histogram.getStats().count).toBe(1);
        resolve();
      }, 10);
    });
  });

  it('should reset all data', () => {
    const histogram = new Histogram('test', 'Test');
    histogram.observe(100);
    histogram.observe(200);
    histogram.reset();
    const stats = histogram.getStats();
    expect(stats.count).toBe(0);
    expect(stats.sum).toBe(0);
  });
});

describe('MetricsRegistry', () => {
  let registry: MetricsRegistry;

  beforeEach(() => {
    registry = new MetricsRegistry('test');
  });

  it('should create and register a counter', () => {
    const counter = registry.createCounter('requests', 'Total requests');
    expect(counter).toBeInstanceOf(Counter);
    expect(counter.name).toBe('test_requests');
  });

  it('should create and register a gauge', () => {
    const gauge = registry.createGauge('memory', 'Memory usage');
    expect(gauge).toBeInstanceOf(Gauge);
    expect(gauge.name).toBe('test_memory');
  });

  it('should create and register a histogram', () => {
    const histogram = registry.createHistogram('latency', 'Request latency');
    expect(histogram).toBeInstanceOf(Histogram);
    expect(histogram.name).toBe('test_latency');
  });

  it('should retrieve a metric by name', () => {
    registry.createCounter('test_counter', 'Test');
    const metric = registry.getMetric<Counter>('test_counter');
    expect(metric).toBeDefined();
    expect(metric).toBeInstanceOf(Counter);
  });

  it('should return undefined for non-existent metric', () => {
    const metric = registry.getMetric('nonexistent');
    expect(metric).toBeUndefined();
  });

  it('should return all registered metrics', () => {
    registry.createCounter('c1', 'Counter 1');
    registry.createGauge('g1', 'Gauge 1');
    const all = registry.getAllMetrics();
    expect(all.size).toBe(2);
  });

  it('should clear all metrics', () => {
    registry.createCounter('c1', 'Counter 1');
    registry.createGauge('g1', 'Gauge 1');
    registry.clear();
    expect(registry.getAllMetrics().size).toBe(0);
  });

  it('should export Prometheus format for counters', () => {
    const counter = registry.createCounter('requests', 'Total requests');
    counter.inc(42);
    const prometheus = registry.toPrometheusFormat();
    expect(prometheus).toContain('# HELP test_requests Total requests');
    expect(prometheus).toContain('# TYPE test_requests counter');
    expect(prometheus).toContain('test_requests 42');
  });

  it('should export Prometheus format for gauges', () => {
    const gauge = registry.createGauge('memory', 'Memory usage');
    gauge.set(1024);
    const prometheus = registry.toPrometheusFormat();
    expect(prometheus).toContain('# HELP test_memory Memory usage');
    expect(prometheus).toContain('# TYPE test_memory gauge');
    expect(prometheus).toContain('test_memory 1024');
  });

  it('should export Prometheus format for histograms', () => {
    const histogram = registry.createHistogram('latency', 'Request latency', [1, 5, 10]);
    histogram.observe(3);
    histogram.observe(7);
    const prometheus = registry.toPrometheusFormat();
    expect(prometheus).toContain('# HELP test_latency Request latency');
    expect(prometheus).toContain('# TYPE test_latency histogram');
    expect(prometheus).toContain('test_latency_bucket');
    expect(prometheus).toContain('test_latency_sum 10');
    expect(prometheus).toContain('test_latency_count 2');
  });

  it('should format labels in Prometheus output', () => {
    const counter = registry.createCounter('requests', 'Total', { method: 'GET' });
    counter.inc(1);
    const prometheus = registry.toPrometheusFormat();
    expect(prometheus).toContain('{method="GET"}');
  });
});

describe('createApiMetrics', () => {
  it('should create standard API metrics', () => {
    const registry = new MetricsRegistry('test');
    const apiMetrics = createApiMetrics(registry);
    expect(apiMetrics.requestCount).toBeInstanceOf(Counter);
    expect(apiMetrics.requestDuration).toBeInstanceOf(Histogram);
    expect(apiMetrics.errorCount).toBeInstanceOf(Counter);
    expect(apiMetrics.activeRequests).toBeInstanceOf(Gauge);
  });

  it('should have proper names for API metrics', () => {
    const registry = new MetricsRegistry('test');
    const apiMetrics = createApiMetrics(registry);
    expect(apiMetrics.requestCount.name).toBe('test_http_requests_total');
    expect(apiMetrics.requestDuration.name).toBe('test_http_request_duration_seconds');
    expect(apiMetrics.errorCount.name).toBe('test_http_errors_total');
    expect(apiMetrics.activeRequests.name).toBe('test_http_requests_active');
  });
});

describe('getMetricsRegistry', () => {
  it('should return a MetricsRegistry instance', () => {
    const reg = getMetricsRegistry('test2');
    expect(reg).toBeInstanceOf(MetricsRegistry);
  });

  it('should return the same instance on subsequent calls', () => {
    const reg1 = getMetricsRegistry('test3');
    const reg2 = getMetricsRegistry('test3');
    expect(reg1).toBe(reg2);
  });
});
