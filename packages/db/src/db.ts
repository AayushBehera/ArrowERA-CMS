import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema/auth.schema';

/**
 * Drizzle ORM client bound to the ArrowERA auth/identity schema.
 *
 * The underlying `pg` Pool is created lazily on first use so that importing
 * `@arrowera/db` never requires a live database connection (or the optional
 * `pg` driver) at module-evaluation time. This keeps the client safe to import
 * from bundled/edge contexts where it is only referenced for its types.
 */
let instance: NodePgDatabase<typeof schema> | undefined;

function getDb(): NodePgDatabase<typeof schema> {
  if (!instance) {
    // Lazily require the optional `pg` driver only when the client is actually used.
    const { Pool } = require('pg') as typeof import('pg');
    const pool = new Pool(
      process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {}
    );
    instance = drizzle(pool, { schema });
  }
  return instance;
}

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {} as NodePgDatabase<typeof schema>,
  {
    get(_target, prop) {
      const target = getDb() as unknown as Record<string | symbol, unknown>;
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }
);

export type DB = NodePgDatabase<typeof schema>;
