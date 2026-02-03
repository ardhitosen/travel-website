import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from "path";
import { unlink } from "fs/promises";

type PRAGMARow = Record<string, unknown>;

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
      "PRAGMA table_info('Promotion')"
    )) as PRAGMARow[] | unknown;

    const existingCols = Array.isArray(cols) ? cols.map((c) => String(c["name"])) : [];
    if (!existingCols.length) {
      return NextResponse.json({ error: "Promotion table not found" }, { status: 500 });
    }

    const candidateCols = ["id", "imageUrl", "title", "description", "position", "createdAt", "updatedAt"];
    const selectCols = candidateCols
      .filter((c) => existingCols.includes(c))
      .map((c) => `"${c}"`);

    const selectSql = `SELECT ${selectCols.join(", ")} FROM "Promotion" WHERE "id" = ${idNum} LIMIT 1`;
    const rows = (await prisma.$queryRawUnsafe(selectSql)) as unknown[];

    const existingRow =
      Array.isArray(rows) && rows.length ? (rows[0] as Record<string, unknown>) : null;

    if (!existingRow) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    // remove file if present (best-effort)
    try {
      const img = existingRow["imageUrl"];
      if (typeof img === "string" && img) {
        const possible = img.replace(/^\/+/, "");

        // basic safety: don't allow path traversal
        if (!possible.includes("..")) {
          const filepath = join(process.cwd(), "public", possible);
          try {
            await unlink(filepath);
          } catch (err) {
            console.warn("Could not unlink file", filepath, err);
          }
        }
      }
    } catch (e) {
      console.error("Error removing promotion image:", String(e));
    }

    await prisma.$executeRawUnsafe(`DELETE FROM "Promotion" WHERE "id" = ${idNum}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error during promotion delete flow:", String(err));
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}