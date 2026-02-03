import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

const parseId = (id: string) => {
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idNum = parseId(id);
  if (!idNum) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: idNum },
      include: { days: true, destination: true },
    });

    if (!itinerary) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(itinerary);
  } catch (err) {
    console.error("Failed to fetch itinerary", err);
    return NextResponse.json({ error: "Failed to fetch itinerary" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idNum = parseId(id);
  if (!idNum) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const raw = await req.json().catch(() => ({}));

  try {
    const body =
      typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

    const days = Array.isArray(body.days) ? (body.days as unknown[]) : undefined;
    const destinationId = body.destinationId;
    const destinationName = body.destinationName;
    const highlights = body.highlights;

    const rest = { ...body };
    delete (rest as any).days;
    delete (rest as any).destinationId;
    delete (rest as any).destinationName;
    delete (rest as any).highlights;

    const updatePayload: Record<string, unknown> = { ...rest };
    if (typeof highlights !== "undefined") updatePayload.highlights = highlights;

    if (destinationId) {
      updatePayload.destination = { connect: { id: Number(destinationId) } };
    } else if (destinationName) {
      const dest = await prisma.destination.findFirst({
        where: { name: { equals: String(destinationName) } },
      });
      if (dest) updatePayload.destination = { connect: { id: dest.id } };
    }

    const result = await prisma.$transaction(async (tx) => {
      // delete existing days
      await tx.itineraryDay.deleteMany({ where: { itineraryId: idNum } });

      // update itinerary
      const updated = await tx.itinerary.update({
        where: { id: idNum },
        data: updatePayload,
      });

      // recreate days
      if (Array.isArray(days) && days.length) {
        for (const d of days) {
          const obj =
            typeof d === "object" && d !== null ? (d as Record<string, unknown>) : {};

          const dayNumber = Number(obj.dayNumber ?? obj.day ?? 0) || 0;
          const activities = Array.isArray(obj.activities) ? obj.activities : [];

          const title = typeof obj.title === "string" ? obj.title : undefined;
          const description = typeof obj.description === "string" ? obj.description : undefined;
          const imageUrl = typeof obj.imageUrl === "string" ? obj.imageUrl : undefined;

          const createData: Record<string, unknown> = { dayNumber, itineraryId: idNum };
          createData.activities = activities; // always include

          if (title) createData.title = title;
          if (description) createData.description = description;
          if (imageUrl) createData.imageUrl = imageUrl;

          await tx.itineraryDay.create({ data: createData as any });
        }
      }

      return updated;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to update itinerary", err);
    return NextResponse.json({ error: "Failed to update itinerary" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const idNum = parseId(id);
  if (!idNum) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    // remove child days first
    await prisma.itineraryDay.deleteMany({ where: { itineraryId: idNum } });
  } catch {
    // ignore
  }

  try {
    await prisma.itinerary.delete({ where: { id: idNum } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
    }
    console.error("Failed to delete itinerary", err);
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 });
  }
}