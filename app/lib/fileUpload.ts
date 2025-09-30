import { writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// Configuration from environment variables
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

// Optional explicit upload root. If set, this should be an absolute path to the folder
// where the app's public assets are served from (for example: /var/www/travel-website/public).
// Fallback: join(process.cwd(), 'public') as before.
const UPLOAD_ROOT = process.env.UPLOAD_DIR ? resolve(process.env.UPLOAD_DIR) : join(process.cwd(), 'public');

type FileLike = {
  name?: string;
  size?: number;
  type?: string;
  arrayBuffer?: () => Promise<ArrayBuffer>;
};

const isFileLike = (f: unknown): f is FileLike => {
  return typeof f === 'object' && f !== null && (
    typeof (f as FileLike).arrayBuffer === 'function' ||
    typeof (f as FileLike).size === 'number' ||
    typeof (f as FileLike).name === 'string' ||
    typeof (f as FileLike).type === 'string'
  );
};

function validateFile(file: unknown): string | null {
  if (!file) return 'No file provided';

  let size: number | undefined;
  let type: string | undefined;

  if (Buffer.isBuffer(file)) {
    size = (file as Buffer).length;
  } else if (isFileLike(file)) {
    size = file.size;
    type = file.type;
  } else {
    return 'Unsupported file object';
  }

  // Check file size
  if ((size || 0) > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  // Check file type
  if (type && !ALLOWED_TYPES.includes(type)) {
    return `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
  }

  return null;
}

export async function uploadFile(
  file: unknown,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Resolve uploads directory. Prefer explicit UPLOAD_DIR when provided to avoid
    // relying on the process cwd (which can differ under PM2 or systemd).
    const uploadsDir = join(UPLOAD_ROOT, folder);
    await mkdir(uploadsDir, { recursive: true });
    // Diagnostic logging: show where files will be written and whether UPLOAD_DIR was used
    try {
      // eslint-disable-next-line no-console
      console.info('[uploadFile] uploadsDir=', uploadsDir, 'UPLOAD_ROOT=', UPLOAD_ROOT, 'process.cwd=', process.cwd());
    } catch {}

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
  const origName = (isFileLike(file) && file.name) ? file.name : `${timestamp}`;
    const fileExtension = String(origName).split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Convert file to buffer
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file as Buffer;
    } else if (isFileLike(file) && typeof file.arrayBuffer === 'function') {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes as ArrayBuffer);
    } else {
      return { success: false, error: 'Uploaded file missing arrayBuffer method' };
    }

    // Write file to disk
    const filepath = join(uploadsDir, filename);
    // Diagnostic logging: file path about to be written
    try {
      // eslint-disable-next-line no-console
      console.info('[uploadFile] writing file ->', filepath);
    } catch {}
    await writeFile(filepath, buffer as Buffer);

    // Return public URL
    const publicUrl = `/${folder}/${filename}`;
    
    return {
      success: true,
      url: publicUrl,
      filename: filename
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function uploadFromBase64(
  base64Data: string,
  folder: string = 'uploads',
  filename?: string
): Promise<UploadResult> {
  try {
    // Resolve uploads directory using UPLOAD_ROOT
  const uploadsDir = join(UPLOAD_ROOT, folder);
  await mkdir(uploadsDir, { recursive: true });
  try { console.info('[uploadFromBase64] uploadsDir=', uploadsDir, 'UPLOAD_ROOT=', UPLOAD_ROOT, 'process.cwd=', process.cwd()); } catch {}

    // Generate filename if not provided
    if (!filename) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      filename = `${timestamp}-${randomString}.jpg`; // Default to jpg for base64
    }

    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    // Write file to disk
  const filepath = join(uploadsDir, filename);
  try { console.info('[uploadFromBase64] writing file ->', filepath); } catch {}
  await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/${folder}/${filename}`;
    
    return {
      success: true,
      url: publicUrl,
      filename: filename
    };
  } catch (error) {
    console.error('Base64 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function uploadFromUrl(
  imageUrl: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // Resolve uploads directory using UPLOAD_ROOT
  const uploadsDir = join(UPLOAD_ROOT, folder);
  await mkdir(uploadsDir, { recursive: true });
  try { console.info('[uploadFromUrl] uploadsDir=', uploadsDir, 'UPLOAD_ROOT=', UPLOAD_ROOT, 'process.cwd=', process.cwd()); } catch {}

    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Generate filename from URL or create one
    const urlPath = new URL(imageUrl).pathname;
    const originalFilename = urlPath.split('/').pop() || 'image';
    const fileExtension = originalFilename.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${randomString}.${fileExtension}`;

    // Write file to disk
  const filepath = join(uploadsDir, filename);
  try { console.info('[uploadFromUrl] writing file ->', filepath); } catch {}
  await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/${folder}/${filename}`;
    
    return {
      success: true,
      url: publicUrl,
      filename: filename
    };
  } catch (error) {
    console.error('URL upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}
