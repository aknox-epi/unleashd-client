/**
 * HTML utility functions for detecting and processing HTML entities, tags, and URLs
 */

/**
 * Map of common HTML entities to their character equivalents
 * Includes both semicolon and non-semicolon variants
 */
const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': '\u00A0',
  '&nbsp': '\u00A0',
  '&amp;': '&',
  '&amp': '&',
  '&lt;': '<',
  '&lt': '<',
  '&gt;': '>',
  '&gt': '>',
  '&quot;': '"',
  '&quot': '"',
  '&#39;': "'",
  '&#39': "'",
  '&apos;': "'",
  '&apos': "'",
  '&mdash;': '\u2014',
  '&mdash': '\u2014',
  '&ndash;': '\u2013',
  '&ndash': '\u2013',
  '&hellip;': '\u2026',
  '&hellip': '\u2026',
  '&rsquo;': '\u2019',
  '&rsquo': '\u2019',
  '&lsquo;': '\u2018',
  '&lsquo': '\u2018',
  '&rdquo;': '\u201D',
  '&rdquo': '\u201D',
  '&ldquo;': '\u201C',
  '&ldquo': '\u201C',
  '&copy;': '\u00A9',
  '&copy': '\u00A9',
  '&reg;': '\u00AE',
  '&reg': '\u00AE',
  '&trade;': '\u2122',
  '&trade': '\u2122',
};

/**
 * Detects if text contains HTML entities
 * Matches both named entities (with/without semicolons) and numeric entities
 */
export function containsHtmlEntities(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Match named entities (with or without semicolon)
  const namedEntityPattern = /&[a-zA-Z]+;?/;
  // Match numeric entities (decimal): &#160; or &#160
  const numericEntityPattern = /&#\d+;?/;
  // Match hex entities: &#x00A0; or &#x00A0
  const hexEntityPattern = /&#x[0-9A-Fa-f]+;?/;

  return (
    namedEntityPattern.test(text) ||
    numericEntityPattern.test(text) ||
    hexEntityPattern.test(text)
  );
}

/**
 * Decodes HTML entities to their character equivalents
 * Handles named entities, numeric entities (decimal and hex), and entities without semicolons
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let decoded = text;

  // Decode numeric entities (decimal): &#160; or &#160
  decoded = decoded.replace(/&#(\d+);?/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Decode hex entities: &#x00A0; or &#x00A0
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);?/gi, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Decode named entities using the map
  // Sort by length (longest first) to handle overlapping patterns
  const sortedEntities = Object.keys(HTML_ENTITIES).sort(
    (a, b) => b.length - a.length
  );

  for (const entity of sortedEntities) {
    const char = HTML_ENTITIES[entity];
    // Use global replace to handle multiple occurrences
    decoded = decoded.split(entity).join(char);
  }

  return decoded;
}

/**
 * Detects if text contains HTML tags we support
 * Supported tags: <br>, <br/>, <br />, <p>, <strong>, <b>, <em>, <i>, <a>
 */
export function containsHtmlTags(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Match opening tags, closing tags, and self-closing tags (case-insensitive)
  const tagPattern =
    /<\s*(br|p|strong|b|em|i|a)(\s+[^>]*)?\s*\/?>|<\s*\/\s*(br|p|strong|b|em|i|a)\s*>/i;

  return tagPattern.test(text);
}

/**
 * Detects if text contains URLs or email addresses
 * Handles various URL formats including colon-prefixed URLs
 */
export function detectUrls(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Match various URL patterns
  const urlPatterns = [
    // Standard URLs with protocol
    /https?:\/\/[^\s]+/i,
    // Colon-prefixed URLs (special case from API)
    /:https?:\/\/[^\s]+/i,
    // www. URLs
    /www\.[^\s]+\.[^\s]+/i,
    // Domain with path/extension (must have slash or common TLD)
    /\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|us|uk|ca|au|de|fr|jp|cn|in|br|mx|za|nl|se|no|dk|fi|pl|es|it|ru|kr|tw|hk|sg|my|th|vn|ph|id|nz|ie|at|ch|be|pt|gr|cz|ro|hu|tr|il|ae|sa|eg|ng|ke|ug|gh|ma|tn|dz|ao|zw|zm|bw|mw|sz|ls|na|tz|rw|bi|dj|so|er|et|ss|sd|ly|mr|sn|gm|gw|gn|sl|lr|ci|bf|ne|td|cf|cm|ga|cg|cd|ao|st|gq|gy|sr|gy|fk|gl|pm|vc|lc|gd|bb|ag|kn|dm|tt|jm|bs|cu|do|ht|pr|vi|ky|bm|tc|vg|ai|ms|sx|cw|aw|bq|mf|bl|gp|mq|yt|re|mu|sc|mv|km|mg|tf|hm|cc|cx|nf|pn|sh|fk|gs|io|vg|ky|ms|tc|bm|ai|sx|mf|bl|gp|mq|yt|re|mu|sc|mv|km|mg)\/[^\s]*/i,
    // Email addresses
    /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
  ];

  return urlPatterns.some((pattern) => pattern.test(text));
}

/**
 * Normalizes line breaks to prevent excessive blank lines
 * Collapses 3+ consecutive line breaks to 2 (max 1 blank line)
 */
export function normalizeLineBreaks(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Replace 3+ consecutive newlines with exactly 2 newlines
  let normalized = text.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Determines if content requires HTML rendering
 * Returns true if text contains HTML entities, tags, or URLs
 */
export function shouldRenderAsHtml(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  return (
    containsHtmlEntities(text) || containsHtmlTags(text) || detectUrls(text)
  );
}
