/**
 * Redis client factory for ArrowERA CMS
 * Provides connection management, health checks, and client lifecycle.
 */

import type { RedisConnectionOptions } from './cache.types';

export interface RedisClientConfig {
  /** Connection URL (redis:// or rediss://) */
  url?: string;
  /** Connection options (alternative to URL) */
  options?: RedisConnectionOptions;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  /** Base delay between retries in ms */
  retryBaseDelay?: number;
}

/**
 * Redis client wrapper providing connection management and health monitoring
 */
export class RedisClient {
  private client: unknown = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts: number;
  private readonly retryBaseDelay: number;

  constructor(private readonly config: RedisClientConfig = {}) {
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 10;
    this.retryBaseDelay = config.retryBaseDelay ?? 100;
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      // Dynamic import of ioredis to avoid hard dependency at module level
      const { default: Redis } = await import('ioredis');

      const redisOptions = this.buildRedisOptions();

      this.client = new Redis(redisOptions);

      // Set up event handlers
      const client = this.client as Record<string, unknown>;

      if (typeof client.on === 'function') {
        (client.on as Function)('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        (client.on as Function)('error', (err: Error) => {
          console.error('[Redis] Client error:', err.message);
        });

        (client.on as Function)('close', () => {
          this.isConnected = false;
        });

        (client.on as Function)('reconnecting', () => {
          this.reconnectAttempts++;
          if (this.reconnectAttempts > this.maxReconnectAttempts) {
            console.error('[Redis] Max reconnection attempts reached');
          }
        });
      }

      // Test the connection
      await this.ping();
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      throw new Error(
        `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Build Redis connection options from config
   */
  private buildRedisOptions(): Record<string, unknown> {
    const options: Record<string, unknown> = {
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > this.maxReconnectAttempts) {
          return null; // Stop retrying
        }
        return Math.min(times * this.retryBaseDelay, 5000);
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    };

    if (this.config.url) {
      return { ...options, ...this.parseUrl(this.config.url) };
    }

    if (this.config.options) {
      return {
        ...options,
        host: this.config.options.host || '127.0.0.1',
        port: this.config.options.port || 6379,
        password: this.config.options.password,
        db: this.config.options.db || 0,
        connectTimeout: this.config.options.connectTimeout || 10000,
        tls: this.config.options.tls ? {} : undefined,
      };
    }

    // Default to localhost
    return { ...options, host: '127.0.0.1', port: 6379 };
  }

  /**
   * Parse Redis URL into connection options
   */
  private parseUrl(url: string): Record<string, unknown> {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname || '127.0.0.1',
        port: parseInt(parsed.port || '6379', 10),
        password: parsed.password || undefined,
        db: parseInt(parsed.pathname?.replace('/', '') || '0', 10),
        tls: parsed.protocol === 'rediss:' ? {} : undefined,
      };
    } catch {
      return { host: '127.0.0.1', port: 6379 };
    }
  }

  /**
   * Get the raw Redis client (for advanced operations)
   */
  getClient(): unknown {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Ping Redis to verify connectivity
   */
  async ping(): Promise<string> {
    const client = this.client as { ping: () => Promise<string> } | null;
    if (!client) throw new Error('Redis client not initialized');
    return client.ping();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    try {
      const start = Date.now();
      const result = await this.ping();
      const latency = Date.now() - start;
      return { healthy: result === 'PONG', latency };
    } catch {
      return { healthy: false };
    }
  }

  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      const client = this.client as { quit: () => Promise<void>; disconnect: () => void };
      try {
        await client.quit();
      } catch {
        client.disconnect();
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected;
  }
}
