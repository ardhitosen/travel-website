import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);  // Parsing id to number
  const body = await req.json(); // Parsing the request body
  const { imageUrl, fact, destination, position } = body;

  // Updating the banner slide
  const updated = await prisma.bannerSlide.update({
    where: { id },
    data: { imageUrl, fact, destination, position },
  });

  return NextResponse.json(updated);  // Returning updated data
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);  // Parsing id to number
  await prisma.bannerSlide.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });  // Returning success response
}
