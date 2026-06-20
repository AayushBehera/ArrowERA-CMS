/**
 * Cache strategies for ArrowERA CMS
 * Implements standard caching patterns: cache-aside, write-through, write-behind.
 */

import type { CacheProvider, CacheResult, CacheSetOptions } from './cache.types';

export interface CacheStrategyConfig {
  /** Default TTL for cached items in seconds */
  defaultTtl?: number;
  /** Whether to cache null/empty results */
  cacheNulls?: boolean;
  /** TTL for null results */
  nullTtl?: number;
}

/**
 * Cache-Aside (Lazy Loading) Strategy
 * Application checks cache first; on miss, loads from source and populates cache.
 */
export class CacheAsideStrategy {
  constructor(
    private readonly cache: CacheProvider,
    private readonly config: CacheStrategyConfig = {},
  ) {}

  /**
   * Get a value using cache-aside pattern
   */
  async get<T>(
    key: string,
    loader: () => Promise<T | null>,
    options?: CacheSetOptions,
  ): Promise<CacheResult<T>> {
    // Check cache first
    const cached = await this.cache.get<T>(key);

    if (cached.hit && cached.value !== undefined) {
      return { success: true, value: cached.value, hit: true };
    }

    // Cache miss — load from source
    try {
      const value = await loader();

      // Cache the result
      if (value !== null || this.config.cacheNulls) {
        const ttl = value === null ? (this.config.nullTtl ?? 60) : options?.ttl ?? this.config.defaultTtl;
        await this.cache.set(key, value as T, { ...options, ttl });
      }

      return { success: true, value: value as T | undefined, hit: false };
    } catch (error) {
      return {
        success: false,
        hit: false,
        error: error instanceof Error ? error.message : 'Loader failed',
      };
    }
  }

  /**
   * Invalidate a cached key after source mutation
   */
  async invalidate(key: string): Promise<void> {
    await this.cache.del(key);
  }
}

/**
 * Write-Through Strategy
 * Writes go to cache first, then synchronously to the source.
 * Cache is always consistent with source.
 */
export class WriteThroughStrategy {
  constructor(
    private readonly cache: CacheProvider,
    private readonly config: CacheStrategyConfig = {},
  ) {}

  /**
   * Write a value through cache to source
   */
  async set<T>(
    key: string,
    value: T,
    writer: (value: T) => Promise<void>,
    options?: CacheSetOptions,
  ): Promise<boolean> {
    try {
      // Write to cache first
      await this.cache.set(key, value, {
        ttl: options?.ttl ?? this.config.defaultTtl,
        tags: options?.tags,
      });

      // Write to source
      await writer(value);

      return true;
    } catch (error) {
      // On failure, invalidate cache to prevent inconsistency
      await this.cache.del(key);
      return false;
    }
  }

  /**
   * Read using write-through (same as cache-aside for reads)
   */
  async get<T>(
    key: string,
    loader: () => Promise<T | null>,
    options?: CacheSetOptions,
  ): Promise<CacheResult<T>> {
    const cached = await this.cache.get<T>(key);

    if (cached.hit && cached.value !== undefined) {
      return { success: true, value: cached.value, hit: true };
    }

    try {
      const value = await loader();
      if (value !== null || this.config.cacheNulls) {
        const ttl = value === null ? (this.config.nullTtl ?? 60) : options?.ttl ?? this.config.defaultTtl;
        await this.cache.set(key, value as T, { ...options, ttl });
      }
      return { success: true, value: value as T | undefined, hit: false };
    } catch (error) {
      return {
        success: false,
        hit: false,
        error: error instanceof Error ? error.message : 'Loader failed',
      };
    }
  }
}

/**
 * Write-Behind (Write-Back) Strategy
 * Writes go to cache immediately; source is updated asynchronously.
 * Higher throughput but potential for data loss.
 */
export class WriteBehindStrategy {
  private writeQueue: Array<{
    key: string;
    writer: () => Promise<void>;
  }> = [];
  private flushInterval?: ReturnType<typeof setInterval>;
  private isFlushing = false;

  constructor(
    private readonly cache: CacheProvider,
    private readonly config: CacheStrategyConfig & { flushIntervalMs?: number; batchSize?: number } = {},
  ) {
    this.flushInterval = setInterval(
      () => this.flush(),
      config.flushIntervalMs ?? 5000,
    );
  }

  /**
   * Write to cache immediately, queue source write
   */
  async set<T>(
    key: string,
    value: T,
    writer: (value: T) => Promise<void>,
    options?: CacheSetOptions,
  ): Promise<boolean> {
    try {
      await this.cache.set(key, value, {
        ttl: options?.ttl ?? this.config.defaultTtl,
        tags: options?.tags,
      });

      // Queue the source write
      this.writeQueue.push({
        key,
        writer: () => writer(value),
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Flush pending writes to source
   */
  private async flush(): Promise<void> {
    if (this.isFlushing || this.writeQueue.length === 0) return;

    this.isFlushing = true;
    const batch = this.writeQueue.splice(0, this.config.batchSize ?? 50);

    for (const { writer } of batch) {
      try {
        await writer();
      } catch (error) {
        console.error('[WriteBehind] Failed to flush write:', error);
      }
    }

    this.isFlushing = false;
  }

  /**
   * Force flush all pending writes
   */
  async flushAll(): Promise<void> {
    await this.flush();
    // Process any remaining
    while (this.writeQueue.length > 0) {
      await this.flush();
    }
  }

  /**
   * Clean up the strategy
   */
  async close(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushAll();
  }
}

// Union type for all strategy types
export type CacheStrategy = CacheAsideStrategy | WriteThroughStrategy | WriteBehindStrategy;
