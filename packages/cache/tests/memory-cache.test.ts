import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCache } from '../src/memory-cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache(3600, 1000);
  });

  afterEach(async () => {
    await cache.close();
  });

  describe('get', () => {
    it('should return miss for non-existent key', async () => {
      const result = await cache.get('nonexistent');
      expect(result.success).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('should return hit for existing key', async () => {
      await cache.set('key1', 'value1');
      const result = await cache.get<string>('key1');
      expect(result.success).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.value).toBe('value1');
    });

    it('should return miss for expired key', async () => {
      vi.useFakeTimers();
      await cache.set('key1', 'value1', { ttl: 1 }); // 1 second TTL
      vi.advanceTimersByTime(2000); // Advance past TTL
      const result = await cache.get('key1');
      expect(result.hit).toBe(false);
      vi.useRealTimers();
    });
  });

  describe('set', () => {
    it('should store and return value', async () => {
      const result = await cache.set('key1', 'hello');
      expect(result.success).toBe(true);
      expect(result.value).toBe('hello');
    });

    it('should store object values', async () => {
      const obj = { name: 'Test', count: 42 };
      await cache.set('obj-key', obj);
      const result = await cache.get<typeof obj>('obj-key');
      expect(result.value).toEqual(obj);
    });

    it('should support NX (set only if not exists)', async () => {
      await cache.set('nx-key', 'first');
      const result = await cache.set('nx-key', 'second', { nx: true });
      // Should not overwrite
      const stored = await cache.get<string>('nx-key');
      expect(stored.value).toBe('first');
    });

    it('should support XX (set only if exists)', async () => {
      const result = await cache.set('xx-key', 'value', { xx: true });
      // Should not set since key doesn't exist
      const stored = await cache.get('xx-key');
      expect(stored.hit).toBe(false);
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
      await cache.set('key1', 'value1');
      const exists = await cache.exists('key1');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const exists = await cache.exists('nonexistent');
      expect(exists).toBe(false);
    });
  });

  describe('ttl', () => {
    it('should return remaining TTL in seconds', async () => {
      await cache.set('key1', 'value1', { ttl: 3600 });
      const ttl = await cache.ttl('key1');
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should return -2 for non-existent key', async () => {
      const ttl = await cache.ttl('nonexistent');
      expect(ttl).toBe(-2);
    });
  });

  describe('mget', () => {
    it('should get multiple keys', async () => {
      await cache.set('a', 1);
      await cache.set('b', 2);
      await cache.set('c', 3);

      const results = await cache.mget<number>(['a', 'b', 'c', 'd']);
      expect(results.get('a')?.value).toBe(1);
      expect(results.get('b')?.value).toBe(2);
      expect(results.get('c')?.value).toBe(3);
      expect(results.get('d')?.hit).toBe(false);
    });

    it('should return empty map for empty keys', async () => {
      const results = await cache.mget([]);
      expect(results.size).toBe(0);
    });
  });

  describe('mset', () => {
    it('should set multiple keys', async () => {
      await cache.mset([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
        { key: 'c', value: 3 },
      ]);

      const a = await cache.get<number>('a');
      const b = await cache.get<number>('b');
      expect(a.value).toBe(1);
      expect(b.value).toBe(2);
    });

    it('should handle empty entries', async () => {
      await expect(cache.mset([])).resolves.toBeUndefined();
    });
  });

  describe('incr / decr', () => {
    it('should increment a value', async () => {
      const val = await cache.incr('counter');
      expect(val).toBe(1);

      const val2 = await cache.incr('counter', 5);
      expect(val2).toBe(6);
    });

    it('should decrement a value', async () => {
      await cache.set('counter', 10);
      const val = await cache.decr('counter', 3);
      expect(val).toBe(7);
    });

    it('should start from 0 if key does not exist', async () => {
      const val = await cache.incr('new-counter');
      expect(val).toBe(1);
    });
  });

  describe('invalidateByTags', () => {
    it('should delete all keys with matching tags', async () => {
      await cache.set('user:1', { name: 'Alice' }, { tags: ['user', 'admin'] });
      await cache.set('user:2', { name: 'Bob' }, { tags: ['user'] });
      await cache.set('product:1', { name: 'Widget' }, { tags: ['product'] });

      const deleted = await cache.invalidateByTags(['user']);
      expect(deleted).toBe(2);

      const user1 = await cache.get('user:1');
      expect(user1.hit).toBe(false);

      const product1 = await cache.get('product:1');
      expect(product1.hit).toBe(true);
    });

    it('should return 0 for non-matching tags', async () => {
      const deleted = await cache.invalidateByTags(['nonexistent']);
      expect(deleted).toBe(0);
    });
  });

  describe('invalidateByPattern', () => {
    it('should delete keys matching pattern', async () => {
      await cache.set('user:1', 'Alice');
      await cache.set('user:2', 'Bob');
      await cache.set('product:1', 'Widget');

      const deleted = await cache.invalidateByPattern('user:*');
      expect(deleted).toBe(2);

      const user1 = await cache.get('user:1');
      expect(user1.hit).toBe(false);

      const product1 = await cache.get('product:1');
      expect(product1.hit).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all entries', async () => {
      await cache.set('a', 1);
      await cache.set('b', 2);
      await cache.set('c', 3);

      await cache.clear();

      const stats = await cache.getStats();
      expect(stats.keyCount).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      await cache.set('a', 1);
      await cache.get('a'); // hit
      await cache.get('nonexistent'); // miss

      const stats = await cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.keyCount).toBe(1);
    });

    it('should return zero hit rate when no operations', async () => {
      const stats = await cache.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy', async () => {
      const health = await cache.healthCheck();
      expect(health.healthy).toBe(true);
    });
  });

  describe('close', () => {
    it('should clear all data and stop cleanup', async () => {
      await cache.set('key', 'value');
      await cache.close();

      const stats = await cache.getStats();
      expect(stats.keyCount).toBe(0);
    });
  });
});
