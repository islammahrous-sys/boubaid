/**
 * Storage Guard & Cleanup Server Utilities
 *
 * Enforces server-side validation for file uploads (size limits, MIME types, extensions)
 * and provides safe storage object deletion for replaced/deleted media assets.
 */

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const ALLOWED_DOCUMENT_MIMES = [
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_DOC_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export type FileValidationResult =
  | { valid: true }
  | {
      valid: false;
      error: "file_too_large" | "invalid_mime_type" | "invalid_extension" | "empty_file";
    };

export function validateFileUpload(options: {
  sizeBytes: number;
  mimeType: string;
  filename: string;
  category: "image" | "document" | "receipt";
}): FileValidationResult {
  if (options.sizeBytes <= 0) {
    return { valid: false, error: "empty_file" };
  }

  const maxSize = options.category === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_DOC_SIZE_BYTES;
  if (options.sizeBytes > maxSize) {
    return { valid: false, error: "file_too_large" };
  }

  const allowedMimes =
    options.category === "image"
      ? ALLOWED_IMAGE_MIMES
      : [...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES];

  if (!allowedMimes.includes(options.mimeType.toLowerCase())) {
    return { valid: false, error: "invalid_mime_type" };
  }

  const ext = options.filename.split(".").pop()?.toLowerCase();
  if (!ext || !/^[a-z0-9]{2,5}$/.test(ext)) {
    return { valid: false, error: "invalid_extension" };
  }

  return { valid: true };
}

/**
 * Clean up an old storage asset when it is replaced or when its parent entity is deleted.
 */
export async function deleteStorageAsset(bucket: string, storagePath: string): Promise<boolean> {
  if (!bucket || !storagePath) return false;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage.from(bucket).remove([storagePath]);
    if (error) {
      console.warn(`[storage-cleanup] failed to delete ${bucket}/${storagePath}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[storage-cleanup] error deleting ${bucket}/${storagePath}:`, err);
    return false;
  }
}
