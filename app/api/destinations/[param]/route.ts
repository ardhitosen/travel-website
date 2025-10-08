import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from 'path';
import { unlink } from 'fs/promises';

// Helper function to determine if param is numeric ID or name
function isNumericId(param: string): boolean {
  return !isNaN(Number(param));
}

type RouteContext = { params?: Promise<Record<string, unknown>> | Record<string, unknown> } | undefined;

function isThenable<T = unknown>(obj: unknown): obj is Promise<T> {
  return typeof obj === 'object' && obj !== null && typeof (obj as { then?: unknown }).then === 'function';
}

// Helper to create a simple URL-safe slug from a name
function slugifyName(s: string) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

export async function GET(req: Request, context: RouteContext) {
  // `context.params` may be a thenable in some Next runtimes — handle both sync and async
  const rawParams = context?.params;
  const params = isThenable(rawParams) ? await rawParams : rawParams;
  const paramRaw = (params as Record<string, unknown> | undefined)?.param;
  const param = typeof paramRaw === 'string' ? paramRaw : String(paramRaw ?? '');
  // Normalize incoming param: decode percent encoding and convert to slug form
  const decodedParam = (() => { try { return decodeURIComponent(String(param)); } catch { return String(param); } })();
  const paramSlugNormalized = slugifyName(decodedParam);

  let destination;
  if (isNumericId(param)) {
    // Search by ID
    destination = await prisma.destination.findUnique({
      where: { id: Number(param) },
      include: { itineraries: { include: { days: true } }, gallery: true }
    });
  } else {
    // We don't have a dedicated `slug` column on Destination. Build a slug from
    // the destination name and match that against the param (e.g. "South Korea" -> "south-korea").
  const all = await prisma.destination.findMany({ include: { itineraries: { include: { days: true } }, gallery: true } });
  destination = all.find((d: any) => slugifyName(d.name) === paramSlugNormalized) || null;

    if (!destination) {
      // Fall back to name variants search for compatibility with previous behaviour
      const variants: string[] = [param];
      const spaced = param.replace(/-/g, ' ');
      if (spaced !== param) variants.push(spaced);
      const title = spaced.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (title && !variants.includes(title)) variants.push(title);

      const candidates = await prisma.destination.findMany({
        where: { name: { in: variants as string[] } },
        include: { itineraries: { include: { days: true } }, gallery: true }
      });

      if (candidates && candidates.length) {
        const lowerVariants = variants.map((v) => v.toLowerCase());
        let foundIndex = -1;
        for (const v of lowerVariants) {
          foundIndex = candidates.findIndex((c) => String((c as Record<string, unknown>)['name'] ?? '').toLowerCase() === v);
          if (foundIndex >= 0) break;
        }
        destination = foundIndex >= 0 ? candidates[foundIndex] : candidates[0];
      } else {
        destination = null;
      }
    }
  }

  if (!destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
  }

  return NextResponse.json(destination);
}

export async function PUT(req: Request, context: RouteContext) {
  const rawParams = context?.params;
  const params = isThenable(rawParams) ? await rawParams : rawParams;
  const paramRaw = (params as Record<string, unknown> | undefined)?.param;
  const param = typeof paramRaw === 'string' ? paramRaw : String(paramRaw ?? '');
  // Normalize incoming param for update: decode percent encoding and convert to slug form
  const decodedParam = (() => { try { return decodeURIComponent(String(param)); } catch { return String(param); } })();
  const paramSlugNormalized = slugifyName(decodedParam);
  const data = await req.json();

  let updated;
  if (isNumericId(param)) {
    // Update by ID
    const id = Number(param);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    updated = await prisma.destination.update({ where: { id }, data });
  } else {
    // Update by slug if it matches an existing destination, otherwise update by name
    // Look for a destination whose generated slug matches the provided param
    const allForUpdate = await prisma.destination.findMany();
  const existingBySlug = allForUpdate.find((d: any) => slugifyName(d.name) === paramSlugNormalized);
    if (existingBySlug) {
      // update by id to satisfy Prisma's typed where input
      updated = await prisma.destination.update({ where: { id: Number(existingBySlug.id) }, data });
    } else {
      // updateMany returns a count; to be explicit return the affected rows after update
      await prisma.destination.updateMany({ where: { name: { equals: String(param) } }, data });
      const list = await prisma.destination.findMany({ where: { name: { equals: String(param) } } });
      updated = list;
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const rawParams = context?.params;
  const params = isThenable(rawParams) ? await rawParams : rawParams;
  const paramRaw = (params as Record<string, unknown> | undefined)?.param;
  const param = typeof paramRaw === 'string' ? paramRaw : String(paramRaw ?? '');
  // Normalize incoming param for delete: decode percent encoding and convert to slug form
  const decodedParam = (() => { try { return decodeURIComponent(String(param)); } catch { return String(param); } })();
  const paramSlugNormalized = slugifyName(decodedParam);

  if (isNumericId(param)) {
    // Delete by ID — first remove any files on disk
    const id = Number(param);
    try {
      // load destination with related itineraries and gallery
      const dest = await prisma.destination.findUnique({ where: { id }, include: { gallery: true, itineraries: { include: { days: true } } } });
      if (dest) {
        const destRec = dest as unknown as Record<string, unknown>;
        // delete itinerary days then itineraries to avoid FK constraint
        if (Array.isArray(destRec['itineraries'])) {
          for (const itin of destRec['itineraries'] as unknown[]) {
            const itinRec = itin as Record<string, unknown>;
            try {
              await prisma.itineraryDay.deleteMany({ where: { itineraryId: Number(itinRec['id']) } });
            } catch (e) { console.warn('Failed to delete itinerary days for', itinRec['id'], e); }
            try {
              await prisma.itinerary.delete({ where: { id: Number(itinRec['id']) } });
            } catch (e) { console.warn('Failed to delete itinerary', itinRec['id'], e); }
          }
        }

        // remove gallery files (only for local/relative paths, skip remote URLs)
        const imageUrl = destRec['imageUrl'];
        if (typeof imageUrl === 'string' && !/^https?:\/\//i.test(imageUrl)) {
          const p = imageUrl.replace(/^\/+/, '');
          try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink dest image', err); }
        }
        if (Array.isArray(destRec['gallery'])) {
          for (const g of destRec['gallery'] as unknown[]) {
            const gRec = g as Record<string, unknown>;
            const gImage = gRec['imageUrl'];
            if (typeof gImage === 'string' && !/^https?:\/\//i.test(gImage)) {
              const p = gImage.replace(/^\/+/, '');
              try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink gallery image', err); }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error while preparing destination deletion:', err);
      return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 });
    }

    try {
      // delete related gallery rows first to avoid FK constraints
      try { await prisma.galleryImage.deleteMany({ where: { destinationId: id } }); } catch (e) { console.warn('Failed to delete gallery rows for destination', id, e); }
      await prisma.destination.delete({ where: { id } });
    } catch (err) {
      console.error('Error deleting destination record:', err);
      return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 });
    }
  } else {
    // Delete by slug if matched, otherwise delete by name — remove files for all matched destinations
    try {
      let list = [] as any[];
      const allForDelete = await prisma.destination.findMany({ include: { gallery: true, itineraries: { include: { days: true } } } });
  const bySlug = allForDelete.find((d: any) => slugifyName(d.name) === paramSlugNormalized);
      if (bySlug) {
        list = [bySlug];
      } else {
        list = await prisma.destination.findMany({ where: { name: { equals: String(param) } }, include: { gallery: true, itineraries: { include: { days: true } } } });
      }
      for (const dest of list) {
        const destRec = dest as unknown as Record<string, unknown>;
        if (Array.isArray(destRec['itineraries'])) {
          for (const itin of destRec['itineraries'] as unknown[]) {
            const itinRec = itin as Record<string, unknown>;
            try { await prisma.itineraryDay.deleteMany({ where: { itineraryId: Number(itinRec['id']) } }); } catch (e) { console.warn('Failed to delete itinerary days for', itinRec['id'], e); }
            try { await prisma.itinerary.delete({ where: { id: Number(itinRec['id']) } }); } catch (e) { console.warn('Failed to delete itinerary', itinRec['id'], e); }
          }
        }

        const img = destRec['imageUrl'];
        if (typeof img === 'string' && !/^https?:\/\//i.test(img)) {
          const p = img.replace(/^\/+/, '');
          try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink dest image', err); }
        }
        if (Array.isArray(destRec['gallery'])) {
          for (const g of destRec['gallery'] as unknown[]) {
            const gRec = g as Record<string, unknown>;
            const gImage = gRec['imageUrl'];
            if (typeof gImage === 'string' && !/^https?:\/\//i.test(gImage)) {
              const p = gImage.replace(/^\/+/, '');
              try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink gallery image', err); }
            }
          }
        }
      }
      // delete gallery rows and destination record(s)
      if (bySlug) {
        try { await prisma.galleryImage.deleteMany({ where: { destinationId: Number(bySlug.id) } }); } catch (e) { console.warn('Failed to delete gallery rows by slug', param, e); }
        await prisma.destination.delete({ where: { id: Number(bySlug.id) } });
      } else {
        try { await prisma.galleryImage.deleteMany({ where: { destination: { name: { equals: param } } } }); } catch (e) { console.warn('Failed to delete gallery rows by name', param, e); }
        await prisma.destination.deleteMany({ where: { name: { equals: param } } });
      }
    } catch (err) {
      console.error('Error while deleting destinations by name:', err);
      return NextResponse.json({ error: 'Failed to delete destinations' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
