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
  // Temporarily avoid selecting nested `days` to prevent errors when production DB
  // hasn't had the new columns applied yet (P2022). Re-enable after migrations.
  const itineraries = await prisma.itinerary.findMany({ include: { destination: true } });
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
  const raw = await req.json().catch(() => ({}));
  try {
    // body may include: name, slug, city, duration, price, imageUrl, description, highlights, destinationId, days: [{ dayNumber, activities: [] }]
    const body = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
    const days = Array.isArray(body.days) ? body.days as unknown[] : undefined;
    const destinationId = body.destinationId;
    const highlights = body.highlights;
    const rest = Object.assign({}, body);
    delete (rest as Record<string, unknown>).days;
    delete (rest as Record<string, unknown>).destinationId;
    delete (rest as Record<string, unknown>).highlights;

    const data: Record<string, unknown> = { ...rest };
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
      // Accept either legacy { activities: [] } or new { title, description, imageUrl } shape
      const mappedDays = days.map((d) => {
        const obj = typeof d === 'object' && d !== null ? d as Record<string, unknown> : {};
        const dayNumber = Number(obj.dayNumber ?? obj.day ?? 0) || 0;
        const activities = Array.isArray(obj.activities) ? obj.activities : [];
        const title = typeof obj.title === 'string' ? obj.title : undefined;
        const description = typeof obj.description === 'string' ? obj.description : undefined;
        const imageUrl = typeof obj.imageUrl === 'string' ? obj.imageUrl : undefined;
  const createObj: Record<string, unknown> = { dayNumber };
  // Always include activities (may be empty) to satisfy Prisma validation when the column exists
  createObj.activities = activities;
        if (title) createObj.title = title;
        if (description) createObj.description = description;
        if (imageUrl) createObj.imageUrl = imageUrl;
        return createObj;
      });
      (data as Record<string, unknown>).days = { create: mappedDays };
    }

  // cast through unknown to avoid explicit `any` while keeping runtime behavior
  const created = await (prisma as unknown as { itinerary: { create: (args: { data: Record<string, unknown> }) => Promise<unknown> } }).itinerary.create({ data: data });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Failed to create itinerary', err);
    return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
  }
} 