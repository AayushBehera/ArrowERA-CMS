/**
 * Cache invalidation utilities for ArrowERA CMS
 * Provides tag-based and pattern-based invalidation with batching support.
 */

import type { CacheProvider } from './cache.types';

export interface InvalidationResult {
  /** Number of keys invalidated */
  keysInvalidated: number;
  /** Tags that were invalidated */
  tags?: string[];
  /** How long the invalidation took in ms */
  duration: number;
}

export class CacheInvalidator {
  constructor(private readonly cache: CacheProvider) {}

  /**
   * Invalidate cache entries by one or more tags
   */
  async invalidateByTags(tags: string[]): Promise<InvalidationResult> {
    const start = Date.now();
    const keysInvalidated = await this.cache.invalidateByTags(tags);
    return {
      keysInvalidated,
      tags,
      duration: Date.now() - start,
    };
  }

  /**
   * Invalidate cache entries matching a key pattern
   * Pattern uses glob-style: user:* matches all user keys
   */
  async invalidateByPattern(pattern: string): Promise<InvalidationResult> {
    const start = Date.now();
    const keysInvalidated = await this.cache.invalidateByPattern(pattern);
    return {
      keysInvalidated,
      duration: Date.now() - start,
    };
  }

  /**
   * Invalidate all cache entries (full flush)
   */
  async invalidateAll(): Promise<InvalidationResult> {
    const start = Date.now();
    await this.cache.clear();
    return {
      keysInvalidated: -1, // Unknown count — full clear
      duration: Date.now() - start,
    };
  }

  /**
   * Invalidate specific keys
   */
  async invalidateKeys(keys: string[]): Promise<InvalidationResult> {
    const start = Date.now();
    let deleted = 0;

    for (const key of keys) {
      if (await this.cache.del(key)) {
        deleted++;
      }
    }

    return {
      keysInvalidated: deleted,
      duration: Date.now() - start,
    };
  }

  /**
   * Warm the cache by pre-loading values
   */
  async warm<T>(
    entries: Array<{
      key: string;
      loader: () => Promise<T>;
      ttl?: number;
      tags?: string[];
    }>,
  ): Promise<number> {
    let warmed = 0;

    for (const { key, loader, ttl, tags } of entries) {
      try {
        const value = await loader();
        if (value !== null && value !== undefined) {
          await this.cache.set(key, value, { ttl, tags });
          warmed++;
        }
      } catch {
        // Skip entries that fail to load
      }
    }

    return warmed;
  }
}
