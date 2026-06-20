/**
 * In-memory LRU cache implementation for ArrowERA CMS
 * Provides a fallback cache when Redis is unavailable (e.g., development).
 */

import type { CacheProvider, CacheResult, CacheSetOptions, CacheStats, CacheEntry } from './cache.types';

interface MemoryCacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  tags: string[];
  metadata?: Record<string, unknown>;
  lastAccessed: number;
}

export class MemoryCache implements CacheProvider {
  private store: Map<string, MemoryCacheEntry<unknown>>;
  private readonly maxEntries: number;
  private readonly defaultTtl: number;
  private readonly tagIndex: Map<string, Set<string>>;
  private stats: { hits: number; misses: number };
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor(defaultTtl = 3600, maxEntries = 10000) {
    this.store = new Map();
    this.maxEntries = maxEntries;
    this.defaultTtl = defaultTtl;
    this.tagIndex = new Map();
    this.stats = { hits: 0, misses: 0 };

    // Run cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => this.evictExpired(), 60000);
  }

  /**
   * Get a value from cache
   */
  async get<T = unknown>(key: string): Promise<CacheResult<T>> {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      return { success: true, hit: false };
    }

    // Check expiration
    if (Date.now() > entry.expiresAt * 1000) {
      this.store.delete(key);
      this.stats.misses++;
      return { success: true, hit: false };
    }

    // Update access time for LRU
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    return { success: true, value: entry.value as T, hit: true };
  }

  /**
   * Set a value in cache
   */
  async set<T = unknown>(
    key: string,
    value: T,
    options: CacheSetOptions = {},
  ): Promise<CacheResult<T>> {
    // Check NX/XX constraints
    if (options.nx && this.store.has(key)) {
      return { success: true, hit: false };
    }
    if (options.xx && !this.store.has(key)) {
      return { success: true, hit: false };
    }

    const ttl = options.ttl ?? this.defaultTtl;

    const entry: MemoryCacheEntry<T> = {
      value,
      expiresAt: Math.floor(Date.now() / 1000) + ttl,
      tags: options.tags || [],
      metadata: options.metadata,
      lastAccessed: Date.now(),
    };

    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      this.evictOldest();
    }

    // Remove old tags before setting new ones
    const oldEntry = this.store.get(key);
    if (oldEntry) {
      for (const tag of oldEntry.tags) {
        const keys = this.tagIndex.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) this.tagIndex.delete(tag);
        }
      }
    }

    this.store.set(key, entry);

    // Update tag index
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }

    return { success: true, value, hit: false };
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (entry) {
      // Remove from tag index
      for (const tag of entry.tags) {
        const keys = this.tagIndex.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) this.tagIndex.delete(tag);
        }
      }
    }

    return this.store.delete(key);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt * 1000) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get remaining TTL in seconds
   */
  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;

    const remaining = entry.expiresAt - Math.floor(Date.now() / 1000);
    if (remaining <= 0) {
      this.store.delete(key);
      return -2;
    }

    return remaining;
  }

  /**
   * Get multiple values
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, CacheResult<T>>> {
    const results = new Map<string, CacheResult<T>>();

    for (const key of keys) {
      results.set(key, await this.get<T>(key));
    }

    return results;
  }

  /**
   * Set multiple values
   */
  async mset<T = unknown>(
    entries: Array<{ key: string; value: T; options?: CacheSetOptions }>,
  ): Promise<void> {
    for (const { key, value, options } of entries) {
      await this.set(key, value, options);
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string, amount = 1): Promise<number> {
    const result = await this.get<number>(key);
    const currentValue = result.hit && typeof result.value === 'number' ? result.value : 0;
    const newValue = currentValue + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement a counter
   */
  async decr(key: string, amount = 1): Promise<number> {
    return this.incr(key, -amount);
  }

  /**
   * Invalidate entries by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let deleted = 0;

    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        for (const key of keys) {
          if (this.store.delete(key)) deleted++;
        }
        this.tagIndex.delete(tag);
      }
    }

    return deleted;
  }

  /**
   * Invalidate entries by key pattern (simple string matching)
   */
  async invalidateByPattern(pattern: string): Promise<number> {
    let deleted = 0;
    const regex = this.patternToRegex(pattern);

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        if (this.store.delete(key)) deleted++;
      }
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.store.clear();
    this.tagIndex.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      keyCount: this.store.size,
    };
  }

  /**
   * Health check (always healthy for memory cache)
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    const start = Date.now();
    return { healthy: true, latency: Date.now() - start };
  }

  /**
   * Close and clean up
   */
  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }

  /**
   * Evict expired entries
   */
  private evictExpired(): void {
    const now = Math.floor(Date.now() / 1000);

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        for (const tag of entry.tags) {
          const keys = this.tagIndex.get(tag);
          if (keys) {
            keys.delete(key);
            if (keys.size === 0) this.tagIndex.delete(tag);
          }
        }
      }
    }
  }

  /**
   * Evict the least recently used entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  /**
   * Convert a simple glob pattern to a regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    return new RegExp(`^${escaped}$`);
  }
}
