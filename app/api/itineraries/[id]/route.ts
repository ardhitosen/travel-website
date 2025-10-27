import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type RouteContext = { params?: { id?: string } } | undefined;

export async function PUT(req: Request, context: RouteContext) {
  const params = context?.params;
  const id = Number(params?.id);
  const raw = await req.json().catch(() => ({}));
  try {
    const body = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
    const days = Array.isArray(body.days) ? body.days as unknown[] : undefined;
    const destinationId = body.destinationId;
    const destinationName = body.destinationName;
    const highlights = body.highlights;
    const rest = Object.assign({}, body);
    delete (rest as Record<string, unknown>).days;
    delete (rest as Record<string, unknown>).destinationId;
    delete (rest as Record<string, unknown>).destinationName;
    delete (rest as Record<string, unknown>).highlights;

    // Build update payload (excluding days which are handled separately)
    const updatePayload: Record<string, unknown> = { ...rest };
    if (typeof highlights !== 'undefined') updatePayload.highlights = highlights;

    // Handle destination connect/disconnect
    if (destinationId) {
      updatePayload.destination = { connect: { id: Number(destinationId) } };
    } else if (destinationName) {
      const dest = await prisma.destination.findFirst({ where: { name: { equals: String(destinationName) } } });
      if (dest) updatePayload.destination = { connect: { id: dest.id } };
    }

    // Perform update in a transaction: update main record, replace days
    const result = await prisma.$transaction(async (tx) => {
      // delete existing days
      await tx.itineraryDay.deleteMany({ where: { itineraryId: id } });
      // update itinerary
      const updated = await tx.itinerary.update({ where: { id }, data: updatePayload });
      // recreate days
      if (Array.isArray(days) && days.length) {
        for (const d of days) {
          const obj = typeof d === 'object' && d !== null ? d as Record<string, unknown> : {};
          const dayNumber = Number(obj.dayNumber ?? obj.day ?? 0) || 0;
          // Ensure activities is always present (default to empty array)
          const activities = Array.isArray(obj.activities) ? obj.activities : [];
          const title = typeof obj.title === 'string' ? obj.title : undefined;
          const description = typeof obj.description === 'string' ? obj.description : undefined;
          const imageUrl = typeof obj.imageUrl === 'string' ? obj.imageUrl : undefined;
          const createData: Record<string, unknown> = { dayNumber, itineraryId: id };
          // Always include activities (may be empty) to satisfy Prisma validation when column exists
          createData.activities = activities;
          if (title) createData.title = title;
          if (description) createData.description = description;
          if (imageUrl) createData.imageUrl = imageUrl;
          await tx.itineraryDay.create({ data: createData as any });
        }
      }
      return updated;
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Failed to update itinerary', String(err));
    return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const params = context?.params;
  const id = Number(params?.id);
  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  // remove child days first to avoid foreign key constraint errors
  try {
    await prisma.itineraryDay.deleteMany({ where: { itineraryId: id } });
  } catch {
    // ignore
  }
  try {
    await prisma.itinerary.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    // Prisma: P2025 = record not found
    const code = (err as Record<string, unknown>)['code'];
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    console.error('Failed to delete itinerary', String(err));
    return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 });
  }
}

export async function GET(_: Request, context: RouteContext) {
  const params = context?.params;
  const id = Number(params?.id);
  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    const itinerary = await prisma.itinerary.findUnique({ where: { id }, include: { days: true, destination: true } });
    if (!itinerary) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(itinerary);
  } catch (err) {
    console.error('Failed to fetch itinerary', err);
    return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
  }
}