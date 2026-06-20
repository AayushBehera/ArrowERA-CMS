/**
 * Cache type definitions for ArrowERA CMS
 */

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Cache provider type */
  provider: 'redis' | 'memory';
  /** Redis connection URL (required for redis provider) */
  redisUrl?: string;
  /** Redis connection options */
  redisOptions?: RedisConnectionOptions;
  /** Default TTL in seconds for cache entries */
  defaultTtl: number;
  /** Maximum number of entries (for memory cache) */
  maxEntries?: number;
  /** Key prefix for namespacing */
  keyPrefix?: string;
  /** Whether to enable cache tags */
  enableTags?: boolean;
}

/**
 * Redis connection options
 */
export interface RedisConnectionOptions {
  /** Redis host */
  host?: string;
  /** Redis port */
  port?: number;
  /** Redis password */
  password?: string;
  /** Redis database number */
  db?: number;
  /** Enable TLS */
  tls?: boolean;
  /** Connection timeout in milliseconds */
  connectTimeout?: number;
  /** Max retry attempts */
  maxRetriesPerRequest?: number;
  /** Retry strategy */
  retryStrategy?: (times: number) => number | void;
}

/**
 * Cache entry stored in the cache
 */
export interface CacheEntry<T = unknown> {
  /** The cached value */
  value: T;
  /** Unix timestamp when this entry expires */
  expiresAt: number;
  /** Tags associated with this entry */
  tags?: string[];
  /** Metadata about the entry */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a cache operation
 */
export interface CacheResult<T = unknown> {
  /** Whether the operation was successful */
  success: boolean;
  /** The cached value (if found) */
  value?: T;
  /** Whether the value was found in cache */
  hit: boolean;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Options for cache set operations
 */
export interface CacheSetOptions {
  /** TTL in seconds */
  ttl?: number;
  /** Tags to associate with this entry */
  tags?: string[];
  /** Metadata */
  metadata?: Record<string, unknown>;
  /** Only set if key does not exist (NX) */
  nx?: boolean;
  /** Only set if key already exists (XX) */
  xx?: boolean;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Total number of keys */
  keyCount: number;
  /** Total memory usage estimate in bytes */
  memoryBytes?: number;
}

/**
 * Cache provider interface that all cache implementations must satisfy
 */
export interface CacheProvider {
  /** Get a value by key */
  get<T = unknown>(key: string): Promise<CacheResult<T>>;
  /** Set a value with optional TTL */
  set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<CacheResult<T>>;
  /** Delete a key */
  del(key: string): Promise<boolean>;
  /** Check if a key exists */
  exists(key: string): Promise<boolean>;
  /** Get the TTL of a key in seconds */
  ttl(key: string): Promise<number>;
  /** Get multiple values */
  mget<T = unknown>(keys: string[]): Promise<Map<string, CacheResult<T>>>;
  /** Set multiple values */
  mset<T = unknown>(entries: Array<{ key: string; value: T; options?: CacheSetOptions }>): Promise<void>;
  /** Increment a counter */
  incr(key: string, amount?: number): Promise<number>;
  /** Decrement a counter */
  decr(key: string, amount?: number): Promise<number>;
  /** Invalidate entries by tags */
  invalidateByTags(tags: string[]): Promise<number>;
  /** Invalidate entries by key pattern */
  invalidateByPattern(pattern: string): Promise<number>;
  /** Clear all cache entries (dangerous) */
  clear(): Promise<void>;
  /** Get cache statistics */
  getStats(): Promise<CacheStats>;
  /** Health check */
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>;
  /** Close connection (cleanup) */
  close(): Promise<void>;
}
