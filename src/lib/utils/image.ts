import imageCompression from "browser-image-compression";

export interface ImageCompressOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  quality?: number;
}

/**
 * Compress an image file client-side before uploading.
 * Uses browser-image-compression with configurable settings.
 *
 * @param file - Original File object
 * @param options - Compression options (defaults from settings can be passed)
 * @returns Compressed File/Blob
 */
export async function compressImage(
  file: File,
  options: ImageCompressOptions = {},
): Promise<File> {
  const {
    maxWidthOrHeight = 1920,
    maxSizeMB = 2,
  } = options;

  // Skip compression for small files or non-image types
  if (file.size < 100 * 1024) return file; // < 100KB
  if (!file.type.startsWith("image/")) return file;

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight,
      maxSizeMB,
      useWebWorker: true,
      preserveExif: false,
    });

    // Return as File (imageCompression returns Blob)
    return new File([compressed], file.name, {
      type: compressed.type,
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Image compression failed, using original:", err);
    return file;
  }
}

/**
 * Generate a unique filename for uploads.
 */
export function generateUploadPath(
  bucket: "uploads" | "settings",
  tripId: string | null,
  originalName: string,
): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  if (bucket === "settings") {
    return `${timestamp}-${random}.${ext}`;
  }

  if (tripId) {
    return `trips/${tripId}/${timestamp}-${random}.${ext}`;
  }

  return `misc/${timestamp}-${random}.${ext}`;
}
