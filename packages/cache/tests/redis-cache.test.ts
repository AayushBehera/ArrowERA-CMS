import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedisCache } from '../src/redis-cache';
import type { RedisClient } from '../src/redis-client';

// Mock Redis client for unit testing
function createMockRedisClient(): RedisClient {
  const store = new Map<string, string>();
  const tagSets = new Map<string, Set<string>>();

  const mockClient: Record<string, Function> = {
    get: vi.fn(async (key: string) => store.get(key) || null),
    set: vi.fn(async (...args: string[]) => {
      const [key, value, ...flags] = args;
      // Honor SET NX (only if absent) / XX (only if present) semantics like real Redis.
      if (flags.includes('NX') && store.has(key)) {
        return null;
      }
      if (flags.includes('XX') && !store.has(key)) {
        return null;
      }
      store.set(key, value);
      return 'OK';
    }),
    del: vi.fn(async (...keys: string[]) => {
      let count = 0;
      for (const k of keys) {
        if (store.delete(k)) count++;
      }
      return count;
    }),
    exists: vi.fn(async (key: string) => (store.has(key) ? 1 : 0)),
    ttl: vi.fn(async (_key: string) => -1),
    incrby: vi.fn(async (key: string, amount: number) => {
      const current = parseInt(store.get(key) || '0', 10);
      const next = current + amount;
      store.set(key, String(next));
      return next;
    }),
    decrby: vi.fn(async (key: string, amount: number) => {
      const current = parseInt(store.get(key) || '0', 10);
      const next = current - amount;
      store.set(key, String(next));
      return next;
    }),
    keys: vi.fn(async (_pattern: string) => Array.from(store.keys())),
    scan: vi.fn(async (_cursor: string, _match: string, _pattern: string, _count: string, _limit: number) => {
      return ['0', Array.from(store.keys())];
    }),
    sunion: vi.fn(async (...tagKeys: string[]) => {
      const keys: string[] = [];
      for (const tk of tagKeys) {
        const tagSet = tagSets.get(tk);
        if (tagSet) {
          for (const k of tagSet) keys.push(k);
        }
      }
      return keys;
    }),
    sadd: vi.fn(async (tagKey: string, key: string) => {
      if (!tagSets.has(tagKey)) tagSets.set(tagKey, new Set());
      tagSets.get(tagKey)!.add(key);
      return 1;
    }),
    mget: vi.fn(async (...keys: string[]) => {
      return keys.map((k: string) => store.get(k) || null);
    }),
    pipeline: vi.fn(() => {
      const commands: Array<{ cmd: string; args: unknown[] }> = [];
      return {
        set: vi.fn((...args: unknown[]) => {
          commands.push({ cmd: 'set', args });
        }),
        sadd: vi.fn((...args: unknown[]) => {
          commands.push({ cmd: 'sadd', args });
        }),
        exec: vi.fn(async () => {
          for (const c of commands) {
            if (c.cmd === 'set') {
              const [key, value] = c.args as string[];
              store.set(key, value);
            }
          }
        }),
      };
    }),
  };

  return {
    getClient: () => mockClient,
    connect: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    healthCheck: vi.fn(async () => ({ healthy: true, latency: 1 })),
    client: null,
  } as unknown as RedisClient;
}

describe('RedisCache', () => {
  let redisClient: RedisClient;
  let cache: RedisCache;

  beforeEach(() => {
    redisClient = createMockRedisClient();
    cache = new RedisCache(redisClient, 3600, 'test:');
  });

  describe('get', () => {
    it('should return miss for non-existent key', async () => {
      const result = await cache.get('nonexistent');
      expect(result.success).toBe(true);
      expect(result.hit).toBe(false);
    });

    it('should return hit for existing key', async () => {
      await cache.set('key1', 'hello');
      const result = await cache.get<string>('key1');
      expect(result.success).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.value).toBe('hello');
    });
  });

  describe('set', () => {
    it('should store and return value', async () => {
      const result = await cache.set('key1', 'world');
      expect(result.success).toBe(true);
      expect(result.value).toBe('world');
    });

    it('should store complex objects', async () => {
      const obj = { items: [1, 2, 3], meta: { page: 1 } };
      await cache.set('complex', obj);
      const result = await cache.get<typeof obj>('complex');
      expect(result.value).toEqual(obj);
    });

    it('should support NX flag', async () => {
      await cache.set('nx-key', 'first');
      const result = await cache.set('nx-key', 'second', { nx: true });
      const stored = await cache.get<string>('nx-key');
      expect(stored.value).toBe('first');
    });
  });

  describe('del', () => {
    it('should delete existing key', async () => {
      await cache.set('key1', 'value1');
      const deleted = await cache.del('key1');
      expect(deleted).toBe(true);

      const result = await cache.get('key1');
      expect(result.hit).toBe(false);
    });

    it('should return false for non-existent key', async () => {
      const deleted = await cache.del('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      await cache.set('key1', 'value');
      const exists = await cache.exists('key1');
      expect(exists).toBe(true);
    });

    it('should return false for missing key', async () => {
      const exists = await cache.exists('nonexistent');
      expect(exists).toBe(false);
    });
  });

  describe('incr / decr', () => {
    it('should increment counter', async () => {
      const val1 = await cache.incr('ctr');
      expect(val1).toBe(1);
      const val2 = await cache.incr('ctr', 5);
      expect(val2).toBe(6);
    });

    it('should decrement counter', async () => {
      // Counters use raw Redis INCR/DECR, so seed via incr rather than set()
      // (set() stores a JSON envelope that DECR cannot operate on).
      await cache.incr('ctr', 10);
      const val = await cache.decr('ctr', 3);
      expect(val).toBe(7);
    });
  });

  describe('mget', () => {
    it('should get multiple values', async () => {
      await cache.set('a', 1);
      await cache.set('b', 2);

      const results = await cache.mget<number>(['a', 'b', 'c']);
      expect(results.get('a')?.value).toBe(1);
      expect(results.get('b')?.value).toBe(2);
      expect(results.get('c')?.hit).toBe(false);
    });

    it('should return empty map for empty input', async () => {
      const results = await cache.mget([]);
      expect(results.size).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should track hits and misses', async () => {
      await cache.set('a', 1);
      await cache.get('a'); // hit
      await cache.get('nonexistent'); // miss

      const stats = await cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });
  });

  describe('healthCheck', () => {
    it('should delegate to redis client', async () => {
      const health = await cache.healthCheck();
      expect(health.healthy).toBe(true);
    });
  });

  describe('close', () => {
    it('should close redis connection', async () => {
      await cache.close();
      expect(redisClient.close).toHaveBeenCalled();
    });
  });
});
