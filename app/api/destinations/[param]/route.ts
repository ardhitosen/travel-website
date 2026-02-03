import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from "path";
import { unlink } from "fs/promises";

// Helper function to determine if param is numeric ID or name
function isNumericId(param: string): boolean {
  return !Number.isNaN(Number(param));
}

// Helper to create a simple URL-safe slug from a name
function slugifyName(s: string) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;

  // Normalize incoming param
  const decodedParam = (() => {
    try {
      return decodeURIComponent(String(param));
    } catch {
      return String(param);
    }
  })();

  const paramSlugNormalized = slugifyName(decodedParam);

  let destination: unknown = null;

  if (isNumericId(decodedParam)) {
    destination = await prisma.destination.findUnique({
      where: { id: Number(decodedParam) },
      include: { itineraries: { include: { days: true } }, gallery: true },
    });
  } else {
    const all = await prisma.destination.findMany({
      include: { itineraries: { include: { days: true } }, gallery: true },
    });
    destination =
      (all as any[]).find((d) => slugifyName(d.name) === paramSlugNormalized) || null;

    if (!destination) {
      const variants: string[] = [decodedParam];
      const spaced = decodedParam.replace(/-/g, " ");
      if (spaced !== decodedParam) variants.push(spaced);

      const title = spaced
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      if (title && !variants.includes(title)) variants.push(title);

      const candidates = await prisma.destination.findMany({
        where: { name: { in: variants } },
        include: { itineraries: { include: { days: true } }, gallery: true },
      });

      if (candidates?.length) {
        const lowerVariants = variants.map((v) => v.toLowerCase());
        let found: any = null;
        for (const v of lowerVariants) {
          found = (candidates as any[]).find(
            (c) => String(c.name ?? "").toLowerCase() === v
          );
          if (found) break;
        }
        destination = found || candidates[0];
      }
    }
  }

  if (!destination) {
    return NextResponse.json({ error: "Destination not found" }, { status: 404 });
  }

  return NextResponse.json(destination);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;

  const decodedParam = (() => {
    try {
      return decodeURIComponent(String(param));
    } catch {
      return String(param);
    }
  })();

  const paramSlugNormalized = slugifyName(decodedParam);
  const data = await req.json();

  let updated: unknown;

  if (isNumericId(decodedParam)) {
    const id = Number(decodedParam);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    updated = await prisma.destination.update({ where: { id }, data });
  } else {
    const allForUpdate = await prisma.destination.findMany();
    const existingBySlug = (allForUpdate as any[]).find(
      (d) => slugifyName(d.name) === paramSlugNormalized
    );

    if (existingBySlug) {
      updated = await prisma.destination.update({
        where: { id: Number(existingBySlug.id) },
        data,
      });
    } else {
      await prisma.destination.updateMany({ where: { name: { equals: decodedParam } }, data });
      updated = await prisma.destination.findMany({ where: { name: { equals: decodedParam } } });
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ param: string }> }
) {
  const { param } = await params;

  const decodedParam = (() => {
    try {
      return decodeURIComponent(String(param));
    } catch {
      return String(param);
    }
  })();

  const paramSlugNormalized = slugifyName(decodedParam);

  const unlinkLocal = async (p: unknown) => {
    if (typeof p !== "string" || !p) return;
    if (/^https?:\/\//i.test(p)) return;
    const rel = p.replace(/^\/+/, "");
    if (rel.includes("..")) return;
    try {
      await unlink(join(process.cwd(), "public", rel));
    } catch {}
  };

  if (isNumericId(decodedParam)) {
    const id = Number(decodedParam);

    try {
      const dest = await prisma.destination.findUnique({
        where: { id },
        include: { gallery: true, itineraries: { include: { days: true } } },
      });

      if (dest) {
        for (const itin of (dest as any).itineraries ?? []) {
          try {
            await prisma.itineraryDay.deleteMany({ where: { itineraryId: Number(itin.id) } });
          } catch {}
          try {
            await prisma.itinerary.delete({ where: { id: Number(itin.id) } });
          } catch {}
        }

        await unlinkLocal((dest as any).imageUrl);
        for (const g of (dest as any).gallery ?? []) {
          await unlinkLocal(g.imageUrl);
        }
      }
    } catch (err) {
      console.error("Error while preparing destination deletion:", err);
      return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
    }

    try {
      await prisma.galleryImage.deleteMany({ where: { destinationId: id } }).catch(() => {});
      await prisma.destination.delete({ where: { id } });
    } catch (err) {
      console.error("Error deleting destination record:", err);
      return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // Delete by slug (generated) or by name
  try {
    const allForDelete = await prisma.destination.findMany({
      include: { gallery: true, itineraries: { include: { days: true } } },
    });

    const bySlug = (allForDelete as any[]).find(
      (d) => slugifyName(d.name) === paramSlugNormalized
    );

    const list = bySlug
      ? [bySlug]
      : await prisma.destination.findMany({
          where: { name: { equals: decodedParam } },
          include: { gallery: true, itineraries: { include: { days: true } } },
        });

    for (const dest of list as any[]) {
      for (const itin of dest.itineraries ?? []) {
        await prisma.itineraryDay.deleteMany({ where: { itineraryId: Number(itin.id) } }).catch(() => {});
        await prisma.itinerary.delete({ where: { id: Number(itin.id) } }).catch(() => {});
      }
      await unlinkLocal(dest.imageUrl);
      for (const g of dest.gallery ?? []) await unlinkLocal(g.imageUrl);
    }

    if (bySlug) {
      await prisma.galleryImage.deleteMany({ where: { destinationId: Number(bySlug.id) } }).catch(() => {});
      await prisma.destination.delete({ where: { id: Number(bySlug.id) } });
    } else {
      await prisma.galleryImage
        .deleteMany({ where: { destination: { name: { equals: decodedParam } } } })
        .catch(() => {});
      await prisma.destination.deleteMany({ where: { name: { equals: decodedParam } } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error while deleting destinations:", err);
    return NextResponse.json({ error: "Failed to delete destinations" }, { status: 500 });
  }
}
