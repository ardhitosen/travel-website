import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from 'path';
import { unlink } from 'fs/promises';

type PRAGMARow = Record<string, unknown>;

export async function DELETE(req: Request, context: { params?: { id?: string } } | undefined) {
  const params = context?.params;
  const id = Number(params?.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const cols = (await prisma.$queryRawUnsafe("PRAGMA table_info('Promotion')")) as PRAGMARow[] | unknown;
    const existingCols = Array.isArray(cols) ? cols.map((c) => String(c['name'])) : [];
    if (!existingCols || existingCols.length === 0) return NextResponse.json({ error: 'Promotion table not found' }, { status: 500 });

    const candidateCols = ['id', 'imageUrl', 'title', 'description', 'position', 'createdAt', 'updatedAt'];
    const selectCols = candidateCols.filter((c) => existingCols.includes(c)).map((c) => `"${c}"`);
    const selectSql = `SELECT ${selectCols.join(', ')} FROM "Promotion" WHERE "id" = ${Number(id)} LIMIT 1`;
    const rows = (await prisma.$queryRawUnsafe(selectSql)) as unknown[];
    const existingRow = Array.isArray(rows) && rows.length ? rows[0] as Record<string, unknown> : null;
    if (!existingRow) return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });

    // remove file if present
    try {
      const img = existingRow['imageUrl'];
      if (typeof img === 'string' && img) {
        const possible = img.replace(/^\/+/, '');
        const filepath = join(process.cwd(), 'public', possible);
        try { await unlink(filepath); } catch (err) { console.warn('Could not unlink file', filepath, err); }
      }
    } catch (e) {
      console.error('Error removing promotion image:', String(e));
    }

    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "Promotion" WHERE "id" = ${Number(id)}`);
    } catch (err: unknown) {
      console.error('Error deleting promotion (raw):', String(err));
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('Error during promotion delete flow:', String(err));
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
