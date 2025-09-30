import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from 'path';
import { unlink } from 'fs/promises';

// Allow flexible context param coming from Next's route handler runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, context: any) {
  const params = context?.params as { id: string } | undefined;
  const id = Number(params?.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const body = await req.json();
  const { imageUrl, fact, destination, position, title, description } = body;

  // Instead of using Prisma's typed findUnique/update (which will fail if
  // the runtime DB schema differs from the Prisma schema), inspect the
  // actual table columns via PRAGMA and perform a raw SELECT/UPDATE using
  // only columns that exist. This avoids P2022 errors when columns like
  // `title`/`description` are missing from the DB.
  try {
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
    const existingCols = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
    if (!existingCols || existingCols.length === 0) return NextResponse.json({ error: 'BannerSlide table not found' }, { status: 500 });

    // Select only columns that exist
    const candidateCols = ['id','imageUrl','fact','title','description','destination','position','createdAt','updatedAt'];
    const selectCols = candidateCols.filter(c => existingCols.includes(c)).map(c => `"${c}"`);
    const sql = `SELECT ${selectCols.join(', ')} FROM "BannerSlide" WHERE "id" = ${Number(id)} LIMIT 1`;
    const rows: any[] = await prisma.$queryRawUnsafe(sql);
    const existingRow = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!existingRow) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });

    // Build list of columns to update (only those that exist)
    const updateMap: Record<string, any> = {};
    if (existingCols.map(s => s.toLowerCase()).includes('imageurl') && imageUrl !== undefined) updateMap.imageUrl = imageUrl;
    if (existingCols.map(s => s.toLowerCase()).includes('fact') && fact !== undefined) updateMap.fact = fact;
    if (existingCols.map(s => s.toLowerCase()).includes('destination') && destination !== undefined) updateMap.destination = destination;
    if (existingCols.map(s => s.toLowerCase()).includes('position') && position !== undefined) updateMap.position = position;
    // Only include title/description if those columns actually exist AND values provided
    if (existingCols.includes('title') && title !== undefined) updateMap.title = title;
    if (existingCols.includes('description') && description !== undefined) updateMap.description = description;

    // If nothing to update, return the existing row
    if (Object.keys(updateMap).length === 0) return NextResponse.json(existingRow);

    // Build a safe-ish raw UPDATE using JSON.stringify for values and set updatedAt if present
    const setParts: string[] = [];
    for (const k of Object.keys(updateMap)) {
      const val = updateMap[k];
      setParts.push(`"${k}" = ${JSON.stringify(val === undefined ? null : val)}`);
    }
    if (existingCols.includes('updatedAt')) setParts.push(`"updatedAt" = CURRENT_TIMESTAMP`);

    const updateSql = `UPDATE "BannerSlide" SET ${setParts.join(', ')} WHERE "id" = ${Number(id)}`;
    await prisma.$executeRawUnsafe(updateSql);

    // Return the updated row (select same columns as before)
    const afterRows: any[] = await prisma.$queryRawUnsafe(sql);
    return NextResponse.json(afterRows[0] || null);
  } catch (err) {
    console.error('Error updating banner (raw path):', err);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: Request, context: any) {
  const params = context?.params as { id: string } | undefined;
  const id = Number(params?.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  // Try to find the existing row using a raw SELECT that only asks for
  // columns that actually exist. This avoids Prisma's typed findUnique
  // which will error with P2022 when the DB schema differs.
  try {
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
    const existingCols = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
    if (!existingCols || existingCols.length === 0) return NextResponse.json({ error: 'BannerSlide table not found' }, { status: 500 });

    const candidateCols = ['id','imageUrl','fact','title','description','destination','position','createdAt','updatedAt'];
    const selectCols = candidateCols.filter(c => existingCols.includes(c)).map(c => `"${c}"`);
    const selectSql = `SELECT ${selectCols.join(', ')} FROM "BannerSlide" WHERE "id" = ${Number(id)} LIMIT 1`;
    const rows: any[] = await prisma.$queryRawUnsafe(selectSql);
    const existingRow = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!existingRow) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });

    // Try to remove the file from disk if an imageUrl exists
    try {
      if (existingRow?.imageUrl) {
        const possible = String(existingRow.imageUrl).replace(/^\/+/, '');
        const filepath = join(process.cwd(), 'public', possible);
        try { await unlink(filepath); } catch (err) { console.warn('Could not unlink file', filepath, err); }
      }
    } catch (e) {
      console.error('Error while attempting to remove banner image:', e);
    }

    // Perform a raw DELETE so Prisma doesn't attempt a typed delete that
    // references missing columns on the model. Using raw SQL we only need
    // the table and id column to exist.
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "BannerSlide" WHERE "id" = ${Number(id)}`);
    } catch (err) {
      console.error('Error deleting banner record (raw):', err);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error during banner delete flow:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
