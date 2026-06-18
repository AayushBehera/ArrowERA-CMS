import { DatabaseAdapter, QueryResult } from '../client';

interface PostgresConfig {
  connectionString: string;
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * Production-ready PostgreSQL adapter with connection pooling
 */
export class PostgresAdapter implements DatabaseAdapter {
  private pool: any = null;
  private config: PostgresConfig;
  private isConnected: boolean = false;

  constructor(connectionStringOrConfig: string | PostgresConfig) {
    if (typeof connectionStringOrConfig === 'string') {
      this.config = {
        connectionString: connectionStringOrConfig,
        max: 20,
        min: 4,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      };
    } else {
      this.config = connectionStringOrConfig;
    }
  }

  /**
   * Initialize connection pool lazily
   */
  private async ensureConnection(): Promise<void> {
    if (this.pool && this.isConnected) {
      return;
    }

    try {
      // Dynamic import for optional dependency
      const { Pool } = await import('pg');
      
      this.pool = new Pool({
        connectionString: this.config.connectionString,
        max: this.config.max,
        min: this.config.min,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      
      // Handle pool errors
      this.pool.on('error', (err: Error) => {
        console.error('[Postgres] Unexpected error on idle client:', err);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('[Postgres] Failed to initialize connection pool:', error);
      throw new Error(`PostgreSQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a query and return results
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    await this.ensureConnection();

    const startTime = Date.now();
    
    try {
      const result = await this.pool.query(sql, params);
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        console.warn(`[Postgres] Slow query (${duration}ms): ${sql.substring(0, 100)}...`);
      }

      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[Postgres] Query error:', {
        sql: sql.substring(0, 200),
        params: params.length,
        error: error instanceof Error ? error.message : error,
        duration
      });
      
      throw this.mapError(error);
    }
  }

  /**
   * Execute a statement without returning results
   */
  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.query(sql, params);
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(fn: (adapter: PostgresAdapter) => Promise<T>): Promise<T> {
    await this.ensureConnection();
    
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const txAdapter = new TransactionalPostgresAdapter(client);
      const result = await fn(txAdapter as any);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw this.mapError(error);
    } finally {
      client.release();
    }
  }

  /**
   * Get a single row or null
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Get a single value or null
   */
  async queryValue<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    if (result.rows.length === 0) return null;
    const firstRow = result.rows[0];
    return firstRow[Object.keys(firstRow)[0]] as T;
  }

  /**
   * Check if database is healthy
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    try {
      const startTime = Date.now();
      await this.queryValue('SELECT 1');
      const latency = Date.now() - startTime;
      return { healthy: true, latency };
    } catch (error) {
      return { healthy: false };
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
    }
  }

  /**
   * Map PostgreSQL errors to application errors
   */
  private mapError(error: any): Error {
    if (!(error instanceof Error)) {
      return new Error(String(error));
    }

    // PostgreSQL error codes
    const pgError = error as any;
    
    switch (pgError.code) {
      case '23505': // Unique violation
        return new Error('Unique constraint violation');
      case '23503': // Foreign key violation
        return new Error('Foreign key constraint violation');
      case '23502': // Not null violation
        return new Error('Null value not allowed');
      case '42P01': // Undefined table
        return new Error('Table does not exist');
      case '42703': // Undefined column
        return new Error('Column does not exist');
      case '08006': // Connection failure
        return new Error('Database connection failed');
      default:
        return error;
    }
  }
}

/**
 * Transactional adapter for use within transactions
 */
class TransactionalPostgresAdapter implements DatabaseAdapter {
  constructor(private client: any) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const result = await this.client.query(sql, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
      duration: Date.now() - startTime
    };
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.client.query(sql, params);
  }
}

// Legacy function wrapper for backward compatibility
export const createPostgresAdapter = (connectionString: string): PostgresAdapter => {
  return new PostgresAdapter(connectionString);
};
