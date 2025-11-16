/**
 * Validates US zip codes (5 digits or 5+4 format)
 */
export function isValidZipCode(zipCode: string): boolean {
  if (!zipCode || typeof zipCode !== 'string') {
    return false;
  }

  // Remove spaces and trim
  const cleaned = zipCode.trim().replace(/\s+/g, '');

  // Check for 5-digit format (12345)
  const fiveDigitPattern = /^\d{5}$/;

  // Check for 5+4 format (12345-6789)
  const ninedigitPattern = /^\d{5}-\d{4}$/;

  return fiveDigitPattern.test(cleaned) || ninedigitPattern.test(cleaned);
}

/**
 * Formats a zip code to ensure consistent format
 * Removes spaces and ensures proper format
 */
export function formatZipCode(zipCode: string): string {
  if (!zipCode) {
    return '';
  }

  // Remove all spaces and non-digit/non-hyphen characters
  const cleaned = zipCode.replace(/[^\d-]/g, '');

  // If it contains a hyphen, format as 5+4
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    const zip5 = parts[0].substring(0, 5);
    const zip4 = parts[1]?.substring(0, 4) || '';
    return zip4 ? `${zip5}-${zip4}` : zip5;
  }

  // Otherwise, just take the first 5 digits
  return cleaned.substring(0, 5);
}

/**
 * Gets the base 5-digit zip code from any format
 */
export function getBaseZipCode(zipCode: string): string {
  if (!zipCode) {
    return '';
  }

  const formatted = formatZipCode(zipCode);
  return formatted.split('-')[0];
}
