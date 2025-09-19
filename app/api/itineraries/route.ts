import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const itineraries = await prisma.itinerary.findMany({ include: { days: true, destination: true } });
  return NextResponse.json(itineraries);
}

export async function POST(req: Request) {
  const data = await req.json();
  const created = await prisma.itinerary.create({ data });
  return NextResponse.json(created, { status: 201 });
} 