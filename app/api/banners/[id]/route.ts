import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await _.json();
  const { imageUrl, fact, destination, position } = body;
  const updated = await prisma.bannerSlide.update({ where: { id }, data: { imageUrl, fact, destination, position } });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.bannerSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} 