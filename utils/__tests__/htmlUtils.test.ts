import {
  containsHtmlEntities,
  decodeHtmlEntities,
  containsHtmlTags,
  detectUrls,
  normalizeLineBreaks,
  shouldRenderAsHtml,
} from '../htmlUtils';

describe('htmlUtils', () => {
  describe('containsHtmlEntities', () => {
    it('should detect entities with semicolons', () => {
      expect(containsHtmlEntities('&nbsp;')).toBe(true);
      expect(containsHtmlEntities('&amp;')).toBe(true);
      expect(containsHtmlEntities('&lt;')).toBe(true);
      expect(containsHtmlEntities('&gt;')).toBe(true);
      expect(containsHtmlEntities('&quot;')).toBe(true);
      expect(containsHtmlEntities('&#39;')).toBe(true);
    });

    it('should detect entities without semicolons', () => {
      expect(containsHtmlEntities('&nbsp')).toBe(true);
      expect(containsHtmlEntities('&amp')).toBe(true);
      expect(containsHtmlEntities('&lt')).toBe(true);
      expect(containsHtmlEntities('&gt')).toBe(true);
    });

    it('should detect numeric entities (decimal)', () => {
      expect(containsHtmlEntities('&#160;')).toBe(true);
      expect(containsHtmlEntities('&#160')).toBe(true);
      expect(containsHtmlEntities('&#60;')).toBe(true);
    });

    it('should detect numeric entities (hex)', () => {
      expect(containsHtmlEntities('&#x00A0;')).toBe(true);
      expect(containsHtmlEntities('&#x00A0')).toBe(true);
      expect(containsHtmlEntities('&#xA0;')).toBe(true);
      expect(containsHtmlEntities('&#xA0')).toBe(true);
    });

    it('should detect entities in mixed text', () => {
      expect(containsHtmlEntities('Hello&nbsp;world')).toBe(true);
      expect(containsHtmlEntities('Tom &amp; Jerry')).toBe(true);
      expect(containsHtmlEntities('Test &#160; content')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(containsHtmlEntities('Hello world')).toBe(false);
      expect(containsHtmlEntities('This is plain text')).toBe(false);
      expect(containsHtmlEntities('No entities here')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(containsHtmlEntities('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(containsHtmlEntities(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(containsHtmlEntities(undefined)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(containsHtmlEntities(123)).toBe(false);
    });

    it('should handle text with ampersands that are not entities', () => {
      expect(containsHtmlEntities('Fish & Chips')).toBe(false);
      expect(containsHtmlEntities('Rock & Roll')).toBe(false);
    });
  });

  describe('decodeHtmlEntities', () => {
    it('should decode common named entities with semicolons', () => {
      expect(decodeHtmlEntities('&nbsp;')).toBe('\u00A0');
      expect(decodeHtmlEntities('&amp;')).toBe('&');
      expect(decodeHtmlEntities('&lt;')).toBe('<');
      expect(decodeHtmlEntities('&gt;')).toBe('>');
      expect(decodeHtmlEntities('&quot;')).toBe('"');
      expect(decodeHtmlEntities('&#39;')).toBe("'");
    });

    it('should decode named entities without semicolons', () => {
      expect(decodeHtmlEntities('&nbsp')).toBe('\u00A0');
      expect(decodeHtmlEntities('&amp')).toBe('&');
      expect(decodeHtmlEntities('&lt')).toBe('<');
      expect(decodeHtmlEntities('&gt')).toBe('>');
    });

    it('should decode numeric entities (decimal)', () => {
      expect(decodeHtmlEntities('&#160;')).toBe('\u00A0');
      expect(decodeHtmlEntities('&#160')).toBe('\u00A0');
      expect(decodeHtmlEntities('&#60;')).toBe('<');
      expect(decodeHtmlEntities('&#62;')).toBe('>');
    });

    it('should decode numeric entities (hex)', () => {
      expect(decodeHtmlEntities('&#x00A0;')).toBe('\u00A0');
      expect(decodeHtmlEntities('&#x00A0')).toBe('\u00A0');
      expect(decodeHtmlEntities('&#xA0;')).toBe('\u00A0');
      expect(decodeHtmlEntities('&#xA0')).toBe('\u00A0');
    });

    it('should decode multiple entities in one string', () => {
      expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>');
      expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom & Jerry');
      expect(decodeHtmlEntities('&quot;Hello&quot;')).toBe('"Hello"');
    });

    it('should decode consecutive entities', () => {
      expect(decodeHtmlEntities('&nbsp;&nbsp;&nbsp;')).toBe(
        '\u00A0\u00A0\u00A0'
      );
      expect(decodeHtmlEntities('&nbsp&nbsp&nbsp')).toBe('\u00A0\u00A0\u00A0');
    });

    it('should handle mixed entities and plain text', () => {
      expect(decodeHtmlEntities('Hello&nbsp;world')).toBe('Hello\u00A0world');
      expect(decodeHtmlEntities('&nbsp;Rambo is quite silly&nbsp;')).toBe(
        '\u00A0Rambo is quite silly\u00A0'
      );
    });

    it('should preserve text without entities', () => {
      expect(decodeHtmlEntities('Hello world')).toBe('Hello world');
      expect(decodeHtmlEntities('No entities here')).toBe('No entities here');
    });

    it('should decode special punctuation entities', () => {
      expect(decodeHtmlEntities('&mdash;')).toBe('\u2014');
      expect(decodeHtmlEntities('&ndash;')).toBe('\u2013');
      expect(decodeHtmlEntities('&hellip;')).toBe('\u2026');
    });

    it('should handle edge cases', () => {
      expect(decodeHtmlEntities('')).toBe('');
      // @ts-expect-error Testing invalid input
      expect(decodeHtmlEntities(null)).toBe('');
      // @ts-expect-error Testing invalid input
      expect(decodeHtmlEntities(undefined)).toBe('');
    });
  });

  describe('containsHtmlTags', () => {
    it('should detect self-closing br tags', () => {
      expect(containsHtmlTags('<br>')).toBe(true);
      expect(containsHtmlTags('<br/>')).toBe(true);
      expect(containsHtmlTags('<br />')).toBe(true);
    });

    it('should detect paired tags', () => {
      expect(containsHtmlTags('<p>')).toBe(true);
      expect(containsHtmlTags('</p>')).toBe(true);
      expect(containsHtmlTags('<strong>')).toBe(true);
      expect(containsHtmlTags('</strong>')).toBe(true);
      expect(containsHtmlTags('<b>')).toBe(true);
      expect(containsHtmlTags('<em>')).toBe(true);
      expect(containsHtmlTags('<i>')).toBe(true);
      expect(containsHtmlTags('<a>')).toBe(true);
    });

    it('should detect tags with attributes', () => {
      expect(containsHtmlTags('<a href="http://example.com">')).toBe(true);
      expect(containsHtmlTags('<p class="text">')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(containsHtmlTags('<BR>')).toBe(true);
      expect(containsHtmlTags('<P>')).toBe(true);
      expect(containsHtmlTags('<STRONG>')).toBe(true);
    });

    it('should detect tags in mixed text', () => {
      expect(containsHtmlTags('Hello<br>world')).toBe(true);
      expect(containsHtmlTags('<p>Paragraph</p>')).toBe(true);
      expect(containsHtmlTags('Text with <strong>bold</strong> words')).toBe(
        true
      );
    });

    it('should return false for plain text', () => {
      expect(containsHtmlTags('Hello world')).toBe(false);
      expect(containsHtmlTags('No tags here')).toBe(false);
    });

    it('should detect unsupported tags (returns true for any tag)', () => {
      expect(containsHtmlTags('<div>')).toBe(false);
      expect(containsHtmlTags('<span>')).toBe(false);
      expect(containsHtmlTags('<script>')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(containsHtmlTags('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(containsHtmlTags(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(containsHtmlTags(undefined)).toBe(false);
    });

    it('should handle text with angle brackets that are not tags', () => {
      expect(containsHtmlTags('5 < 10')).toBe(false);
      expect(containsHtmlTags('10 > 5')).toBe(false);
    });
  });

  describe('detectUrls', () => {
    it('should detect https:// URLs', () => {
      expect(detectUrls('https://example.com')).toBe(true);
      expect(detectUrls('Visit https://google.com for info')).toBe(true);
      expect(detectUrls('https://example.com/path')).toBe(true);
    });

    it('should detect http:// URLs', () => {
      expect(detectUrls('http://example.com')).toBe(true);
      expect(detectUrls('Visit http://google.com for info')).toBe(true);
    });

    it('should detect www. URLs', () => {
      expect(detectUrls('www.example.com')).toBe(true);
      expect(detectUrls('Visit www.google.com')).toBe(true);
    });

    it('should detect domain.com/path URLs', () => {
      expect(detectUrls('example.com/adoption')).toBe(true);
      expect(detectUrls('google.com/search')).toBe(true);
      expect(detectUrls('github.com/user/repo')).toBe(true);
    });

    it('should detect colon-prefixed URLs', () => {
      expect(detectUrls(':https://example.com')).toBe(true);
      expect(
        detectUrls(':https://hsburnettcty.org/adoption-application/')
      ).toBe(true);
      expect(detectUrls(':http://example.com')).toBe(true);
    });

    it('should detect email addresses', () => {
      expect(detectUrls('contact@example.com')).toBe(true);
      expect(detectUrls('Email us at info@shelter.org')).toBe(true);
      expect(detectUrls('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(detectUrls('Hello world')).toBe(false);
      expect(detectUrls('No URLs here')).toBe(false);
    });

    it('should avoid false positives', () => {
      expect(detectUrls('example.text')).toBe(false);
      expect(detectUrls('file.txt')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(detectUrls('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(detectUrls(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(detectUrls(undefined)).toBe(false);
    });

    it('should detect multiple URLs in text', () => {
      expect(detectUrls('Visit https://example.com or www.google.com')).toBe(
        true
      );
    });
  });

  describe('normalizeLineBreaks', () => {
    it('should collapse 3+ line breaks to 2', () => {
      expect(normalizeLineBreaks('Line 1\n\n\nLine 2')).toBe(
        'Line 1\n\nLine 2'
      );
      expect(normalizeLineBreaks('Line 1\n\n\n\nLine 2')).toBe(
        'Line 1\n\nLine 2'
      );
      expect(normalizeLineBreaks('Line 1\n\n\n\n\nLine 2')).toBe(
        'Line 1\n\nLine 2'
      );
    });

    it('should preserve single line breaks', () => {
      expect(normalizeLineBreaks('Line 1\nLine 2')).toBe('Line 1\nLine 2');
    });

    it('should preserve double line breaks', () => {
      expect(normalizeLineBreaks('Line 1\n\nLine 2')).toBe('Line 1\n\nLine 2');
    });

    it('should trim leading/trailing whitespace', () => {
      expect(normalizeLineBreaks('  Hello  ')).toBe('Hello');
      expect(normalizeLineBreaks('\n\nHello\n\n')).toBe('Hello');
      expect(normalizeLineBreaks('   \nHello\n   ')).toBe('Hello');
    });

    it('should handle strings with only line breaks', () => {
      expect(normalizeLineBreaks('\n\n\n')).toBe('');
      expect(normalizeLineBreaks('\n\n\n\n\n')).toBe('');
    });

    it('should handle empty strings', () => {
      expect(normalizeLineBreaks('')).toBe('');
    });

    it('should handle edge cases', () => {
      // @ts-expect-error Testing invalid input
      expect(normalizeLineBreaks(null)).toBe('');
      // @ts-expect-error Testing invalid input
      expect(normalizeLineBreaks(undefined)).toBe('');
    });

    it('should handle multiple sections with excessive line breaks', () => {
      expect(
        normalizeLineBreaks('Section 1\n\n\nSection 2\n\n\nSection 3')
      ).toBe('Section 1\n\nSection 2\n\nSection 3');
    });
  });

  describe('shouldRenderAsHtml', () => {
    it('should return true for text with HTML entities', () => {
      expect(shouldRenderAsHtml('&nbsp;')).toBe(true);
      expect(shouldRenderAsHtml('Tom &amp; Jerry')).toBe(true);
      expect(shouldRenderAsHtml('&#160;')).toBe(true);
    });

    it('should return true for text with HTML tags', () => {
      expect(shouldRenderAsHtml('<br>')).toBe(true);
      expect(shouldRenderAsHtml('<p>Text</p>')).toBe(true);
      expect(shouldRenderAsHtml('<strong>Bold</strong>')).toBe(true);
    });

    it('should return true for text with URLs', () => {
      expect(shouldRenderAsHtml('https://example.com')).toBe(true);
      expect(shouldRenderAsHtml('www.google.com')).toBe(true);
      expect(shouldRenderAsHtml('contact@example.com')).toBe(true);
    });

    it('should return true for mixed content', () => {
      expect(shouldRenderAsHtml('&nbsp;Visit https://example.com')).toBe(true);
      expect(shouldRenderAsHtml('<p>See www.example.com</p>')).toBe(true);
      expect(shouldRenderAsHtml('&nbsp;<br>https://example.com')).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(shouldRenderAsHtml('Hello world')).toBe(false);
      expect(shouldRenderAsHtml('This is plain text')).toBe(false);
      expect(shouldRenderAsHtml('No HTML here')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(shouldRenderAsHtml('')).toBe(false);
    });

    it('should handle edge cases', () => {
      // @ts-expect-error Testing invalid input
      expect(shouldRenderAsHtml(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(shouldRenderAsHtml(undefined)).toBe(false);
    });

    it('should return false for text with ampersands that are not entities', () => {
      expect(shouldRenderAsHtml('Fish & Chips')).toBe(false);
    });
  });
});
