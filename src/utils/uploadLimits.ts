export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_LABEL = '5 MB';

export function assertImageFileWithinLimit(file: File): void {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(`Image must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller`);
  }
}
