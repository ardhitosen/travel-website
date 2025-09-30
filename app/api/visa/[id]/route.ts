import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  const data = await req.json();
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  // Only allow known fields; ensure destination is stored as string
  const { name, description, duration, processingTime, price, validity, requirements, documents, destination, imageUrl } = data as any;
  const updateData: any = {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(duration !== undefined ? { duration } : {}),
    ...(processingTime !== undefined ? { processingTime } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(validity !== undefined ? { validity } : {}),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
    ...(requirements !== undefined ? { requirements } : {}),
    ...(documents !== undefined ? { documents } : {}),
    ...(destination !== undefined ? { destination } : {}),
  };
  const updated = await prisma.visaType.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  // delete dependent visa applications first to avoid FK constraint errors
  try {
    await prisma.visaApplication.deleteMany({ where: { visaTypeId: id } });
  } catch (e) {
    // non-fatal, continue to delete visaType
  }
  await prisma.visaType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
