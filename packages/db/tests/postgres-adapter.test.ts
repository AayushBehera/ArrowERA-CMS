import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseClient, type DatabaseAdapter, type QueryResult } from '../src/client';

// Mock DatabaseAdapter for unit testing
function createMockAdapter(): DatabaseAdapter {
  const rows: Map<string, unknown[]> = new Map();

  return {
    async query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
      return { rows: [] as T[], rowCount: 0 };
    },

    async execute(sql: string, params?: unknown[]): Promise<void> {
      // No-op
    },

    async queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
      return null;
    },

    async queryValue<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
      return null;
    },

    async transaction<T>(fn: (adapter: DatabaseAdapter) => Promise<T>): Promise<T> {
      return fn(this);
    },

    async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
      return { healthy: true, latency: 1 };
    },

    async close(): Promise<void> {
      // No-op
    },
  };
}

describe('DatabaseClient', () => {
  let adapter: DatabaseAdapter;
  let client: DatabaseClient;

  beforeEach(() => {
    adapter = createMockAdapter();
    client = new DatabaseClient(adapter);
  });

  describe('query', () => {
    it('should delegate to adapter query', async () => {
      const spy = vi.spyOn(adapter, 'query');
      await client.query('SELECT 1');
      expect(spy).toHaveBeenCalledWith('SELECT 1', undefined);
    });

    it('should pass params to adapter', async () => {
      const spy = vi.spyOn(adapter, 'query');
      await client.query('SELECT * FROM users WHERE id = $1', ['user-1']);
      expect(spy).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['user-1']);
    });

    it('should return query result', async () => {
      const mockResult: QueryResult = { rows: [{ id: 1 }], rowCount: 1 };
      vi.spyOn(adapter, 'query').mockResolvedValue(mockResult);
      const result = await client.query('SELECT 1');
      expect(result).toBe(mockResult);
    });
  });

  describe('execute', () => {
    it('should delegate to adapter execute', async () => {
      const spy = vi.spyOn(adapter, 'execute');
      await client.execute('INSERT INTO users VALUES ($1)', ['test']);
      expect(spy).toHaveBeenCalledWith('INSERT INTO users VALUES ($1)', ['test']);
    });
  });

  describe('queryOne', () => {
    it('should delegate to adapter queryOne when available', async () => {
      const spy = vi.spyOn(adapter, 'queryOne').mockResolvedValue({ id: 1 });
      const result = await client.queryOne('SELECT * FROM users LIMIT 1');
      expect(spy).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });

    it('should fall back to query when queryOne not available', async () => {
      const adapterWithoutQueryOne: DatabaseAdapter = {
        query: vi.fn(async () => ({ rows: [{ id: 1, name: 'Test' }], rowCount: 1 })) as DatabaseAdapter['query'],
        execute: vi.fn(async () => {}),
      };
      const client2 = new DatabaseClient(adapterWithoutQueryOne);
      const result = await client2.queryOne('SELECT * FROM users LIMIT 1');
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should return null when no rows', async () => {
      const adapterWithoutQueryOne: DatabaseAdapter = {
        query: vi.fn(async () => ({ rows: [], rowCount: 0 })),
        execute: vi.fn(async () => {}),
      };
      const client2 = new DatabaseClient(adapterWithoutQueryOne);
      const result = await client2.queryOne('SELECT * FROM users WHERE id = $1', ['none']);
      expect(result).toBeNull();
    });
  });

  describe('queryValue', () => {
    it('should delegate to adapter queryValue when available', async () => {
      vi.spyOn(adapter, 'queryValue').mockResolvedValue(42);
      const result = await client.queryValue<number>('SELECT count(*) FROM users');
      expect(result).toBe(42);
    });

    it('should fall back to query when queryValue not available', async () => {
      const adapterWithoutQueryValue: DatabaseAdapter = {
        query: vi.fn(async () => ({ rows: [{ count: '5' }], rowCount: 1 })) as DatabaseAdapter['query'],
        execute: vi.fn(async () => {}),
      };
      const client2 = new DatabaseClient(adapterWithoutQueryValue);
      const result = await client2.queryValue('SELECT count(*) FROM users');
      expect(result).toBe('5');
    });

    it('should return null when no rows', async () => {
      const adapterWithoutQueryValue: DatabaseAdapter = {
        query: vi.fn(async () => ({ rows: [], rowCount: 0 })),
        execute: vi.fn(async () => {}),
      };
      const client2 = new DatabaseClient(adapterWithoutQueryValue);
      const result = await client2.queryValue('SELECT count(*) FROM users');
      expect(result).toBeNull();
    });
  });

  describe('healthCheck', () => {
    it('should delegate to adapter healthCheck', async () => {
      const health = await client.healthCheck();
      expect(health.healthy).toBe(true);
    });

    it('should return unhealthy when adapter has no healthCheck', async () => {
      const minimalAdapter: DatabaseAdapter = {
        query: vi.fn(async () => ({ rows: [], rowCount: 0 })),
        execute: vi.fn(async () => {}),
      };
      const client2 = new DatabaseClient(minimalAdapter);
      const health = await client2.healthCheck();
      expect(health.healthy).toBe(false);
    });
  });

  describe('close', () => {
    it('should call adapter close when available', async () => {
      const spy = vi.spyOn(adapter, 'close');
      await client.close();
      expect(spy).toHaveBeenCalled();
    });

    it('should not throw when adapter has no close', async () => {
      const minimalAdapter: DatabaseAdapter = {
        query: vi.fn(async () => ({ rows: [], rowCount: 0 })),
        execute: vi.fn(async () => {}),
      };
      const client2 = new DatabaseClient(minimalAdapter);
      await expect(client2.close()).resolves.toBeUndefined();
    });
  });
});

describe('DatabaseAdapter interface', () => {
  it('should define required methods', () => {
    // Verify the interface shape exists (TypeScript-only test)
    const adapter: DatabaseAdapter = createMockAdapter();
    expect(typeof adapter.query).toBe('function');
    expect(typeof adapter.execute).toBe('function');
    expect(typeof adapter.queryOne).toBe('function');
    expect(typeof adapter.queryValue).toBe('function');
    expect(typeof adapter.transaction).toBe('function');
    expect(typeof adapter.healthCheck).toBe('function');
    expect(typeof adapter.close).toBe('function');
  });

  it('should support transactions', async () => {
    const adapter = createMockAdapter();
    const txSpy = vi.spyOn(adapter, 'transaction');
    const querySpy = vi.spyOn(adapter, 'query');

    await adapter.transaction!(async (tx) => {
      await tx.query('INSERT INTO users VALUES ($1)', ['Alice']);
      await tx.query('INSERT INTO profiles VALUES ($1)', ['Alice-profile']);
    });

    expect(txSpy).toHaveBeenCalled();
    // Inside transaction, the query was called with the provided adapter
    expect(querySpy).toHaveBeenCalledTimes(2);
  });
});
