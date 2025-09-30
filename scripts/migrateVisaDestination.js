/*
  migrateVisaDestination.js
  Usage (run locally):
    - Make a backup: this script will copy prisma/dev.db -> prisma/dev.db.bak
    - Then it will set VisaType.destination = Destination.name for records where destination is null/empty and destinationId is present
    - Requires sqlite3 package: npm install sqlite3

  Run:
    node scripts/migrateVisaDestination.js
*/
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// prefer nested prisma folder db if present (some environments have prisma/prisma/dev.db)
let dbPath = path.resolve(__dirname, '../prisma/dev.db');
const alt = path.resolve(__dirname, '../prisma/prisma/dev.db');
if (fs.existsSync(alt)) dbPath = alt;
const bakPath = dbPath + '.bak';

if (!fs.existsSync(dbPath)) {
  console.error('Database not found at', dbPath);
  process.exit(1);
}

console.log('Backing up', dbPath, '->', bakPath);
fs.copyFileSync(dbPath, bakPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Migrating VisaType.destination from destinationId...');
  db.run(`PRAGMA foreign_keys = OFF;`);
  // ensure destination column exists (SQLite allows ADD COLUMN)
  db.all(`PRAGMA table_info('VisaType')`, (tiErr, cols) => {
    if (tiErr) {
      console.error('Failed to read table info', tiErr);
      return finish();
    }
    const hasDestination = Array.isArray(cols) && cols.some(c => c && c.name === 'destination');
    const addAndProceed = () => {
      // For each visa that has destinationId, copy name if destination empty
      db.each(`SELECT id, destinationId, destination FROM VisaType WHERE destinationId IS NOT NULL`, (err, row) => {
        if (err) return console.error('select err', err);
        if (row.destination && String(row.destination).trim() !== '') return; // already has destination
        const destId = row.destinationId;
        db.get(`SELECT name FROM Destination WHERE id = ?`, [destId], (err2, destRow) => {
          if (err2) return console.error('dest lookup err', err2);
          if (!destRow) return console.warn('Destination not found for id', destId);
          const name = destRow.name || '';
          db.run(`UPDATE VisaType SET destination = ? WHERE id = ?`, [name, row.id], (uerr) => {
            if (uerr) console.error('update err', uerr);
            else console.log(`Updated VisaType ${row.id} -> destination='${name}'`);
          });
        });
      }, (e, n) => {
        if (e) console.error('iteration err', e);
        console.log('Done checking visa rows. You may want to run `npx prisma generate` if you changed schema.');
        db.run(`PRAGMA foreign_keys = ON;`);
        db.close();
      });
    };

    if (!hasDestination) {
      console.log('Adding missing column `destination` to VisaType...');
      db.run(`ALTER TABLE VisaType ADD COLUMN destination TEXT`, (aerr) => {
        if (aerr) console.error('Failed to add column', aerr);
        else console.log('Column added');
        addAndProceed();
      });
    } else {
      addAndProceed();
    }
  });
});

function finish() {
  try { db.run(`PRAGMA foreign_keys = ON;`); } catch (e) {};
  try { db.close(); } catch (e) {};
}
