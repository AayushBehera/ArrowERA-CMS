import { DatabaseAdapter } from '../client';

export class TursoAdapter implements DatabaseAdapter {
  constructor(private url: string, private authToken: string) {}

  query(sql: string, params: any[] = []) {
    console.log(`[Turso] Executing query: ${sql}`);
    return [];
  }

  execute(sql: string, params: any[] = []) {
    console.log(`[Turso] Executing statement: ${sql}`);
  }
}
