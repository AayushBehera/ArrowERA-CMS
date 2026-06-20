/**
 * Edge cache strategies for ArrowERA CMS
 * Implements stale-while-revalidate, cache-first, and network-first patterns.
 */

import type { CacheProvider, CacheResult, CacheSetOptions } from './cache.types';

export interface EdgeCacheOptions {
  /** Default TTL for cached items in seconds */
  defaultTtl?: number;
  /** Stale TTL — how long to serve stale content while revalidating */
  staleTtl?: number;
  /** Whether to cache error responses */
  cacheErrors?: boolean;
  /** TTL for cached errors */
  errorTtl?: number;
}

/**
 * Stale-While-Revalidate Cache
 * Returns cached data immediately, then refreshes it in the background.
 * Best for: data that can be slightly stale (user profiles, content lists).
 */
export class StaleWhileRevalidateCache {
  private pendingRevalidations: Set<string> = new Set();

  constructor(
    private readonly cache: CacheProvider,
    private readonly options: EdgeCacheOptions = {},
  ) {}

  /**
   * Get a value using stale-while-revalidate pattern
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<CacheResult<T>> {
    const cached = await this.cache.get<T>(key);

    // Cache hit — return immediately, revalidate in background
    if (cached.hit && cached.value !== undefined) {
      this.revalidateInBackground(key, fetcher, options);
      return { success: true, value: cached.value, hit: true };
    }

    // Cache miss — must fetch
    try {
      const value = await fetcher();
      const ttl = options?.ttl ?? this.options.defaultTtl ?? 300;
      await this.cache.set(key, value as T, { ...options, ttl });
      return { success: true, value: value as T, hit: false };
    } catch (error) {
      return {
        success: false,
        hit: false,
        error: error instanceof Error ? error.message : 'Fetcher failed',
      };
    }
  }

  /**
   * Revalidate cache entry in background without blocking
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<void> {
    // Prevent duplicate revalidations for the same key
    if (this.pendingRevalidations.has(key)) return;

    this.pendingRevalidations.add(key);

    try {
      const value = await fetcher();
      const ttl = options?.ttl ?? this.options.defaultTtl ?? 300;
      await this.cache.set(key, value as T, { ...options, ttl });
    } catch {
      // Silently fail revalidation — cached value is still served
    } finally {
      this.pendingRevalidations.delete(key);
    }
  }
}

/**
 * Cache-First Strategy
 * Always returns cached data if available; only fetches on cache miss.
 * Best for: static/rarely changing data (config, assets, SEO content).
 */
export class CacheFirstCache {
  constructor(
    private readonly cache: CacheProvider,
    private readonly options: EdgeCacheOptions = {},
  ) {}

  /**
   * Get a value using cache-first pattern
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<CacheResult<T>> {
    // Try cache first
    const cached = await this.cache.get<T>(key);

    if (cached.hit && cached.value !== undefined) {
      return { success: true, value: cached.value, hit: true };
    }

    // Cache miss — fetch and store
    try {
      const value = await fetcher();
      const ttl = options?.ttl ?? this.options.defaultTtl ?? 3600;
      await this.cache.set(key, value as T, { ...options, ttl });
      return { success: true, value: value as T, hit: false };
    } catch (error) {
      return {
        success: false,
        hit: false,
        error: error instanceof Error ? error.message : 'Fetcher failed',
      };
    }
  }
}

/**
 * Network-First Strategy
 * Always tries the network first; falls back to cache on failure.
 * Best for: data that must be fresh (real-time dashboards, live scores).
 */
export class NetworkFirstCache {
  constructor(
    private readonly cache: CacheProvider,
    private readonly options: EdgeCacheOptions = {},
  ) {}

  /**
   * Get a value using network-first pattern
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<CacheResult<T>> {
    try {
      // Try network first
      const value = await fetcher();

      // Cache the fresh value
      const ttl = options?.ttl ?? this.options.defaultTtl ?? 300;
      await this.cache.set(key, value as T, { ...options, ttl });

      return { success: true, value: value as T, hit: false };
    } catch {
      // Network failed — fall back to cache
      const cached = await this.cache.get<T>(key);

      if (cached.hit && cached.value !== undefined) {
        return { success: true, value: cached.value, hit: true };
      }

      return {
        success: false,
        hit: false,
        error: 'Network request failed and no cached value available',
      };
    }
  }
}
