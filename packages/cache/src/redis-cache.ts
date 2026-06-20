/**
 * Redis cache implementation for ArrowERA CMS
 * Provides full Redis-backed caching with tags, patterns, and statistics.
 */

import type { CacheProvider, CacheResult, CacheSetOptions, CacheStats, CacheEntry } from './cache.types';
import { RedisClient } from './redis-client';

export class RedisCache implements CacheProvider {
  private readonly tagsKeyPrefix: string;
  private readonly stats: { hits: number; misses: number };

  constructor(
    private readonly redis: RedisClient,
    private readonly defaultTtl: number = 3600,
    private readonly keyPrefix: string = 'arrowera:cache:',
  ) {
    this.tagsKeyPrefix = `${keyPrefix}tag:`;
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Build a full Redis key with prefix
   */
  private buildKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Get raw Redis client for direct operations
   */
  private getRawClient(): Record<string, Function> {
    return this.redis.getClient() as Record<string, Function>;
  }

  /**
   * Get a value from cache
   */
  async get<T = unknown>(key: string): Promise<CacheResult<T>> {
    try {
      const client = this.getRawClient();
      const raw = await client.get(this.buildKey(key));

      if (!raw) {
        this.stats.misses++;
        return { success: true, hit: false };
      }

      const entry: CacheEntry<T> = JSON.parse(raw as string);

      // Check expiration
      if (entry.expiresAt && Date.now() > entry.expiresAt * 1000) {
        this.stats.misses++;
        await client.del(this.buildKey(key));
        return { success: true, hit: false };
      }

      this.stats.hits++;
      return { success: true, value: entry.value, hit: true };
    } catch (error) {
      return {
        success: false,
        hit: false,
        error: error instanceof Error ? error.message : 'Cache get failed',
      };
    }
  }

  /**
   * Set a value in cache
   */
  async set<T = unknown>(
    key: string,
    value: T,
    options: CacheSetOptions = {},
  ): Promise<CacheResult<T>> {
    try {
      const client = this.getRawClient();
      const ttl = options.ttl ?? this.defaultTtl;

      const entry: CacheEntry<T> = {
        value,
        expiresAt: Math.floor(Date.now() / 1000) + ttl,
        tags: options.tags,
        metadata: options.metadata,
      };

      const serialized = JSON.stringify(entry);
      const fullKey = this.buildKey(key);

      if (options.nx) {
        const result = await client.set(fullKey, serialized, 'EX', ttl, 'NX');
        if (result !== 'OK') {
          return { success: true, hit: false };
        }
      } else if (options.xx) {
        const result = await client.set(fullKey, serialized, 'EX', ttl, 'XX');
        if (result !== 'OK') {
          return { success: true, hit: false };
        }
      } else {
        await client.set(fullKey, serialized, 'EX', ttl);
      }

      // Store tags for later invalidation
      if (options.tags && options.tags.length > 0) {
        await this.addTagsToKey(fullKey, options.tags);
      }

      return { success: true, value, hit: false };
    } catch (error) {
      return {
        success: false,
        hit: false,
        error: error instanceof Error ? error.message : 'Cache set failed',
      };
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      const client = this.getRawClient();
      const fullKey = this.buildKey(key);
      const result = await client.del(fullKey);
      return (result as number) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = this.getRawClient();
      const result = await client.exists(this.buildKey(key));
      return (result as number) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the remaining TTL of a key in seconds
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = this.getRawClient();
      return (await client.ttl(this.buildKey(key))) as number;
    } catch {
      return -2; // Key does not exist
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, CacheResult<T>>> {
    const results = new Map<string, CacheResult<T>>();

    if (keys.length === 0) return results;

    try {
      const client = this.getRawClient();
      const fullKeys = keys.map((k) => this.buildKey(k));
      const rawValues = (await client.mget(...fullKeys)) as (string | null)[];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const raw = rawValues[i];

        if (!raw) {
          this.stats.misses++;
          results.set(key, { success: true, hit: false });
          continue;
        }

        const entry: CacheEntry<T> = JSON.parse(raw);

        if (entry.expiresAt && Date.now() > entry.expiresAt * 1000) {
          this.stats.misses++;
          results.set(key, { success: true, hit: false });
          continue;
        }

        this.stats.hits++;
        results.set(key, { success: true, value: entry.value, hit: true });
      }
    } catch (error) {
      for (const key of keys) {
        results.set(key, {
          success: false,
          hit: false,
          error: error instanceof Error ? error.message : 'mget failed',
        });
      }
    }

    return results;
  }

  /**
   * Set multiple values at once
   */
  async mset<T = unknown>(
    entries: Array<{ key: string; value: T; options?: CacheSetOptions }>,
  ): Promise<void> {
    if (entries.length === 0) return;

    const client = this.getRawClient();
    const pipeline = client.pipeline ? (client.pipeline() as Record<string, Function>) : null;

    for (const { key, value, options } of entries) {
      const ttl = options?.ttl ?? this.defaultTtl;
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Math.floor(Date.now() / 1000) + ttl,
        tags: options?.tags,
        metadata: options?.metadata,
      };

      const serialized = JSON.stringify(entry);
      const fullKey = this.buildKey(key);

      if (pipeline) {
        pipeline.set(fullKey, serialized, 'EX', ttl);
        if (options?.tags && options.tags.length > 0) {
          for (const tag of options.tags) {
            pipeline.sadd(`${this.tagsKeyPrefix}${tag}`, fullKey);
          }
        }
      } else {
        await client.set(fullKey, serialized, 'EX', ttl);
        if (options?.tags && options.tags.length > 0) {
          await this.addTagsToKey(fullKey, options.tags);
        }
      }
    }

    if (pipeline) {
      await pipeline.exec();
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string, amount = 1): Promise<number> {
    try {
      const client = this.getRawClient();
      return (await client.incrby(this.buildKey(key), amount)) as number;
    } catch {
      return 0;
    }
  }

  /**
   * Decrement a counter
   */
  async decr(key: string, amount = 1): Promise<number> {
    try {
      const client = this.getRawClient();
      return (await client.decrby(this.buildKey(key), amount)) as number;
    } catch {
      return 0;
    }
  }

  /**
   * Invalidate cache entries by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    if (tags.length === 0) return 0;

    try {
      const client = this.getRawClient();
      const tagKeys = tags.map((tag) => `${this.tagsKeyPrefix}${tag}`);

      // Get all cache keys for these tags
      const keys = (await client.sunion(...tagKeys)) as string[];

      if (keys.length === 0) return 0;

      // Delete all keys
      const deleted = (await client.del(...keys)) as number;

      // Clean up tag sets
      for (const tagKey of tagKeys) {
        await client.del(tagKey);
      }

      return deleted;
    } catch {
      return 0;
    }
  }

  /**
   * Invalidate cache entries by key pattern
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const client = this.getRawClient();
      let deleted = 0;

      // Use SCAN instead of KEYS for production safety
      let cursor = '0';
      const fullPattern = `${this.keyPrefix}${pattern}`;

      do {
        const result = (await client.scan(
          cursor,
          'MATCH',
          fullPattern,
          'COUNT',
          100,
        )) as [string, string[]];

        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          deleted += (await client.del(...keys)) as number;
        }
      } while (cursor !== '0');

      return deleted;
    } catch {
      return 0;
    }
  }

  /**
   * Clear all cache entries with the configured prefix
   */
  async clear(): Promise<void> {
    try {
      await this.invalidateByPattern('*');
    } catch {
      // Silently fail — clear is best-effort
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const client = this.getRawClient();
      const keys = (await client.keys(`${this.keyPrefix}*`)) as string[];
      const total = this.stats.hits + this.stats.misses;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: total > 0 ? this.stats.hits / total : 0,
        keyCount: keys.length,
      };
    } catch {
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        keyCount: 0,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    return this.redis.healthCheck();
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.redis.close();
  }

  /**
   * Add tags to a key's tag sets
   */
  private async addTagsToKey(fullKey: string, tags: string[]): Promise<void> {
    const client = this.getRawClient();
    for (const tag of tags) {
      await client.sadd(`${this.tagsKeyPrefix}${tag}`, fullKey);
    }
  }
}

/**
 * Factory function to create a Redis cache instance
 */
export async function createRedisCache(
  redisUrl: string,
  defaultTtl?: number,
  keyPrefix?: string,
): Promise<RedisCache> {
  const redisClient = new RedisClient({ url: redisUrl });
  await redisClient.connect();

  return new RedisCache(redisClient, defaultTtl, keyPrefix);
}
