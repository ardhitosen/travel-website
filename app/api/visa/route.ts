import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

type PRAGMARow = Record<string, unknown>;

function rowName(row: PRAGMARow) {
  // PRAGMA returns rows with a `name` property; be defensive and coerce safely
  return String(row["name"] ?? row["Name"] ?? "");
}

function safeString(v: unknown) {
  return String(v ?? "");
}

function toStringArray(v: unknown) {
  if (Array.isArray(v)) return v.map((x) => String(x));
  const s = String(v ?? "");
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export async function GET() {
  try {
    // Inspect DB to ensure the VisaType table exists and select only existing columns
    const cols = (await prisma.$queryRawUnsafe("PRAGMA table_info('VisaType')")) as PRAGMARow[] | unknown;
    const existing = Array.isArray(cols) ? cols.map(rowName) : [];
    if (!existing || existing.length === 0) throw new Error("VisaType table missing");

    const candidateCols = [
      "id",
      "name",
      "description",
      "duration",
      "processingTime",
      "price",
      "imageUrl",
      "requirements",
      "documents",
      "validity",
      "destination",
      "createdAt",
      "updatedAt",
    ];
    const selectCols = candidateCols.filter((c) => existing.includes(c)).map((c) => `"${c}"`);
    const sql = `SELECT ${selectCols.join(", ")} FROM "VisaType" ORDER BY "id" ASC`;
    const rows = (await prisma.$queryRawUnsafe(sql)) as unknown[];
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error("Failed to load visas (fallback):", (err as Error)?.message ?? String(err));
    // fall back to empty list rather than error so admin UI can still render
    return NextResponse.json([]);
  }
}

type VisaCreateBody = {
  name?: unknown;
  description?: unknown;
  duration?: unknown;
  processingTime?: unknown;
  price?: unknown;
  validity?: unknown;
  requirements?: unknown;
  documents?: unknown;
  destination?: unknown;
  imageUrl?: unknown;
};

export async function POST(req: Request) {
  try {
    // Ensure the VisaType table exists before attempting Prisma create. If the
    // table is missing, return a helpful error so the caller can run migrations.
    try {
      const check = (await prisma.$queryRawUnsafe("PRAGMA table_info('VisaType')")) as PRAGMARow[] | unknown;
      if (!Array.isArray(check) || check.length === 0) {
        return NextResponse.json({ error: 'VisaType table does not exist. Please run migrations: npx prisma migrate reset --force' }, { status: 500 });
      }
    } catch (e: unknown) {
      console.error("Error checking VisaType table existence:", String(e));
      return NextResponse.json({ error: 'Could not verify VisaType table. Please ensure migrations are applied.' }, { status: 500 });
    }

    const body = (await req.json()) as VisaCreateBody | unknown;
    const name = safeString((body as VisaCreateBody)?.name);
    const description = safeString((body as VisaCreateBody)?.description);
    const duration = safeString((body as VisaCreateBody)?.duration);
    const processingTime = safeString((body as VisaCreateBody)?.processingTime);
    const price = safeString((body as VisaCreateBody)?.price);
    const validity = safeString((body as VisaCreateBody)?.validity);
    const requirements = toStringArray((body as VisaCreateBody)?.requirements);
    const documents = toStringArray((body as VisaCreateBody)?.documents);
    const destination = safeString((body as VisaCreateBody)?.destination);
    const imageUrlRaw = (body as VisaCreateBody)?.imageUrl;
    const imageUrl = imageUrlRaw === null || imageUrlRaw === undefined ? undefined : String(imageUrlRaw);

    const createData = {
      name,
      description,
      duration,
      processingTime,
      price,
      imageUrl,
      validity,
      requirements,
      documents,
      destination: destination || "",
    } as Record<string, unknown>;

    // Now attempt create with Prisma (table exists). If create fails due to
    // column mismatch, we'll attempt a raw INSERT fallback afterwards.
    try {
      // rely on Prisma to do the correct typing at runtime; keep the data
      // The Prisma client may not expose `visaType` in its TS type on older schemas.
      // Use a safe typed lookup (no `any`) so ESLint stays happy while preserving runtime behavior.
      const clientWithCreate = prisma as unknown as Record<
        string,
        { create: (args: { data: Record<string, unknown> }) => Promise<unknown> }
      >;
      const created = await clientWithCreate["visaType"].create({ data: createData });
      return NextResponse.json(created, { status: 201 });
    } catch (innerErr: unknown) {
      console.error('Prisma create failed for VisaType, attempting raw fallback:', (innerErr as Error)?.message ?? String(innerErr));
      // Try a raw INSERT using only existing columns
      const cols = (await prisma.$queryRawUnsafe("PRAGMA table_info('VisaType')")) as PRAGMARow[] | unknown;
      const existing = Array.isArray(cols) ? cols.map(rowName) : [];
      const desired = [
        'name',
        'description',
        'duration',
        'processingTime',
        'price',
        'imageUrl',
        'requirements',
        'documents',
        'validity',
        'destination',
      ].filter((c) => existing.includes(c));
      if (desired.length === 0) {
        console.error('No compatible columns available for raw insert');
        return NextResponse.json({ error: 'Failed to create visa: incompatible DB schema' }, { status: 500 });
      }
      const quoted = desired.map((c) => `"${c}"`).join(', ');
      const values = desired
        .map((c) => {
          const v = createData[c];
          if ((c === 'requirements' || c === 'documents') && v !== undefined) return JSON.stringify(v);
          return JSON.stringify(v === undefined ? null : v);
        })
        .join(', ');
      const insertSql = `INSERT INTO "VisaType" (${quoted}) VALUES (${values})`;
      try {
        await prisma.$executeRawUnsafe(insertSql);
        const rows = (await prisma.$queryRawUnsafe(`SELECT ${quoted} FROM "VisaType" ORDER BY "id" DESC LIMIT 1`)) as unknown[];
        return NextResponse.json(rows[0] || null, { status: 201 });
      } catch (fallbackErr: unknown) {
        console.error('Raw INSERT fallback for VisaType failed:', String(fallbackErr));
        return NextResponse.json({ error: 'Failed to create visa' }, { status: 500 });
      }
    }
  } catch (err: unknown) {
    console.error('Failed to create visa', String(err));
    return NextResponse.json({ error: 'Failed to create visa' }, { status: 500 });
  }
}