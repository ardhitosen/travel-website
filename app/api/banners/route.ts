import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  // By default return DB records. If you explicitly want mock data set USE_MOCK_DATA=true
  if (process.env.USE_MOCK_DATA === 'true') {
    const { banners } = await import("../../../mockData/banners");
    return NextResponse.json(banners);
  }

  // Inspect the DB table columns first and only select columns that exist to avoid Prisma P2022
  try {
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
    const existing = cols.map(c => String(c.name));
    if (!Array.isArray(existing) || existing.length === 0) throw new Error('BannerSlide table missing');

    const candidateCols = ['id','imageUrl','fact','title','description','destination','position','createdAt','updatedAt'];
    const selectCols = candidateCols.filter(c => existing.includes(c)).map(c => `"${c}"`);
    const sql = `SELECT ${selectCols.join(', ')} FROM "BannerSlide" ORDER BY "position" ASC`;
    const rows: any[] = await prisma.$queryRawUnsafe(sql);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error fetching banners from DB, falling back to mock data:', err?.message || err);
    try {
      const { banners } = await import("../../../mockData/banners");
      return NextResponse.json(banners, { status: 200 });
    } catch (e) {
      console.error('Failed to load mock banners as fallback:', e);
      return NextResponse.json({ error: 'Failed to load banners' }, { status: 500 });
    }
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  // Prisma model requires non-null strings for imageUrl, fact, destination.
  const { imageUrl: rawImageUrl, fact: rawFact, destination: rawDestination, position, title, description } = body || {};
  const imageUrl = rawImageUrl ?? '';
  const fact = rawFact ?? '';
  const destination = rawDestination ?? '';
  const titleStr = title ?? null;
  const descStr = description ?? null;
  try {
    // Inspect DB columns at runtime and only set fields that exist in the table.
    let data: any = {};
    try {
      const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
      const existing = cols.map(c => String(c.name).toLowerCase());
      if (existing.includes('imageurl')) data.imageUrl = imageUrl;
      if (existing.includes('fact')) data.fact = fact;
      if (existing.includes('destination')) data.destination = destination;
      if (existing.includes('position')) data.position = position ?? 0;
      if (existing.includes('title') && titleStr !== null) data.title = titleStr;
      if (existing.includes('description') && descStr !== null) data.description = descStr;
    } catch (e) {
      // If PRAGMA fails for any reason, fall back to conservative fields only
      data = { imageUrl, fact, destination, position: position ?? 0 };
    }

    try {
      const created = await prisma.bannerSlide.create({ data: data as any });
      return NextResponse.json(created, { status: 201 });
    } catch (innerErr: any) {
      console.error('Prisma create failed, attempting raw INSERT fallback:', innerErr?.message || innerErr);
      const code = innerErr?.code;
      if (code === 'P2022' || code === 'P2021' || String(innerErr?.message).includes('does not exist')) {
        // Re-inspect table columns and build an INSERT using only columns that exist.
        try {
          const tableInfo: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('BannerSlide')");
          const existingCols = tableInfo.map(c => String(c.name));
          // ensure we at least insert required fields that exist
          const desired = Object.keys(data || {});
          // include createdAt/updatedAt if present in table so NOT NULL constraints are satisfied
          if (existingCols.includes('createdAt') && !desired.includes('createdAt')) desired.push('createdAt');
          if (existingCols.includes('updatedAt') && !desired.includes('updatedAt')) desired.push('updatedAt');

          const insertCols = desired.filter(c => existingCols.includes(c));
          if (insertCols.length === 0) return NextResponse.json({ error: 'No valid columns to insert' }, { status: 400 });

          const quotedCols = insertCols.map(c => `"${c}"`).join(', ');
          const valuesParts = insertCols.map(c => {
            if ((c === 'createdAt' || c === 'updatedAt') && existingCols.includes(c)) {
              return 'CURRENT_TIMESTAMP';
            }
            const v = (data as any)[c];
            return JSON.stringify(v === undefined ? null : v);
          });
          const insertSql = `INSERT INTO "BannerSlide" (${quotedCols}) VALUES (${valuesParts.join(', ')})`;
          await prisma.$executeRawUnsafe(insertSql);
          // select the inserted row; include only columns we inserted that exist
          const selectCols = insertCols.map(c => `"${c}"`).join(', ');
          const rows: any[] = await prisma.$queryRawUnsafe(`SELECT ${selectCols} FROM "BannerSlide" ORDER BY "id" DESC LIMIT 1`);
          return NextResponse.json(rows[0] || null, { status: 201 });
        } catch (fallbackErr) {
          console.error('Raw INSERT fallback failed:', fallbackErr);
          throw fallbackErr;
        }
      }
      throw innerErr;
    }
  } catch (err: any) {
    console.error('Error creating banner (final):', err?.message || err);
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ error: (err as Error).message || String(err) }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
