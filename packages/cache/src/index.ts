/**
 * ArrowERA Cache — Unified cache interface
 * Auto-selects Redis or in-memory cache based on configuration.
 */

import type { CacheConfig, CacheProvider } from './cache.types';
import { MemoryCache } from './memory-cache';
import { RedisCache } from './redis-cache';
import { RedisClient } from './redis-client';

/**
 * Create a cache provider based on configuration
 */
export async function createCache(config: CacheConfig): Promise<CacheProvider> {
  if (config.provider === 'redis') {
    const redisUrl = config.redisUrl || process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('[Cache] REDIS_URL not set, falling back to memory cache');
      return new MemoryCache(config.defaultTtl, config.maxEntries);
    }

    try {
      const redisClient = new RedisClient({ url: redisUrl });
      await redisClient.connect();
      return new RedisCache(redisClient, config.defaultTtl, config.keyPrefix);
    } catch (error) {
      console.warn(
        `[Cache] Redis connection failed (${error instanceof Error ? error.message : 'unknown'}), falling back to memory cache`,
      );
      return new MemoryCache(config.defaultTtl, config.maxEntries);
    }
  }

  // Default to memory cache
  return new MemoryCache(config.defaultTtl, config.maxEntries);
}

// Re-export all types
export type {
  CacheConfig,
  CacheProvider,
  CacheResult,
  CacheSetOptions,
  CacheStats,
  CacheEntry,
  RedisConnectionOptions,
} from './cache.types';

// Re-export implementations
export { MemoryCache } from './memory-cache';
export { RedisCache } from './redis-cache';
export { RedisClient } from './redis-client';

// Cache strategies
export { CacheStrategy, CacheAsideStrategy, WriteThroughStrategy, WriteBehindStrategy } from './strategy';
export type { CacheStrategyConfig } from './strategy';

// Invalidation
export { CacheInvalidator } from './invalidation';

// Edge cache
export { StaleWhileRevalidateCache, CacheFirstCache, NetworkFirstCache } from './edge';
export type { EdgeCacheOptions } from './edge';
