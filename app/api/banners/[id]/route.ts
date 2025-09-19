import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// Allow flexible context param coming from Next's route handler runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, context: any) {
  const params = context?.params as { id: string } | undefined;
  const id = Number(params?.id);
  const body = await req.json();
  const { imageUrl, fact, destination, position } = body;

  const updated = await prisma.bannerSlide.update({
    where: { id },
    data: { imageUrl, fact, destination, position },
  });

  return NextResponse.json(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: Request, context: any) {
  const params = context?.params as { id: string } | undefined;
  const id = Number(params?.id);
  await prisma.bannerSlide.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
