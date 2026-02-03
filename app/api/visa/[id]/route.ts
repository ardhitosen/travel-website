import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const raw = await req.json().catch(() => ({} as unknown));

  const body =
    typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const fields = [
    "name",
    "description",
    "duration",
    "processingTime",
    "price",
    "validity",
    "requirements",
    "documents",
    "destination",
    "imageUrl",
  ] as const;

  const updateData = fields.reduce<Record<string, unknown>>((acc, f) => {
    if (body[f] !== undefined) acc[f] = body[f];
    return acc;
  }, {});

  try {
    const updated = await prisma.visaType.update({
      where: { id: idNum },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update visa type:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);

  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // delete dependent visa applications first to avoid FK constraint errors
    await prisma.visaApplication.deleteMany({ where: { visaTypeId: idNum } }).catch(() => {});
    await prisma.visaType.delete({ where: { id: idNum } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete visa type:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
