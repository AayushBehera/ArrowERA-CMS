import { DatabaseClient, SQLiteAdapter } from '@arrorera/db';
import { PluginSandbox } from '@arrorera/plugin-runtime';

export class EmDashCMS {
  public db: DatabaseClient;
  public sandbox: PluginSandbox;

  constructor() {
    this.db = new DatabaseClient(new SQLiteAdapter());
    this.sandbox = new PluginSandbox();
  }

  async getCollection(collectionName: string) {
    const results = this.db.query('SELECT * FROM content WHERE type = ?', [collectionName]);
    return {
      entries: results.map((r: any) => ({
        id: r.id,
        type: r.type,
        ...JSON.parse(r.data),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    };
  }

  async createEntry(collectionName: string, data: any) {
    const id = Math.random().toString(36).substring(2, 9);
    this.db.execute(
      'INSERT INTO content (id, type, data) VALUES (?, ?, ?)',
      [id, collectionName, JSON.stringify(data)]
    );
    
    this.sandbox.executeHook('content:afterSave', { id, collectionName, data });
    
    return id;
  }
}

export const cms = new EmDashCMS();
