import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = await req.json();
  const updated = await prisma.destination.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.destination.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} 