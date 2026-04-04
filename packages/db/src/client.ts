export interface DatabaseAdapter {
  query(sql: string, params?: any[]): any[];
  execute(sql: string, params?: any[]): void;
}

export class DatabaseClient {
  constructor(private adapter: DatabaseAdapter) {}

  query(sql: string, params?: any[]) {
    return this.adapter.query(sql, params);
  }

  execute(sql: string, params?: any[]) {
    return this.adapter.execute(sql, params);
  }
}
