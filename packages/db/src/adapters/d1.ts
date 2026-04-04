import { DatabaseAdapter } from '../client';

export class D1Adapter implements DatabaseAdapter {
  constructor(private db: any) {} // Cloudflare D1 binding

  query(sql: string, params: any[] = []) {
    console.log(`[D1] Executing query: ${sql}`);
    return [];
  }

  execute(sql: string, params: any[] = []) {
    console.log(`[D1] Executing statement: ${sql}`);
  }
}
