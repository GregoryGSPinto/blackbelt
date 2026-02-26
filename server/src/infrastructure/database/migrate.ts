/**
 * Migration Runner — Aplica SQL migrations em ordem.
 *
 * Uso:
 *   npx ts-node server/src/infrastructure/database/migrate.ts
 *
 * Ou via npm script:
 *   npm run db:migrate
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { Pool } from 'pg';

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });

  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Get already applied
  const applied = await pool.query('SELECT name FROM _migrations ORDER BY name');
  const appliedSet = new Set(applied.rows.map((r: any) => r.name));

  // Get migration files
  const migrationsDir = resolve(__dirname, '../../../../server/migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  ⏭️  ${file} (already applied)`);
      continue;
    }

    console.log(`  📦 Applying ${file}...`);
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');

    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      console.log(`  ✅ ${file} applied`);
      count++;
    } catch (err: any) {
      console.error(`  ❌ ${file} failed:`, err.message);
      await pool.end();
      process.exit(1);
    }
  }

  console.log(`\n  Done. ${count} migration(s) applied.`);
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
