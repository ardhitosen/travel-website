import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// Helper function to determine if param is numeric ID or name
function isNumericId(param: string): boolean {
  return !isNaN(Number(param));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, context: any) {
  const params = context?.params as { param: string } | undefined;
  const param = params?.param ?? '';

  let destination;
  if (isNumericId(param)) {
    // Search by ID
    destination = await prisma.destination.findUnique({
      where: { id: Number(param) },
      include: { itineraries: { include: { days: true } }, gallery: true }
    });
  } else {
    // Search by name
    destination = await prisma.destination.findFirst({
      where: { name: { equals: param } },
      include: { itineraries: { include: { days: true } }, gallery: true }
    });
  }

  if (!destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
  }

  return NextResponse.json(destination);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, context: any) {
  const params = context?.params as { param: string } | undefined;
  const param = params?.param ?? '';
  const data = await req.json();

  let updated;
  if (isNumericId(param)) {
    // Update by ID
    updated = await prisma.destination.update({ 
      where: { id: Number(param) }, 
      data 
    });
  } else {
    // Update by name
    updated = await prisma.destination.updateMany({ 
      where: { name: { equals: param } }, 
      data 
    });
  }

  return NextResponse.json(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_: Request, context: any) {
  const params = context?.params as { param: string } | undefined;
  const param = params?.param ?? '';

  if (isNumericId(param)) {
    // Delete by ID
    await prisma.destination.delete({ where: { id: Number(param) } });
  } else {
    // Delete by name
    await prisma.destination.deleteMany({ 
      where: { name: { equals: param } } 
    });
  }

  return NextResponse.json({ ok: true });
}
