const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../prisma/dev.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to open DB at', dbPath, err.message);
    process.exit(1);
  }
});

db.all("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error('Error querying sqlite_master:', err.message);
    process.exit(1);
  }
  console.log('Tables found:', rows.length);
  rows.forEach(r => {
    console.log('---');
    console.log('name:', r.name);
    console.log(r.sql);
  });
  db.close();
});
