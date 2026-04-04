import fs from 'fs';
import path from 'path';
import { DatabaseAdapter } from '../client';

export class SQLiteAdapter implements DatabaseAdapter {
  private dbPath: string;
  private data: any[] = [];

  constructor(filename: string = 'local.json') {
    this.dbPath = path.resolve(process.cwd(), filename);
    this.init();
  }

  private init() {
    if (fs.existsSync(this.dbPath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
      } catch (e) {
        this.data = [];
      }
    } else {
      this.save();
    }
  }

  private save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  query(sql: string, params: any[] = []) {
    // Simple mock query parser for the demo
    if (sql.includes('SELECT * FROM content WHERE type = ?')) {
      return this.data.filter(item => item.type === params[0]);
    }
    return this.data;
  }

  execute(sql: string, params: any[] = []) {
    if (sql.includes('INSERT INTO content')) {
      const [id, type, data] = params;
      this.data.push({
        id,
        type,
        data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      this.save();
    }
  }
}
