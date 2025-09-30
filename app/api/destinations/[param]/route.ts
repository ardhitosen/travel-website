import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { join } from 'path';
import { unlink } from 'fs/promises';

// Helper function to determine if param is numeric ID or name
function isNumericId(param: string): boolean {
  return !isNaN(Number(param));
}

type RouteContext = { params?: Promise<Record<string, unknown>> | Record<string, unknown> } | undefined;

export async function GET(req: Request, context: RouteContext) {
  // `context.params` may be a thenable in some Next runtimes — handle both sync and async
  const rawParams = context?.params;
  const params = rawParams && typeof (rawParams as any).then === 'function' ? await rawParams : rawParams;
  const param = (params as Record<string, unknown> | undefined)?.param ?? '';

  let destination;
  if (isNumericId(param)) {
    // Search by ID
    destination = await prisma.destination.findUnique({
      where: { id: Number(param) },
      include: { itineraries: { include: { days: true } }, gallery: true }
    });
  } else {
    // Search by name. Build a small set of likely name variants (raw, hyphen->space, title-case)
    const variants = [param];
    const spaced = param.replace(/-/g, ' ');
    if (spaced !== param) variants.push(spaced);
    const title = spaced.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (title && !variants.includes(title)) variants.push(title);

    // Query DB for any destination whose name is in the variants list (case-sensitive in DB),
    // then pick the best case-insensitive match in JS.
    const candidates = await prisma.destination.findMany({
      where: { name: { in: variants } },
      include: { itineraries: { include: { days: true } }, gallery: true }
    });

    if (candidates && candidates.length) {
      const lowerVariants = variants.map(v => v.toLowerCase());
      // Find candidate whose name lowercased matches any variant in the same order
      let found: Record<string, unknown> | null = null;
      for (const v of lowerVariants) {
        found = candidates.find((c) => String((c as Record<string, unknown>)['name'] ?? '').toLowerCase() === v) as Record<string, unknown> | undefined ?? null;
        if (found) break;
      }
      destination = (found as unknown) ?? candidates[0];
    } else {
      destination = null;
    }
  }

  if (!destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
  }

  return NextResponse.json(destination);
}

export async function PUT(req: Request, context: RouteContext) {
  const rawParams = context?.params;
  const params = rawParams && typeof (rawParams as any).then === 'function' ? await rawParams : rawParams;
  const param = (params as Record<string, unknown> | undefined)?.param ?? '';
  const data = await req.json();

  let updated;
  if (isNumericId(param)) {
    // Update by ID
    const id = Number(param);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    updated = await prisma.destination.update({ where: { id }, data });
  } else {
    // Update by name
    // updateMany returns a count; to be explicit return the affected rows after update
    await prisma.destination.updateMany({ where: { name: { equals: param } }, data });
    const list = await prisma.destination.findMany({ where: { name: { equals: param } } });
    updated = list;
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const rawParams = context?.params;
  const params = rawParams && typeof (rawParams as any).then === 'function' ? await rawParams : rawParams;
  const param = (params as Record<string, unknown> | undefined)?.param ?? '';

  if (isNumericId(param)) {
    // Delete by ID — first remove any files on disk
    const id = Number(param);
    try {
      // load destination with related itineraries and gallery
      const dest = await prisma.destination.findUnique({ where: { id }, include: { gallery: true, itineraries: { include: { days: true } } } });
      if (dest) {
        // delete itinerary days then itineraries to avoid FK constraint
        if (Array.isArray(dest.itineraries)) {
          for (const itin of dest.itineraries) {
            try {
              await prisma.itineraryDay.deleteMany({ where: { itineraryId: itin.id } });
            } catch (e) { console.warn('Failed to delete itinerary days for', itin.id, e); }
            try {
              await prisma.itinerary.delete({ where: { id: itin.id } });
            } catch (e) { console.warn('Failed to delete itinerary', itin.id, e); }
          }
        }

        // remove gallery files (only for local/relative paths, skip remote URLs)
        if (dest.imageUrl && !/^https?:\/\//i.test(dest.imageUrl)) {
          const p = dest.imageUrl.replace(/^\/+/, '');
          try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink dest image', err); }
        }
        if (Array.isArray(dest.gallery)) {
          for (const g of dest.gallery) {
            if (g.imageUrl && !/^https?:\/\//i.test(g.imageUrl)) {
              const p = g.imageUrl.replace(/^\/+/, '');
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
    // Delete by name — remove files for all matched destinations
    try {
      const list = await prisma.destination.findMany({ where: { name: { equals: param } }, include: { gallery: true, itineraries: { include: { days: true } } } });
      for (const dest of list) {
        if (Array.isArray(dest.itineraries)) {
          for (const itin of dest.itineraries) {
            try { await prisma.itineraryDay.deleteMany({ where: { itineraryId: itin.id } }); } catch (e) { console.warn('Failed to delete itinerary days for', itin.id, e); }
            try { await prisma.itinerary.delete({ where: { id: itin.id } }); } catch (e) { console.warn('Failed to delete itinerary', itin.id, e); }
          }
        }

        if (dest.imageUrl && !/^https?:\/\//i.test(dest.imageUrl)) {
          const p = dest.imageUrl.replace(/^\/+/, '');
          try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink dest image', err); }
        }
        if (Array.isArray(dest.gallery)) {
          for (const g of dest.gallery) {
            if (g.imageUrl && !/^https?:\/\//i.test(g.imageUrl)) {
              const p = g.imageUrl.replace(/^\/+/, '');
              try { await unlink(join(process.cwd(), 'public', p)); } catch (err) { console.warn('Could not unlink gallery image', err); }
            }
          }
        }
      }
      // delete gallery rows for all matched destinations, then delete destinations
      try { await prisma.galleryImage.deleteMany({ where: { destination: { name: { equals: param } } } }); } catch (e) { console.warn('Failed to delete gallery rows by name', param, e); }
      await prisma.destination.deleteMany({ where: { name: { equals: param } } });
    } catch (err) {
      console.error('Error while deleting destinations by name:', err);
      return NextResponse.json({ error: 'Failed to delete destinations' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
