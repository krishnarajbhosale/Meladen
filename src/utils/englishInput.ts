/** Printable ASCII only — Latin letters, digits, and common punctuation (no Hindi/other scripts). */
export const ENGLISH_INPUT_REGEX = /^[\x20-\x7E]*$/;

/** Strip anything outside printable ASCII so address fields stay English-only. */
export function sanitizeEnglishInput(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, '');
}

export function isEnglishOnly(value: string): boolean {
  return ENGLISH_INPUT_REGEX.test(value);
}
