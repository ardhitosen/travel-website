import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV === "development") {
    // Use mock data in development
    const { destinations } = await import("../../../mockData/destinations");
    return NextResponse.json(destinations);
  }
  const destinations = await prisma.destination.findMany({
    include: { itineraries: { include: { days: true } }, gallery: true }
  });
  return NextResponse.json(destinations);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, imageUrl, highlights, badge } = body;
  const created = await prisma.destination.create({ data: { name, description, imageUrl, highlights, badge } });
  return NextResponse.json(created, { status: 201 });
}
