import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  const body = await req.json();
  try {
    const { days, destinationId, destinationName, highlights, ...rest } = body as any;

    // Build update payload (excluding days which are handled separately)
    const updatePayload: any = { ...rest };
    if (typeof highlights !== 'undefined') updatePayload.highlights = highlights;

    // Handle destination connect/disconnect
    if (destinationId) {
      updatePayload.destination = { connect: { id: Number(destinationId) } };
    } else if (destinationName) {
      const dest = await prisma.destination.findFirst({ where: { name: { equals: destinationName } } });
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
          await tx.itineraryDay.create({ data: { dayNumber: d.dayNumber ?? d.day ?? 0, activities: d.activities || [], itineraryId: id } });
        }
      }
      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Failed to update itinerary', err);
    return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_: Request, context: any) {
  const params = context?.params as { id?: string } | undefined;
  const id = Number(params?.id);
  if (Number.isNaN(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  // remove child days first to avoid foreign key constraint errors
  try {
    await prisma.itineraryDay.deleteMany({ where: { itineraryId: id } });
  } catch (e) {
    // ignore
  }
  try {
    await prisma.itinerary.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Prisma: P2025 = record not found
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
    }
    console.error('Failed to delete itinerary', err);
    return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 });
  }
}