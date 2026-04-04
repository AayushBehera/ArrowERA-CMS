import { DatabaseAdapter } from '../client';

export class PostgresAdapter implements DatabaseAdapter {
  constructor(private connectionString: string) {}

  query(sql: string, params: any[] = []) {
    console.log(`[Postgres] Executing query: ${sql}`);
    return [];
  }

  execute(sql: string, params: any[] = []) {
    console.log(`[Postgres] Executing statement: ${sql}`);
  }
}
