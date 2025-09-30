import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from 'path';
import { unlink } from 'fs/promises';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('Promotion')");
    const existingCols = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
    if (!existingCols || existingCols.length === 0) return NextResponse.json({ error: 'Promotion table not found' }, { status: 500 });

    const candidateCols = ['id','imageUrl','title','description','position','createdAt','updatedAt'];
    const selectCols = candidateCols.filter(c => existingCols.includes(c)).map(c => `"${c}"`);
    const selectSql = `SELECT ${selectCols.join(', ')} FROM "Promotion" WHERE "id" = ${Number(id)} LIMIT 1`;
    const rows: any[] = await prisma.$queryRawUnsafe(selectSql);
    const existingRow = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!existingRow) return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });

    // remove file if present
    try {
      if (existingRow?.imageUrl) {
        const possible = String(existingRow.imageUrl).replace(/^\/+/, '');
        const filepath = join(process.cwd(), 'public', possible);
        try { await unlink(filepath); } catch (err) { console.warn('Could not unlink file', filepath, err); }
      }
    } catch (e) {
      console.error('Error removing promotion image:', e);
    }

    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "Promotion" WHERE "id" = ${Number(id)}`);
    } catch (err) {
      console.error('Error deleting promotion (raw):', err);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error during promotion delete flow:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
