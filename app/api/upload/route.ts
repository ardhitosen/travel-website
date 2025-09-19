import { NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const res = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: "jos" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      uploadStream.end(buffer);
    });
    return NextResponse.json(res);
  }

  const body = await req.json();
  if (body?.url) {
    const res = await cloudinary.uploader.upload(body.url, { folder: "jos" });
    return NextResponse.json(res);
  }
  if (body?.base64) {
    const res = await cloudinary.uploader.upload(body.base64, { folder: "jos" });
    return NextResponse.json(res);
  }
  return NextResponse.json({ error: "Provide multipart file, url, or base64" }, { status: 400 });
} 