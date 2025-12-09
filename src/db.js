import * as SQLite from 'expo-sqlite';

const DB_NAME = 'app.db';
const MIGRATIONS_TABLE = '__migrations_applied_v1';
let _db = null;

function openDb() {
  if (!_db) _db = SQLite.openDatabase(DB_NAME);
  return _db;
}

function runQuery(sql, params = []) {
  const db = openDb();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      },
      (txErr) => reject(txErr)
    );
  });
}

function runStatements(statements = []) {
  const db = openDb();
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        for (const s of statements) {
          const sql = s.trim();
          if (!sql) continue;
          tx.executeSql(sql, [], undefined, (_, err) => {
            console.error('Statement error:', sql, err);
            return true;
          });
        }
      },
      (err) => reject(err),
      () => resolve()
    );
  });
}

export async function initializeDatabase(migrations = []) {
  // enable foreign keys
  try {
    await runQuery('PRAGMA foreign_keys = ON;');
  } catch (e) {
    console.warn('Could not set PRAGMA foreign_keys; continuing', e);
  }

  // create migrations table
  await runQuery(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (id TEXT PRIMARY KEY, applied_at TEXT);`
  );

  // get applied migrations
  const res = await runQuery(`SELECT id FROM ${MIGRATIONS_TABLE};`);
  const applied = new Set();
  if (res && res.rows && res.rows.length) {
    for (let i = 0; i < res.rows.length; i++) applied.add(res.rows.item(i).id);
  }

  for (const m of migrations) {
    if (!m || !m.id || !m.sql) continue;
    if (applied.has(m.id)) continue;
    const statements = m.sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s + ';');
    try {
      await runStatements(statements);
      await runQuery(
        `INSERT INTO ${MIGRATIONS_TABLE} (id, applied_at) VALUES (?, datetime('now'));`,
        [m.id]
      );
      console.log(`Migration applied: ${m.id}`);
    } catch (err) {
      console.error(`Failed to apply migration ${m.id}:`, err);
      throw err;
    }
  }
}

export async function verifySchema(expectedSchema = {}) {
  const report = { ok: true, details: {} };
  for (const table of Object.keys(expectedSchema)) {
    try {
      const pragmaRes = await runQuery(`PRAGMA table_info(${table});`);
      const existingCols = [];
      if (pragmaRes && pragmaRes.rows) {
        for (let i = 0; i < pragmaRes.rows.length; i++) existingCols.push(pragmaRes.rows.item(i).name);
      }
      const expectedCols = expectedSchema[table] || [];
      const missing = expectedCols.filter((c) => !existingCols.includes(c));
      const extra = existingCols.filter((c) => !expectedCols.includes(c));
      const exists = existingCols.length > 0;
      if (!exists || missing.length || extra.length) report.ok = false;
      report.details[table] = { exists, missingColumns: missing, extraColumns: extra, existingColumns: existingCols };
    } catch (err) {
      report.ok = false;
      report.details[table] = { exists: false, error: String(err) };
    }
  }
  return report;
}

export async function selectAll(sql, params = []) {
  const res = await runQuery(sql, params);
  const rows = [];
  if (res && res.rows) {
    for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
  }
  return rows;
}

export { openDb, runQuery };
export default { openDb, runQuery, initializeDatabase, verifySchema, selectAll };