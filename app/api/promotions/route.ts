import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  try {
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('Promotion')");
    const existing = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
    if (!existing || existing.length === 0) return NextResponse.json([]);
    const candidateCols = ['id','imageUrl','title','description','position','createdAt','updatedAt'];
    const selectCols = candidateCols.filter(c => existing.includes(c)).map(c => `"${c}"`);
    const sql = `SELECT ${selectCols.join(', ')} FROM "Promotion" ORDER BY "position" ASC LIMIT 2`;
    const rows: any[] = await prisma.$queryRawUnsafe(sql);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching promotions from DB:', err?.message || err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, title, description, position } = body || {};
    let data: any = {};
    try {
      const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('Promotion')");
      const existing = cols.map(c => String(c.name).toLowerCase());
      if (existing.includes('imageurl')) data.imageUrl = imageUrl || '';
      if (existing.includes('title') && title != null) data.title = title;
      if (existing.includes('description') && description != null) data.description = description;
      if (existing.includes('position')) data.position = position ?? 0;
    } catch (e) {
      data = { imageUrl: imageUrl || '', title: title || null, description: description || null, position: position ?? 0 };
    }
    try {
      // Use raw SQL insert via Prisma's $executeRawUnsafe. This avoids needing
      // the generated `prisma.promotion` property until Prisma Client is
      // regenerated after running migrations.
      const tableInfo: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('Promotion')");
      const existingCols = tableInfo.map(c => String(c.name));
      const desired = Object.keys(data || {});
      if (existingCols.includes('createdAt') && !desired.includes('createdAt')) desired.push('createdAt');
      if (existingCols.includes('updatedAt') && !desired.includes('updatedAt')) desired.push('updatedAt');
      const insertCols = desired.filter(c => existingCols.includes(c));
      if (insertCols.length === 0) return NextResponse.json({ error: 'No valid columns to insert' }, { status: 400 });
      const quotedCols = insertCols.map(c => `"${c}"`).join(', ');
      const valuesParts = insertCols.map(c => {
        if ((c === 'createdAt' || c === 'updatedAt') && existingCols.includes(c)) return 'CURRENT_TIMESTAMP';
        const v = (data as any)[c];
        return JSON.stringify(v === undefined ? null : v);
      });
      const insertSql = `INSERT INTO "Promotion" (${quotedCols}) VALUES (${valuesParts.join(', ')})`;
      await prisma.$executeRawUnsafe(insertSql);
      const selectCols = insertCols.map(c => `"${c}"`).join(', ');
      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT ${selectCols} FROM "Promotion" ORDER BY "id" DESC LIMIT 1`);
      return NextResponse.json(rows[0] || null, { status: 201 });
    } catch (innerErr: any) {
      console.error('Raw INSERT fallback for promotion failed:', innerErr);
      return NextResponse.json({ error: String(innerErr) }, { status: 500 });
    }
  } catch (err) {
    console.error('Error creating promotion:', err);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
