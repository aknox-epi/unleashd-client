import React from 'react';
import { Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Link, LinkText } from '@/components/ui/link';
import { logger } from '@/utils/logger';
import {
  shouldRenderAsHtml,
  decodeHtmlEntities,
  normalizeLineBreaks,
  containsHtmlTags,
  detectUrls,
} from '@/utils/htmlUtils';

interface HtmlTextProps {
  content: string;
  className?: string;
  linkClassName?: string;
  onLinkPress?: (url: string) => void;
}

/**
 * HtmlText component that intelligently renders text with HTML content
 * - Decodes HTML entities (&nbsp;, &amp;, etc.)
 * - Renders basic HTML tags (<br>, <p>, <strong>, <em>, <a>)
 * - Auto-detects and links URLs (including colon-prefixed URLs)
 * - Normalizes line breaks to prevent excessive spacing
 * - Gracefully falls back to plain text on errors
 */
export function HtmlText({
  content,
  className,
  linkClassName = 'text-primary-500 dark:text-primary-400 underline',
  onLinkPress,
}: HtmlTextProps) {
  // Check if HTML rendering is needed
  const needsHtmlRendering = shouldRenderAsHtml(content);

  if (!needsHtmlRendering) {
    return <Text className={className}>{content}</Text>;
  }

  // Process content without creating JSX
  let processedData: {
    type: 'html' | 'links' | 'text' | 'error';
    content: string;
  } = {
    type: 'text',
    content: '',
  };

  try {
    // Step 1: Decode HTML entities
    const decodedContent = decodeHtmlEntities(content);

    // Step 2: Determine rendering type
    if (containsHtmlTags(decodedContent)) {
      processedData = { type: 'html', content: decodedContent };
    } else if (detectUrls(decodedContent)) {
      processedData = {
        type: 'links',
        content: normalizeLineBreaks(decodedContent),
      };
    } else {
      processedData = {
        type: 'text',
        content: normalizeLineBreaks(decodedContent),
      };
    }
  } catch (error) {
    // Silent fallback to plain text with decoded entities
    logger.error('HtmlText: Failed to render HTML content', error);
    processedData = { type: 'error', content: decodeHtmlEntities(content) };
  }

  // Render based on processed data type
  if (processedData.type === 'html') {
    return renderHtmlTags(
      processedData.content,
      className,
      linkClassName,
      onLinkPress
    );
  } else if (processedData.type === 'links') {
    return renderWithLinks(
      processedData.content,
      className,
      linkClassName,
      onLinkPress
    );
  } else {
    return <Text className={className}>{processedData.content}</Text>;
  }
}

/**
 * Handles link press events
 * - Removes colon prefix if present
 * - Adds protocol if missing
 * - Opens URL in browser or calls custom handler
 */
function handleLinkPress(url: string, onLinkPress?: (url: string) => void) {
  try {
    // Remove colon prefix if present (e.g., :https:// -> https://)
    let cleanUrl = url.startsWith(':http') ? url.slice(1) : url;

    // Add protocol if missing
    if (!cleanUrl.match(/^https?:\/\//i)) {
      // For email addresses, use mailto:
      if (cleanUrl.includes('@')) {
        cleanUrl = `mailto:${cleanUrl}`;
      } else {
        // For URLs, add https://
        cleanUrl = `https://${cleanUrl}`;
      }
    }

    if (onLinkPress) {
      onLinkPress(cleanUrl);
    } else {
      Linking.openURL(cleanUrl).catch((err) => {
        logger.error('HtmlText: Failed to open URL', err);
      });
    }
  } catch (error) {
    logger.error('HtmlText: Error handling link press', error);
  }
}

/**
 * Renders text with URLs converted to clickable links
 */
function renderWithLinks(
  text: string,
  className?: string,
  linkClassName?: string,
  onLinkPress?: (url: string) => void
): React.ReactElement {
  // URL detection patterns (same as in detectUrls utility)
  const urlPattern =
    /((?::)?https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|co|us|uk|ca|au|de|fr|jp|cn|in|br|mx|za|nl|se|no|dk|fi|pl|es|it|ru|kr|tw|hk|sg|my|th|vn|ph|id|nz|ie|at|ch|be|pt|gr|cz|ro|hu|tr|il|ae|sa|eg|ng|ke|ug|gh|ma|tn|dz|ao|zw|zm|bw|mw|sz|ls|na|tz|rw|bi|dj|so|er|et|ss|sd|ly|mr|sn|gm|gw|gn|sl|lr|ci|bf|ne|td|cf|cm|ga|cg|cd|ao|st|gq|gy|sr|gy|fk|gl|pm|vc|lc|gd|bb|ag|kn|dm|tt|jm|bs|cu|do|ht|pr|vi|ky|bm|tc|vg|ai|ms|sx|cw|aw|bq|mf|bl|gp|mq|yt|re|mu|sc|mv|km|mg)\/[^\s]*|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  const parts = text.split(urlPattern);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Check if this part is a URL or email
    if (
      part &&
      (part.match(/^:?https?:\/\//i) ||
        part.match(/^www\./i) ||
        part.match(/@/) ||
        part.match(
          /\.(com|org|net|edu|gov|io|co|us|uk|ca|au|de|fr|jp|cn|in|br|mx|za|nl|se|no|dk|fi|pl|es|it|ru|kr|tw|hk|sg|my|th|vn|ph|id|nz|ie|at|ch|be|pt|gr|cz|ro|hu|tr|il|ae|sa|eg|ng|ke|ug|gh|ma|tn|dz|ao|zw|zm|bw|mw|sz|ls|na|tz|rw|bi|dj|so|er|et|ss|sd|ly|mr|sn|gm|gw|gn|sl|lr|ci|bf|ne|td|cf|cm|ga|cg|cd|ao|st|gq|gy|sr|gy|fk|gl|pm|vc|lc|gd|bb|ag|kn|dm|tt|jm|bs|cu|do|ht|pr|vi|ky|bm|tc|vg|ai|ms|sx|cw|aw|bq|mf|bl|gp|mq|yt|re|mu|sc|mv|km|mg)\//i
        ))
    ) {
      // Remove colon prefix from display text
      const displayText = part.startsWith(':') ? part.slice(1) : part;
      elements.push(
        <Link
          key={`link-${i}`}
          onPress={() => handleLinkPress(part, onLinkPress)}
        >
          <LinkText className={linkClassName}>{displayText}</LinkText>
        </Link>
      );
    } else if (part) {
      elements.push(part);
    }
  }

  return <Text className={className}>{elements}</Text>;
}

/**
 * Renders text with HTML tags converted to React Native components
 * Supports: <br>, <p>, <strong>, <b>, <em>, <i>, <a>
 */
function renderHtmlTags(
  html: string,
  className?: string,
  linkClassName?: string,
  onLinkPress?: (url: string) => void
): React.ReactElement {
  // Normalize line breaks first
  let processedHtml = normalizeLineBreaks(html);

  // Convert <br> tags to newlines
  processedHtml = processedHtml.replace(/<br\s*\/?>/gi, '\n');

  // Handle paragraph tags with spacing
  processedHtml = processedHtml.replace(/<p>/gi, '');
  processedHtml = processedHtml.replace(/<\/p>/gi, '\n\n');

  // For this implementation, we'll render the processed HTML as text with inline styling
  // A more complex implementation could parse and render individual tags
  // For now, we'll strip the remaining tags and preserve formatting

  // Strip strong/b/em/i tags but preserve their content
  processedHtml = processedHtml.replace(/<\/?(?:strong|b|em|i)>/gi, '');

  // Handle <a> tags by extracting href and text
  const linkRegex =
    /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(processedHtml)) !== null) {
    const [fullMatch, href, linkText] = match;
    const startIndex = match.index;

    // Add text before the link
    if (startIndex > lastIndex) {
      const textBefore = processedHtml.substring(lastIndex, startIndex);
      if (textBefore) {
        parts.push(textBefore);
      }
    }

    // Add the link
    parts.push(
      <Link
        key={`link-${startIndex}`}
        onPress={() => handleLinkPress(href, onLinkPress)}
      >
        <LinkText className={linkClassName}>{linkText}</LinkText>
      </Link>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < processedHtml.length) {
    parts.push(processedHtml.substring(lastIndex));
  }

  // If no links were found, return simple text
  if (parts.length === 0) {
    processedHtml = normalizeLineBreaks(processedHtml);
    return <Text className={className}>{processedHtml}</Text>;
  }

  return <Text className={className}>{parts}</Text>;
}
