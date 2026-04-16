import {
  ALLOWED_CUSTOMIZATION_IMAGE_TYPES,
  DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE,
} from "@/features/commerce/customization-upload";

export function getCustomizationUploadMaxFileSize() {
  const parsedValue = Number(process.env.MIN_HON_UPLOAD_MAX_FILE_SIZE);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_CUSTOMIZATION_UPLOAD_MAX_FILE_SIZE;
  }

  return parsedValue;
}

export function isAllowedCustomizationImageType(fileType: string) {
  return ALLOWED_CUSTOMIZATION_IMAGE_TYPES.includes(
    fileType as (typeof ALLOWED_CUSTOMIZATION_IMAGE_TYPES)[number],
  );
}
