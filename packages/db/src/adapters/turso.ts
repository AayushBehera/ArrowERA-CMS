import { DatabaseAdapter, QueryResult } from '../client';

export class TursoAdapter implements DatabaseAdapter {
  constructor(private url: string, private authToken: string) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    console.log(`[Turso] Executing query: ${sql}`);
    return { rows: [], rowCount: 0 };
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    console.log(`[Turso] Executing statement: ${sql}`);
  }
}
