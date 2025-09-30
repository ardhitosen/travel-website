const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPaths = [path.resolve(__dirname, '../prisma/dev.db'), path.resolve(__dirname, '../prisma/prisma/dev.db')];

function listTables(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      if (err) { db.close(); return reject(err); }
      resolve({ dbPath, tables: rows.map(r => r.name) });
      db.close();
    });
  });
}

(async () => {
  for (const p of dbPaths) {
    try {
      const res = await listTables(p);
      console.log('DB:', p);
      console.log('Tables:', res.tables);
    } catch (err) {
      console.error('Failed to read', p, err.message);
    }
  }
})();
