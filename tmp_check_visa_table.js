const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) { console.error('open error', err); process.exit(1); }
  db.all("PRAGMA table_info('VisaType')", (err, rows) => {
    if (err) { console.error('pragma err', err); process.exit(1); }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
});
