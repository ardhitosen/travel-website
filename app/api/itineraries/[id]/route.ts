import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  const data = await req.json();
  const updated = await prisma.itinerary.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  await prisma.itinerary.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}