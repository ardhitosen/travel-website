import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  try {
    // Inspect DB to ensure the VisaType table exists and select only existing columns
    const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('VisaType')");
    const existing = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
    if (!existing || existing.length === 0) throw new Error('VisaType table missing');

    const candidateCols = ['id','name','description','duration','processingTime','price','imageUrl','requirements','documents','validity','destination','createdAt','updatedAt'];
    const selectCols = candidateCols.filter(c => existing.includes(c)).map(c => `"${c}"`);
    const sql = `SELECT ${selectCols.join(', ')} FROM "VisaType" ORDER BY "id" ASC`;
    const rows: any[] = await prisma.$queryRawUnsafe(sql);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Failed to load visas (fallback):', err?.message || err);
    // fall back to empty list rather than error so admin UI can still render
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    // Ensure the VisaType table exists before attempting Prisma create. If the
    // table is missing, return a helpful error so the caller can run migrations.
    try {
      const check: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('VisaType')");
      if (!Array.isArray(check) || check.length === 0) {
        return NextResponse.json({ error: 'VisaType table does not exist. Please run migrations: npx prisma migrate reset --force' }, { status: 500 });
      }
    } catch (e) {
      console.error('Error checking VisaType table existence:', e);
      return NextResponse.json({ error: 'Could not verify VisaType table. Please ensure migrations are applied.' }, { status: 500 });
    }

    const body = await req.json();
    const {
      name = '',
      description = '',
      duration = '',
      processingTime = '',
      price = '',
      validity = '',
      requirements = [],
      documents = [],
      destination = '',
      imageUrl,
    } = body as any;

    const reqs = Array.isArray(requirements) ? requirements : String(requirements || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const docs = Array.isArray(documents) ? documents : String(documents || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    const createData: any = {
      name,
      description,
      duration,
      processingTime,
      price,
      imageUrl: imageUrl || undefined,
      validity,
      requirements: reqs as any,
      documents: docs as any,
      destination: destination || '',
    };

    // Now attempt create with Prisma (table exists). If create fails due to
    // column mismatch, we'll attempt a raw INSERT fallback afterwards.
    try {
      const created = await prisma.visaType.create({ data: createData });
      return NextResponse.json(created, { status: 201 });
    } catch (innerErr: any) {
      console.error('Prisma create failed for VisaType, attempting raw fallback:', innerErr?.message || innerErr);
      // Try a raw INSERT using only existing columns
      const cols: any[] = await prisma.$queryRawUnsafe("PRAGMA table_info('VisaType')");
      const existing = Array.isArray(cols) ? cols.map(c => String(c.name)) : [];
      const desired = ['name','description','duration','processingTime','price','imageUrl','requirements','documents','validity','destination'].filter(c => existing.includes(c));
      if (desired.length === 0) {
        console.error('No compatible columns available for raw insert');
        return NextResponse.json({ error: 'Failed to create visa: incompatible DB schema' }, { status: 500 });
      }
      const quoted = desired.map(c => `"${c}"`).join(', ');
      const values = desired.map(c => {
        const v = (createData as any)[c];
        if ((c === 'requirements' || c === 'documents') && v !== undefined) return JSON.stringify(v);
        return JSON.stringify(v === undefined ? null : v);
      }).join(', ');
      const insertSql = `INSERT INTO "VisaType" (${quoted}) VALUES (${values})`;
      try {
        await prisma.$executeRawUnsafe(insertSql);
        const rows: any[] = await prisma.$queryRawUnsafe(`SELECT ${quoted} FROM "VisaType" ORDER BY "id" DESC LIMIT 1`);
        return NextResponse.json(rows[0] || null, { status: 201 });
      } catch (fallbackErr) {
        console.error('Raw INSERT fallback for VisaType failed:', fallbackErr);
        return NextResponse.json({ error: 'Failed to create visa' }, { status: 500 });
      }
    }
  } catch (err) {
    console.error('Failed to create visa', err);
    return NextResponse.json({ error: 'Failed to create visa' }, { status: 500 });
  }
}