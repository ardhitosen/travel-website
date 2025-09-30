const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) { console.error('open error', err); process.exit(1); }
  db.all("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY name", (err, rows) => {
    if (err) { console.error('query err', err); process.exit(1); }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
});
