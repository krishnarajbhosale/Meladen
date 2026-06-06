/** Keep only digits, capped at 10 (Indian mobile without country code). */
export function sanitizePhoneDigits(value: string, maxDigits = 10): string {
  return value.replace(/\D/g, '').slice(0, maxDigits);
}
