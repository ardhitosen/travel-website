import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV === "development") {
    // Use mock data in development
    const { itineraries } = await import("../../../mockData/itineraries");
    return NextResponse.json(itineraries);
  }
  const itineraries = await prisma.itinerary.findMany({ include: { days: true, destination: true } });
  return NextResponse.json(itineraries);
}

export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.itinerary.create({ data });
  return NextResponse.json(created, { status: 201 });
} 