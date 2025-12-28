import { writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import crypto from "crypto";
import net from "net";

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// 10MB default
const MAX_FILE_SIZE = Number.parseInt(process.env.MAX_FILE_SIZE || "10485760", 10);

// Allowed mime types (still used, but we also validate by magic bytes)
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif,image/webp")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Optional explicit upload root
const UPLOAD_ROOT = process.env.UPLOAD_DIR ? resolve(process.env.UPLOAD_DIR) : join(process.cwd(), "public");

type FileLike = {
  name?: string;
  size?: number;
  type?: string;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

const isFileLike = (f: unknown): f is FileLike => {
  return typeof f === "object" && f !== null && (
    typeof (f as FileLike).arrayBuffer === "function" ||
    typeof (f as FileLike).size === "number" ||
    typeof (f as FileLike).name === "string" ||
    typeof (f as FileLike).type === "string"
  );
};

// ---- Helpers

function safeExtensionFromName(name: string | undefined): string {
  const fallback = "jpg";
  if (!name) return fallback;

  const rawExt = name.split(".").pop()?.toLowerCase() || fallback;

  // only allow safe extensions
  const allowedExts = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
  if (!allowedExts.has(rawExt)) return fallback;

  // normalize jpeg -> jpg
  return rawExt === "jpeg" ? "jpg" : rawExt;
}

// Detect file type by magic bytes (first ~12 bytes)
function detectImageType(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf.slice(0, 8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]))) {
    return { mime: "image/png", ext: "png" };
  }

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // GIF: "GIF87a" or "GIF89a"
  if (buf.slice(0, 6).toString("ascii") === "GIF87a" || buf.slice(0, 6).toString("ascii") === "GIF89a") {
    return { mime: "image/gif", ext: "gif" };
  }

  // WEBP: "RIFF....WEBP"
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }

  return null;
}

function validateBufferAsAllowedImage(buf: Buffer): { mime: string; ext: string } | null {
  const detected = detectImageType(buf);
  if (!detected) return null;
  if (!ALLOWED_TYPES.includes(detected.mime)) return null;
  return detected;
}

function buildFilename(ext: string): string {
  const timestamp = Date.now();
  const rand = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${rand}.${ext}`;
}

function publicUrl(folder: string, filename: string) {
  return `/${folder}/${filename}`;
}

function isPrivateIp(ip: string): boolean {
  // Only supports IPv4 here for simplicity
  if (!net.isIP(ip)) return false;
  if (net.isIP(ip) === 6) return true; // treat IPv6 as not allowed (safe default)

  const parts = ip.split(".").map((x) => Number.parseInt(x, 10));
  const [a, b] = parts;

  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8
  if (a === 127) return true;
  // 169.254.0.0/16 (link-local)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  return false;
}

// Blocks SSRF to internal targets by denying obvious internal hostnames and private IPs.
// NOTE: Without DNS resolving, we can’t fully prevent “evil.com -> 127.0.0.1” via DNS rebinding,
// but this still blocks the most common SSRF payloads.
function isUrlAllowed(input: string): boolean {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return false;
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") return false;

  const host = u.hostname.toLowerCase();

  // obvious local hostnames
  if (host === "localhost" || host.endsWith(".local")) return false;

  // raw IP blocks
  if (net.isIP(host)) {
    if (isPrivateIp(host)) return false;
  }

  return true;
}

// ---- Existing validateFile adjusted (still used for FileLike / Buffer)
function validateFileMeta(file: unknown): string | null {
  if (!file) return "No file provided";

  let size: number | undefined;
  let type: string | undefined;

  if (Buffer.isBuffer(file)) {
    size = (file as Buffer).length;
  } else if (isFileLike(file)) {
    size = file.size;
    type = file.type;
  } else {
    return "Unsupported file object";
  }

  if ((size || 0) <= 0) return "Empty file";
  if ((size || 0) > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB`;
  }

  // If we have a type from client, ensure it’s in allowed list (still not trusted)
  if (type && !ALLOWED_TYPES.includes(type)) {
    return `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`;
  }

  return null;
}

// ---- Uploads

export async function uploadFile(file: unknown, folder: string = "uploads"): Promise<UploadResult> {
  try {
    const validationError = validateFileMeta(file);
    if (validationError) return { success: false, error: validationError };

    const uploadsDir = join(UPLOAD_ROOT, folder);
    await mkdir(uploadsDir, { recursive: true });

    // Convert file to buffer
    let buffer: Buffer;
    let originalName: string | undefined;

    if (Buffer.isBuffer(file)) {
      buffer = file as Buffer;
    } else if (isFileLike(file) && typeof file.arrayBuffer === "function") {
      originalName = file.name;
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes as ArrayBuffer);
    } else {
      return { success: false, error: "Uploaded file missing arrayBuffer method" };
    }

    // enforce size again based on actual buffer
    if (buffer.length > MAX_FILE_SIZE) {
      return { success: false, error: `File size too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB` };
    }

    // validate by magic bytes
    const detected = validateBufferAsAllowedImage(buffer);
    if (!detected) {
      return { success: false, error: "Invalid or unsupported image file" };
    }

    // decide extension: prefer detected ext; ignore user-provided ext
    const ext = detected.ext || safeExtensionFromName(originalName);
    const filename = buildFilename(ext);

    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    return { success: true, url: publicUrl(folder, filename), filename };
  } catch (error) {
    console.error("File upload error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function uploadFromBase64(base64Data: string, folder: string = "uploads", filename?: string): Promise<UploadResult> {
  try {
    const uploadsDir = join(UPLOAD_ROOT, folder);
    await mkdir(uploadsDir, { recursive: true });

    // Only allow data URLs for images (reject raw base64 without a prefix)
    // Example: data:image/png;base64,XXXX
    const m = base64Data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!m) {
      return { success: false, error: "Invalid base64 data URL" };
    }

    const mime = m[1].toLowerCase();
    const raw = m[2];

    if (!ALLOWED_TYPES.includes(mime)) {
      return { success: false, error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}` };
    }

    const buffer = Buffer.from(raw, "base64");
    if (buffer.length <= 0) return { success: false, error: "Empty file" };
    if (buffer.length > MAX_FILE_SIZE) {
      return { success: false, error: `File size too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB` };
    }

    // validate actual file header matches image
    const detected = validateBufferAsAllowedImage(buffer);
    if (!detected) return { success: false, error: "Invalid or unsupported image file" };

    const ext = detected.ext;
    const finalName = filename ? filename.replace(/[^a-zA-Z0-9._-]/g, "") : buildFilename(ext);
    const safeName = finalName.endsWith(`.${ext}`) ? finalName : `${finalName}.${ext}`;

    const filepath = join(uploadsDir, safeName);
    await writeFile(filepath, buffer);

    return { success: true, url: publicUrl(folder, safeName), filename: safeName };
  } catch (error) {
    console.error("Base64 upload error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function uploadFromUrl(imageUrl: string, folder: string = "uploads"): Promise<UploadResult> {
  try {
    if (!isUrlAllowed(imageUrl)) {
      return { success: false, error: "URL not allowed" };
    }

    const uploadsDir = join(UPLOAD_ROOT, folder);
    await mkdir(uploadsDir, { recursive: true });

    // Fetch image with tight controls
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Some servers behave better with UA
        "User-Agent": "travel-website-uploader/1.0",
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return { success: false, error: `Failed to fetch image: ${response.status} ${response.statusText}` };
    }

    // Read into buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length <= 0) return { success: false, error: "Empty file" };
    if (buffer.length > MAX_FILE_SIZE) {
      return { success: false, error: `File size too large. Maximum size is ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB` };
    }

    // Validate it’s really an allowed image
    const detected = validateBufferAsAllowedImage(buffer);
    if (!detected) return { success: false, error: "Invalid or unsupported image file" };

    const filename = buildFilename(detected.ext);
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    return { success: true, url: publicUrl(folder, filename), filename };
  } catch (error) {
    console.error("URL upload error:", error);
    const msg = error instanceof Error ? error.message : "Upload failed";
    // AbortController throws a DOMException in some runtimes; normalize message
    if (String(msg).toLowerCase().includes("aborted")) {
      return { success: false, error: "Fetch timed out" };
    }
    return { success: false, error: msg };
  }
}
