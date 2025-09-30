import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type PutContext = { params?: { id?: string } } | undefined;

export async function PUT(req: Request, context: PutContext) {
  const params = context?.params;
  const id = Number(params?.id);
  const raw = (await req.json()) as unknown;
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  // Only allow known fields; ensure destination is stored as string
  const maybe = (obj: unknown) => (typeof obj === 'object' && obj !== null ? obj as Record<string, unknown> : {});
  const body = maybe(raw);
  const fields = [
    'name',
    'description',
    'duration',
    'processingTime',
    'price',
    'validity',
    'requirements',
    'documents',
    'destination',
    'imageUrl',
  ];
  const updateData = fields.reduce<Record<string, unknown>>((acc, f) => {
    if (body[f] !== undefined) acc[f] = body[f];
    return acc;
  }, {});
  const updated = await prisma.visaType.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: PutContext) {
  const params = context?.params;
  const id = Number(params?.id);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  // delete dependent visa applications first to avoid FK constraint errors
  try {
    await prisma.visaApplication.deleteMany({ where: { visaTypeId: id } });
  } catch {
    // non-fatal, continue to delete visaType
  }
  await prisma.visaType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
