import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV === "development") {
    // Use mock data in development
    const { banners } = await import("../../../mockData/banners");
    return NextResponse.json(banners);
  }
  const banners = await prisma.bannerSlide.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { imageUrl, fact, destination, position } = body;
  const created = await prisma.bannerSlide.create({ data: { imageUrl, fact, destination, position: position ?? 0 } });
  return NextResponse.json(created, { status: 201 });
}
