import fs from 'fs';
import path from 'path';
import { DatabaseAdapter } from '../client';

interface QueryCacheEntry {
  sql: string;
  paramsHash: string;
  result: any[];
  timestamp: number;
}

export class SQLiteAdapter implements DatabaseAdapter {
  private dbPath: string;
  private data: any[] = [];
  private queryCache: Map<string, QueryCacheEntry> = new Map();
  private readonly CACHE_TTL = 5000; // 5 seconds cache TTL
  private readonly MAX_CACHE_SIZE = 1000;
  private writeQueue: Array<() => void> = [];
  private isWriting = false;

  constructor(filename: string = 'local.json') {
    this.dbPath = path.resolve(process.cwd(), filename);
    this.init();
  }

  private init() {
    if (fs.existsSync(this.dbPath)) {
      try {
        const content = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(content);
      } catch (e) {
        console.error('[SQLite] Failed to parse database file, starting fresh');
        this.data = [];
      }
    } else {
      this.save();
    }
  }

  private save(): void {
    // Queue write operations to batch them
    this.writeQueue.push(() => {
      try {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
        this.invalidateCache();
      } catch (e) {
        console.error('[SQLite] Write failed:', e);
      } finally {
        this.isWriting = false;
        this.processWriteQueue();
      }
    });

    if (!this.isWriting) {
      this.processWriteQueue();
    }
  }

  private processWriteQueue(): void {
    if (this.writeQueue.length === 0 || this.isWriting) return;
    
    this.isWriting = true;
    const writeFn = this.writeQueue.shift();
    if (writeFn) {
      // Use setImmediate to batch multiple writes
      setImmediate(writeFn);
    }
  }

  query(sql: string, params: any[] = []): any[] {
    // Generate cache key
    const cacheKey = this.generateCacheKey(sql, params);
    
    // Check cache first
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    let result: any[];
    
    // Optimized query parsing with better pattern matching
    if (sql.includes('SELECT * FROM content WHERE type = ?')) {
      result = this.data.filter(item => item.type === params[0]);
    } else if (sql.includes('SELECT * FROM content WHERE id = ?')) {
      result = this.data.filter(item => item.id === params[0]);
    } else if (sql.includes('SELECT COUNT(*) FROM content')) {
      result = [{ count: this.data.length }];
    } else if (sql.includes('SELECT * FROM content ORDER BY')) {
      const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)/i);
      if (orderMatch) {
        const [, field, direction] = orderMatch;
        result = [...this.data].sort((a, b) => {
          const comparison = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
          return direction.toUpperCase() === 'DESC' ? -comparison : comparison;
        });
      } else {
        result = [...this.data];
      }
    } else {
      result = [...this.data];
    }

    // Cache the result
    this.cacheResult(cacheKey, result);

    return result;
  }

  execute(sql: string, params: any[] = []): void {
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
    } else if (sql.includes('UPDATE content SET')) {
      const idParamIndex = sql.indexOf('WHERE id = ?');
      if (idParamIndex !== -1) {
        const id = params[params.length - 1];
        const updates = params.slice(0, params.length - 1);
        const item = this.data.find(item => item.id === id);
        if (item) {
          Object.assign(item, ...updates);
          item.updated_at = new Date().toISOString();
          this.save();
        }
      }
    } else if (sql.includes('DELETE FROM content WHERE id = ?')) {
      const id = params[0];
      const initialLength = this.data.length;
      this.data = this.data.filter(item => item.id !== id);
      if (this.data.length < initialLength) {
        this.save();
      }
    }
  }

  private generateCacheKey(sql: string, params: any[]): string {
    const paramsHash = JSON.stringify(params);
    return `${sql}::${paramsHash}`;
  }

  private cacheResult(key: string, result: any[]): void {
    // Evict oldest entries if cache is full
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) {
        this.queryCache.delete(oldestKey);
      }
    }

    this.queryCache.set(key, {
      sql: '',
      paramsHash: '',
      result,
      timestamp: Date.now()
    });
  }

  private invalidateCache(): void {
    this.queryCache.clear();
  }

  /**
   * Get database statistics
   */
  getStats(): { totalRecords: number; cacheSize: number; queueLength: number } {
    return {
      totalRecords: this.data.length,
      cacheSize: this.queryCache.size,
      queueLength: this.writeQueue.length
    };
  }

  /**
   * Compact the database by removing old entries (optional cleanup)
   */
  compact(maxAge?: number): number {
    if (!maxAge) return 0;
    
    const cutoff = Date.now() - maxAge;
    const initialLength = this.data.length;
    
    this.data = this.data.filter(item => {
      const itemTime = new Date(item.created_at).getTime();
      return itemTime > cutoff;
    });
    
    const removed = initialLength - this.data.length;
    if (removed > 0) {
      this.save();
    }
    
    return removed;
  }
}
