import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// Helper function to determine if param is numeric ID or name
function isNumericId(param: string): boolean {
  return !isNaN(Number(param));
}

export async function GET(req: Request, { params }: { params: { param: string } }) {
  const { param } = params;
  
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

export async function PUT(req: Request, { params }: { params: { param: string } }) {
  const { param } = params;
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

export async function DELETE(_: Request, { params }: { params: { param: string } }) {
  const { param } = params;
  
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
