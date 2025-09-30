import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET(req: Request) {
  // Allow forcing mock data via query or environment variable.
  // Default behavior: use real DB data. To get mock data, request /api/itineraries?mock=true
  const url = new URL(req.url);
  const preferMock = url.searchParams.get('mock') === 'true' || process.env.USE_MOCK_DATA === 'true';

  if (preferMock) {
    const { itineraries } = await import("../../../mockData/itineraries");
    return NextResponse.json(itineraries);
  }

  try {
    const itineraries = await prisma.itinerary.findMany({ include: { days: true, destination: true } });
    return NextResponse.json(itineraries);
  } catch (err) {
    // In development, fall back to mock data so the dev server doesn't break for local contributors
    if (process.env.NODE_ENV === 'development') {
      try {
        const { itineraries } = await import("../../../mockData/itineraries");
        return NextResponse.json(itineraries);
      } catch (e) {
        console.error('Failed to load mock itineraries fallback', e);
      }
    }
    console.error('Failed to fetch itineraries from DB', err);
    return NextResponse.json({ error: 'Failed to fetch itineraries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  try {
    // body may include: name, slug, city, duration, price, imageUrl, description, highlights, destinationId, days: [{ dayNumber, activities: [] }]
    const {
      days,
      destinationId,
      highlights,
      ...rest
    } = body as any;

  const data: any = { ...rest };
  // ensure required fields have defaults when not provided by the client
  if (typeof data.description === 'undefined') data.description = '';
  if (typeof data.imageUrl === 'undefined') data.imageUrl = '';
    if (typeof highlights !== 'undefined') data.highlights = highlights;

    // Destination is required and must be provided by id (relation)
    if (destinationId) {
      data.destination = { connect: { id: Number(destinationId) } };
    } else {
      return NextResponse.json({ error: 'destinationId is required' }, { status: 400 });
    }

    // create nested days if provided
    if (Array.isArray(days) && days.length) {
      data.days = { create: days.map((d: any) => ({ dayNumber: d.dayNumber ?? d.day ?? 0, activities: d.activities || [] })) };
    }

    const created = await prisma.itinerary.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Failed to create itinerary', err);
    return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
  }
} 