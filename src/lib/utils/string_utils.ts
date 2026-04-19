/**
 * Checks if any of the provided keywords exist in the text as a whole word.
 */
export function includesAnyWord(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => {
    // Escape special regex characters in the keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  });
}

/**
 * Capitalizes the first character of the string.
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Trims whitespace from the start and end of the string. Can be extended in the future to include other normalization steps if needed. 
 */
export function normalize(text: string): string {
  if (!text) return text;

  return text.trim();
}

/**
 * Checks if any of the provided keywords exist in the text NOT NECESSARILY as a whole word.
 */
export function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => {
    // Escape special regex characters in the keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i').test(text);
  });
}

/**
 * Parses a date string in DD/MM/YYYY format or fallbacks to standard Date parsing.
 */
export function parseDateStr(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr);
}