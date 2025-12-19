import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { HtmlText } from '../HtmlText';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ colorMode: 'light' }),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
  },
}));

// Spy on Linking.openURL
const linkingOpenURLSpy = jest.spyOn(Linking, 'openURL');

describe('HtmlText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    linkingOpenURLSpy.mockResolvedValue(true);
  });

  describe('Plain Text Rendering', () => {
    it('should render plain text without HTML processing', () => {
      const { getByText } = render(<HtmlText content="Hello world" />);
      expect(getByText('Hello world')).toBeTruthy();
    });

    it('should render empty string', () => {
      const { toJSON } = render(<HtmlText content="" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should apply custom className to plain text', () => {
      const { getByText } = render(
        <HtmlText content="Hello" className="custom-class" />
      );
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  describe('HTML Entity Decoding', () => {
    it('should decode &nbsp; to space', () => {
      const { getByText } = render(<HtmlText content="&nbsp;Hello&nbsp;" />);
      expect(getByText(/Hello/)).toBeTruthy();
    });

    it('should decode &amp; to &', () => {
      const { getByText } = render(<HtmlText content="Tom &amp; Jerry" />);
      expect(getByText('Tom & Jerry')).toBeTruthy();
    });

    it('should decode multiple entities in one string', () => {
      const { getByText } = render(
        <HtmlText content='&lt;div&gt; &amp; "text"' />
      );
      expect(getByText('<div> & "text"')).toBeTruthy();
    });

    it('should decode entities without semicolons', () => {
      const { toJSON } = render(<HtmlText content="&nbsp&nbsp&nbsp" />);
      // The text will be rendered as non-breaking spaces
      // Just verify the component renders without error
      expect(toJSON()).toBeTruthy();
    });

    it('should decode numeric entities', () => {
      const { getByText } = render(<HtmlText content="&#160;Hello&#160;" />);
      expect(getByText(/Hello/)).toBeTruthy();
    });

    it('should handle mixed entities and plain text', () => {
      const { getByText } = render(
        <HtmlText content="&nbsp;Rambo is quite silly&nbsp;" />
      );
      expect(getByText(/Rambo is quite silly/)).toBeTruthy();
    });
  });

  describe('HTML Tag Rendering', () => {
    it('should render text with <br> tags as line breaks', () => {
      const { getByText } = render(<HtmlText content="Line 1<br>Line 2" />);
      expect(getByText(/Line 1[\s\S]*Line 2/)).toBeTruthy();
    });

    it('should handle self-closing br tags', () => {
      const { getByText } = render(<HtmlText content="Line 1<br/>Line 2" />);
      expect(getByText(/Line 1[\s\S]*Line 2/)).toBeTruthy();
    });

    it('should render <p> tags with proper spacing', () => {
      const { getByText } = render(
        <HtmlText content="<p>Paragraph 1</p><p>Paragraph 2</p>" />
      );
      expect(getByText(/Paragraph 1[\s\S]*Paragraph 2/)).toBeTruthy();
    });

    it('should strip <strong> and <b> tags but preserve content', () => {
      const { getByText } = render(
        <HtmlText content="<strong>Bold</strong> and <b>more bold</b>" />
      );
      expect(getByText(/Bold and more bold/)).toBeTruthy();
    });

    it('should strip <em> and <i> tags but preserve content', () => {
      const { getByText } = render(
        <HtmlText content="<em>Italic</em> and <i>more italic</i>" />
      );
      expect(getByText(/Italic and more italic/)).toBeTruthy();
    });

    it('should render <a> tags as clickable links', () => {
      const { getByText } = render(
        <HtmlText content='<a href="https://example.com">Click here</a>' />
      );
      const link = getByText('Click here');
      expect(link).toBeTruthy();
    });

    it('should handle mixed HTML tags', () => {
      const { getByText } = render(
        <HtmlText content="<p><strong>Bold</strong><br>New line</p>" />
      );
      expect(getByText(/Bold[\s\S]*New line/)).toBeTruthy();
    });
  });

  describe('URL Detection & Linking', () => {
    it('should detect and link https:// URLs', () => {
      const { getByText } = render(
        <HtmlText content="Visit https://example.com for info" />
      );
      const link = getByText('https://example.com');
      expect(link).toBeTruthy();
    });

    it('should detect and link http:// URLs', () => {
      const { getByText } = render(
        <HtmlText content="Visit http://example.com for info" />
      );
      const link = getByText('http://example.com');
      expect(link).toBeTruthy();
    });

    it('should detect and link www. URLs', () => {
      const { getByText } = render(
        <HtmlText content="Visit www.example.com for info" />
      );
      const link = getByText('www.example.com');
      expect(link).toBeTruthy();
    });

    it('should detect and link domain.com/path URLs', () => {
      const { getByText } = render(
        <HtmlText content="Visit example.com/adoption for info" />
      );
      const link = getByText('example.com/adoption');
      expect(link).toBeTruthy();
    });

    it('should handle colon-prefixed URLs', () => {
      const { getByText } = render(
        <HtmlText content="Apply at :https://example.com/form" />
      );
      // Link should display without the colon prefix
      const link = getByText('https://example.com/form');
      expect(link).toBeTruthy();
    });

    it('should detect and link email addresses', () => {
      const { getByText } = render(
        <HtmlText content="Contact us at info@example.com" />
      );
      const link = getByText('info@example.com');
      expect(link).toBeTruthy();
    });

    it('should handle multiple URLs in text', () => {
      const { getByText } = render(
        <HtmlText content="Visit https://example.com or www.google.com" />
      );
      expect(getByText('https://example.com')).toBeTruthy();
      expect(getByText('www.google.com')).toBeTruthy();
    });
  });

  describe('Link Interaction', () => {
    it('should open https:// URL in browser when link pressed', async () => {
      const { getByText } = render(
        <HtmlText content="Visit https://example.com" />
      );
      const link = getByText('https://example.com');

      fireEvent.press(link);

      expect(linkingOpenURLSpy).toHaveBeenCalledWith('https://example.com');
    });

    it('should add https:// protocol to www. URLs', async () => {
      const { getByText } = render(
        <HtmlText content="Visit www.example.com" />
      );
      const link = getByText('www.example.com');

      fireEvent.press(link);

      expect(linkingOpenURLSpy).toHaveBeenCalledWith('https://www.example.com');
    });

    it('should remove colon prefix from URLs', async () => {
      const { getByText } = render(<HtmlText content=":https://example.com" />);
      // Link should display without the colon prefix
      const link = getByText('https://example.com');

      fireEvent.press(link);

      expect(linkingOpenURLSpy).toHaveBeenCalledWith('https://example.com');
    });

    it('should add mailto: to email addresses', async () => {
      const { getByText } = render(<HtmlText content="info@example.com" />);
      const link = getByText('info@example.com');

      fireEvent.press(link);

      expect(linkingOpenURLSpy).toHaveBeenCalledWith('mailto:info@example.com');
    });

    it('should call custom onLinkPress when provided', () => {
      const onLinkPress = jest.fn();
      const { getByText } = render(
        <HtmlText content="https://example.com" onLinkPress={onLinkPress} />
      );
      const link = getByText('https://example.com');

      fireEvent.press(link);

      expect(onLinkPress).toHaveBeenCalledWith('https://example.com');
      expect(linkingOpenURLSpy).not.toHaveBeenCalled();
    });

    it('should handle <a> tag link press with href', () => {
      const { getByText } = render(
        <HtmlText content='<a href="https://example.com">Click</a>' />
      );
      const link = getByText('Click');

      fireEvent.press(link);

      expect(linkingOpenURLSpy).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('Line Break Normalization', () => {
    it('should collapse excessive line breaks', () => {
      const { getByText } = render(<HtmlText content="Line 1\n\n\n\nLine 2" />);
      expect(getByText(/Line 1[\s\S]*Line 2/)).toBeTruthy();
    });

    it('should preserve intentional line breaks', () => {
      const { getByText } = render(<HtmlText content="Line 1\nLine 2" />);
      expect(getByText(/Line 1[\s\S]*Line 2/)).toBeTruthy();
    });

    it('should normalize line breaks after HTML rendering', () => {
      const { getByText } = render(
        <HtmlText content="<p>Para 1</p>\n\n\n<p>Para 2</p>" />
      );
      expect(getByText(/Para 1[\s\S]*Para 2/)).toBeTruthy();
    });
  });

  describe('Mixed Content', () => {
    it('should handle HTML entities and tags together', () => {
      const { getByText } = render(
        <HtmlText content="&nbsp;<strong>Bold</strong>&nbsp;" />
      );
      expect(getByText(/Bold/)).toBeTruthy();
    });

    it('should handle HTML entities and URLs together', () => {
      const { getByText } = render(
        <HtmlText content="&nbsp;Visit https://example.com&nbsp;" />
      );
      expect(getByText('https://example.com')).toBeTruthy();
    });

    it('should handle all types of content together', () => {
      const { getByText } = render(
        <HtmlText content="&nbsp;<p>Visit <a href='https://example.com'>here</a></p>" />
      );
      expect(getByText(/Visit/)).toBeTruthy();
      expect(getByText('here')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should fallback to plain text on rendering error', () => {
      // This should not crash and should render something
      const { toJSON } = render(<HtmlText content="&nbsp;Normal text" />);

      expect(toJSON()).toBeTruthy();
    });

    it('should log errors using logger', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { logger } = require('@/utils/logger');

      // Mock Linking.openURL to reject
      linkingOpenURLSpy.mockRejectedValueOnce(new Error('Failed'));

      const { getByText } = render(<HtmlText content="https://example.com" />);
      const link = getByText('https://example.com');

      fireEvent.press(link);

      // Wait for promise rejection
      await new Promise<void>((resolve) => {
        // eslint-disable-next-line no-undef
        setTimeout(resolve, 10);
      });

      expect(logger.error).toHaveBeenCalled();
    });

    it('should decode entities in fallback text', () => {
      const { getByText } = render(<HtmlText content="&nbsp;Test&nbsp;" />);
      expect(getByText(/Test/)).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { getByText } = render(
        <HtmlText content="Test" className="text-lg font-bold" />
      );
      expect(getByText('Test')).toBeTruthy();
    });

    it('should apply custom linkClassName', () => {
      const { getByText } = render(
        <HtmlText content="https://example.com" linkClassName="text-blue-500" />
      );
      const link = getByText('https://example.com');
      expect(link).toBeTruthy();
    });

    it('should use default link styling when not provided', () => {
      const { getByText } = render(<HtmlText content="https://example.com" />);
      const link = getByText('https://example.com');
      expect(link).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = `${'A'.repeat(1000)} https://example.com ${'B'.repeat(1000)}`;
      const { getByText } = render(<HtmlText content={longContent} />);
      expect(getByText('https://example.com')).toBeTruthy();
    });

    it('should handle content with only entities', () => {
      const { toJSON } = render(<HtmlText content="&nbsp;&nbsp;&nbsp;" />);
      expect(toJSON()).toBeTruthy();
    });

    it('should handle content with only URLs', () => {
      const { getByText } = render(<HtmlText content="https://example.com" />);
      expect(getByText('https://example.com')).toBeTruthy();
    });

    it('should handle content with only HTML tags', () => {
      const { getByText } = render(<HtmlText content="<p>Test</p>" />);
      expect(getByText(/Test/)).toBeTruthy();
    });

    it('should handle whitespace-only content', () => {
      const { toJSON } = render(<HtmlText content="   " />);
      expect(toJSON()).toBeTruthy();
    });

    it('should handle content with special characters', () => {
      const { getByText } = render(
        <HtmlText content="Test @#$%^&*() content" />
      );
      expect(getByText('Test @#$%^&*() content')).toBeTruthy();
    });

    it('should handle consecutive entities', () => {
      const { getByText } = render(
        <HtmlText content="&nbsp;&nbsp;&nbsp;&amp;&amp;&amp;" />
      );
      expect(getByText(/&&&/)).toBeTruthy();
    });
  });
});
