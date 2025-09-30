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
      if (!file) {
        console.error('Upload: form did not contain file field');
        return NextResponse.json({ error: "file is required" }, { status: 400 });
      }

      // Some runtimes provide File, others provide Blob-like objects. Ensure it has arrayBuffer
      if (typeof (file as any).arrayBuffer !== 'function') {
        console.error('Upload: received file object without arrayBuffer method', Object.keys(file as any));
        return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
      }

      const result = await uploadFile(file as unknown as File, "jos");
      if (!result.success) {
        console.error('Upload failed:', result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url
      });
    }

    // Handle JSON body
    let body: any = {};
    try {
      body = await req.json();
    } catch (err) {
      // ignore
    }

    if (body?.url) {
      const result = await uploadFromUrl(body.url, "jos");
      if (!result.success) {
        console.error('Upload from url failed:', result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
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
        console.error('Upload from base64 failed:', result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url
      });
    }

    console.error('Upload: no valid payload provided');
    return NextResponse.json({ error: "Provide multipart file, url, or base64" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}