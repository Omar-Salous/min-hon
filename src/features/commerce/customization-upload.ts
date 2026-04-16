export const ALLOWED_CUSTOMIZATION_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024;

export function formatUploadSizeLabel(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes % 1 === 0 ? megabytes.toFixed(0) : megabytes.toFixed(1)}MB`;
}
