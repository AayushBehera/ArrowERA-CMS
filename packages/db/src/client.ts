export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  duration?: number;
}

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  execute(sql: string, params?: any[]): Promise<void>;
  queryOne?<T = any>(sql: string, params?: any[]): Promise<T | null>;
  queryValue?<T = any>(sql: string, params?: any[]): Promise<T | null>;
  transaction?<T>(fn: (adapter: DatabaseAdapter) => Promise<T>): Promise<T>;
  healthCheck?(): Promise<{ healthy: boolean; latency?: number }>;
  close?(): Promise<void>;
}

export class DatabaseClient {
  constructor(private adapter: DatabaseAdapter) {}

  async query<T = any>(sql: string, params?: any[]) {
    return this.adapter.query<T>(sql, params);
  }

  async execute(sql: string, params?: any[]) {
    return this.adapter.execute(sql, params);
  }

  async queryOne<T = any>(sql: string, params?: any[]) {
    if (this.adapter.queryOne) {
      return this.adapter.queryOne<T>(sql, params);
    }
    const result = await this.adapter.query<T>(sql, params);
    return result.rows[0] || null;
  }

  async queryValue<T = any>(sql: string, params?: any[]) {
    if (this.adapter.queryValue) {
      return this.adapter.queryValue<T>(sql, params);
    }
    const result = await this.adapter.query<T>(sql, params);
    if (result.rows.length === 0) return null;
    const firstRow = result.rows[0] as Record<string, any>;
    return firstRow[Object.keys(firstRow)[0]] as T;
  }

  async healthCheck() {
    if (this.adapter.healthCheck) {
      return this.adapter.healthCheck();
    }
    return { healthy: false };
  }

  async close() {
    if (this.adapter.close) {
      return this.adapter.close();
    }
  }
}
