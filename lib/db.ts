import Database from "better-sqlite3";
import { readFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

let dbInstance: Database.Database | null = null;

/**
 * Returns a singleton better-sqlite3 database connection.
 * Opens (or creates) `data/flappy.db` and runs any pending migrations
 * from `db/migrations/`.
 */
export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  // Ensure the data directory exists
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = join(dataDir, "flappy.db");
  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");

  runMigrations(dbInstance);

  return dbInstance;
}

/**
 * Executes all `.sql` files in `db/migrations/` in alphabetical order.
 * Uses a `schema_migrations` tracking table to avoid re-running.
 */
function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const migrationsDir = join(process.cwd(), "db", "migrations");
  if (!existsSync(migrationsDir)) return;

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const insertMigration = db.prepare(
    "INSERT INTO schema_migrations (filename) VALUES (?)"
  );

  for (const file of files) {
    const already = db
      .prepare("SELECT 1 FROM schema_migrations WHERE filename = ?")
      .get(file);
    if (already) continue;

    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    db.exec(sql);
    insertMigration.run(file);
  }
}
