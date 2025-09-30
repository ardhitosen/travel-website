import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// Configuration from environment variables
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

function validateFile(file: { size?: number; type?: string } | undefined): string | null {
  if (!file) return 'No file provided';
  // Check file size
  if ((file.size || 0) > MAX_FILE_SIZE) {
    return `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  // Check file type
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
  }

  return null;
}

export async function uploadFile(
  file: any,
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', folder);
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const origName = (file && file.name) || `${timestamp}`;
    const fileExtension = String(origName).split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Convert file to buffer
    let buffer: Buffer;
    if (typeof file.arrayBuffer !== 'function') {
      // Some runtimes provide Blob with stream() — try to handle Buffer directly
      if (file instanceof Buffer) {
        buffer = file as Buffer;
      } else {
        return { success: false, error: 'Uploaded file missing arrayBuffer method' };
      }
    } else {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes as ArrayBuffer);
    }

    // Write file to disk
    const filepath = join(uploadsDir, filename);
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
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', folder);
    await mkdir(uploadsDir, { recursive: true });

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
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', folder);
    await mkdir(uploadsDir, { recursive: true });

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
