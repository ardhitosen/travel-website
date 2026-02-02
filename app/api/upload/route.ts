import { NextResponse } from "next/server";
import { uploadFile, uploadFromBase64, uploadFromUrl } from "../../lib/fileUpload";
import { requireAdmin } from "../../lib/authServer";

export const runtime = "nodejs";

/**
 * Kill-switch behavior:
 * - In production, uploads are DISABLED unless UPLOADS_ENABLED === "true".
 *
 * Remote/base64 behavior:
 * - In production, JSON uploads ({ url } and { base64 }) are disabled by default.
 *   You can re-enable them ONLY if you explicitly set:
 *     UPLOADS_ALLOW_REMOTE === "true"
 *     UPLOADS_ALLOW_BASE64 === "true"
 */
export async function POST(req: Request) {
  const isProd = process.env.NODE_ENV === "production";

  // 1) Global kill-switch (best emergency control)
  const uploadsEnabled = process.env.UPLOADS_ENABLED === "true";
  if (isProd && !uploadsEnabled) {
    // Return 404 to reduce scanner signal (vs 403)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2) Auth guard (admin only)
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: ("status" in auth ? auth.status : 401) }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle multipart form data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");

      if (!file) {
        console.error("Upload: form did not contain file field");
        return NextResponse.json({ error: "file is required" }, { status: 400 });
      }

      const maybeFile = file as unknown;
      if (typeof (maybeFile as { arrayBuffer?: unknown }).arrayBuffer !== "function") {
        return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
      }

      const result = await uploadFile(maybeFile as unknown as File, "jos");
      if (!result.success) {
        console.error("Upload failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url,
      });
    }

    // Handle JSON body
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      // ignore parse errors
    }

    // ---- Disable { url } uploads in production (recommended)
    if (typeof body === "object" && body !== null && "url" in body) {
      const allowRemote = !isProd || process.env.UPLOADS_ALLOW_REMOTE === "true";
      if (!allowRemote) {
        return NextResponse.json({ error: "Remote URL uploads disabled" }, { status: 403 });
      }

      const url = (body as Record<string, unknown>)["url"];
      const result = await uploadFromUrl(String(url), "jos");
      if (!result.success) {
        console.error("Upload from url failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url,
      });
    }

    // ---- Disable { base64 } uploads in production (recommended)
    if (typeof body === "object" && body !== null && "base64" in body) {
      const allowBase64 = !isProd || process.env.UPLOADS_ALLOW_BASE64 === "true";
      if (!allowBase64) {
        return NextResponse.json({ error: "Base64 uploads disabled" }, { status: 403 });
      }

      const base64 = (body as Record<string, unknown>)["base64"];
      const result = await uploadFromBase64(String(base64), "jos");
      if (!result.success) {
        console.error("Upload from base64 failed:", result.error);
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        secure_url: result.url,
        public_id: result.filename,
        url: result.url,
      });
    }

    return NextResponse.json({ error: "Provide multipart file" }, { status: 400 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
