import { NextResponse } from "next/server";
import { uploadFile, uploadFromBase64, uploadFromUrl } from "../../lib/fileUpload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    
    // Handle multipart form data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "file is required" }, { status: 400 });
      }
      
      const result = await uploadFile(file, "jos");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      
      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url
      });
    }

    // Handle JSON body
    const body = await req.json();
    
    if (body?.url) {
      const result = await uploadFromUrl(body.url, "jos");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      
      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url
      });
    }
    
    if (body?.base64) {
      const result = await uploadFromBase64(body.base64, "jos");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      
      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url
      });
    }
    
    return NextResponse.json({ error: "Provide multipart file, url, or base64" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 