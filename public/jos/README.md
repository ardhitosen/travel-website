# Image Upload Directory

This directory contains uploaded images for the travel website.

## File Structure
- Images are stored with unique filenames: `{timestamp}-{randomString}.{extension}`
- All images are publicly accessible via `/jos/{filename}`

## Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## File Size Limit
- Maximum file size: 10MB (configurable via MAX_FILE_SIZE environment variable)

## Security
- Files are validated before upload
- Only image files are allowed
- Unique filenames prevent conflicts
