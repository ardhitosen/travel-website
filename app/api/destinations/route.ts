import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  try {
    // By default return DB-driven data. Use mock data only when explicitly requested.
    if (process.env.USE_MOCK_DATA === 'true') {
      const { destinations } = await import("../../../mockData/destinations");
      return NextResponse.json(destinations);
    }

    const destinations = await prisma.destination.findMany({
      include: { itineraries: { include: { days: true } }, gallery: true }
    });
    return NextResponse.json(destinations);
  } catch (err) {
    console.error('Failed to load destinations', err);
    return NextResponse.json({ error: 'Failed to load destinations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name = '', description = '', imageUrl = '', highlights = [], badge = '' } = body;
    const created = await prisma.destination.create({ data: { name, description, imageUrl, highlights, badge } });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('Failed to create destination', err);
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 });
  }
}
