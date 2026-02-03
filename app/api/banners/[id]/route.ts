import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from "path";
import { unlink } from "fs/promises";

type PRAGMARow = Record<string, unknown>;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const b = (typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  const imageUrl = b.imageUrl;
  const fact = b.fact;
  const destination = b.destination;
  const position = b.position;
  const title = b.title;
  const description = b.description;

  try {
    const cols = (await prisma.$queryRawUnsafe(
      "PRAGMA table_info('BannerSlide')"
    )) as PRAGMARow[] | unknown;

    const existingCols = Array.isArray(cols) ? cols.map((c) => String(c["name"])) : [];
    if (!existingCols.length) {
      return NextResponse.json({ error: "BannerSlide table not found" }, { status: 500 });
    }

    const candidateCols = [
      "id",
      "imageUrl",
      "fact",
      "title",
      "description",
      "destination",
      "position",
      "createdAt",
      "updatedAt",
    ];

    const selectCols = candidateCols.filter((c) => existingCols.includes(c)).map((c) => `"${c}"`);
    const sql = `SELECT ${selectCols.join(", ")} FROM "BannerSlide" WHERE "id" = ${idNum} LIMIT 1`;
    const rows = (await prisma.$queryRawUnsafe(sql)) as unknown[];

    const existingRow = Array.isArray(rows) && rows.length ? (rows[0] as Record<string, unknown>) : null;
    if (!existingRow) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    // Build update map only for columns that exist
    const lowerCols = new Set(existingCols.map((s) => s.toLowerCase()));
    const updateMap: Record<string, unknown> = {};

    if (lowerCols.has("imageurl") && imageUrl !== undefined) updateMap.imageUrl = imageUrl;
    if (lowerCols.has("fact") && fact !== undefined) updateMap.fact = fact;
    if (lowerCols.has("destination") && destination !== undefined) updateMap.destination = destination;
    if (lowerCols.has("position") && position !== undefined) updateMap.position = position;
    if (existingCols.includes("title") && title !== undefined) updateMap.title = title;
    if (existingCols.includes("description") && description !== undefined) updateMap.description = description;

    if (Object.keys(updateMap).length === 0) return NextResponse.json(existingRow);

    const setParts: string[] = [];
    for (const k of Object.keys(updateMap)) {
      setParts.push(`"${k}" = ${JSON.stringify(updateMap[k] === undefined ? null : updateMap[k])}`);
    }
    if (existingCols.includes("updatedAt")) setParts.push(`"updatedAt" = CURRENT_TIMESTAMP`);

    const updateSql = `UPDATE "BannerSlide" SET ${setParts.join(", ")} WHERE "id" = ${idNum}`;
    await prisma.$executeRawUnsafe(updateSql);

    const afterRows = (await prisma.$queryRawUnsafe(sql)) as unknown[];
    return NextResponse.json((Array.isArray(afterRows) && afterRows[0]) || null);
  } catch (err) {
    console.error("Error updating banner (raw path):", err);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
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
    const cols = (await prisma.$queryRawUnsafe(
      "PRAGMA table_info('BannerSlide')"
    )) as PRAGMARow[] | unknown;

    const existingCols = Array.isArray(cols) ? cols.map((c) => String(c["name"])) : [];
    if (!existingCols.length) {
      return NextResponse.json({ error: "BannerSlide table not found" }, { status: 500 });
    }

    const candidateCols = [
      "id",
      "imageUrl",
      "fact",
      "title",
      "description",
      "destination",
      "position",
      "createdAt",
      "updatedAt",
    ];
    const selectCols = candidateCols.filter((c) => existingCols.includes(c)).map((c) => `"${c}"`);
    const selectSql = `SELECT ${selectCols.join(", ")} FROM "BannerSlide" WHERE "id" = ${idNum} LIMIT 1`;
    const rows = (await prisma.$queryRawUnsafe(selectSql)) as unknown[];

    const existingRow = Array.isArray(rows) && rows.length ? (rows[0] as Record<string, unknown>) : null;
    if (!existingRow) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

    // best-effort remove local file
    try {
      const img = existingRow["imageUrl"];
      if (typeof img === "string" && img) {
        const possible = img.replace(/^\/+/, "");
        if (!possible.includes("..") && !/^https?:\/\//i.test(possible)) {
          const filepath = join(process.cwd(), "public", possible);
          try {
            await unlink(filepath);
          } catch (e) {
            console.warn("Could not unlink file", filepath, e);
          }
        }
      }
    } catch (e) {
      console.error("Error while attempting to remove banner image:", e);
    }

    await prisma.$executeRawUnsafe(`DELETE FROM "BannerSlide" WHERE "id" = ${idNum}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error during banner delete flow:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
