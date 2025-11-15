// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock useColorScheme from react-native directly at the library level
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(),
}));

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockUseColorScheme.mockReturnValue('light');
  });

  describe('Hook usage', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should work when used inside ThemeProvider', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.colorMode).toBe('light');
      });
    });
  });

  describe('Initialization', () => {
    it('should default to system color scheme on first load', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });

    it('should default to dark when system is dark', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });
    });

    it('should load stored light preference from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });

    it('should load stored dark preference from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });
    });

    it('should ignore invalid stored values and default to system', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid');
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });

    it('should handle AsyncStorage read errors gracefully', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load theme preference:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Color mode management', () => {
    it('should set color mode to light', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });

      await act(async () => {
        await result.current.setColorMode('light');
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          '@unleashd/theme_preference',
          'light'
        );
      });
    });

    it('should set color mode to dark', async () => {
      mockUseColorScheme.mockReturnValue('light');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      await act(async () => {
        await result.current.setColorMode('dark');
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          '@unleashd/theme_preference',
          'dark'
        );
      });
    });

    it('should handle AsyncStorage write errors', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Write error'));
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      await act(async () => {
        await result.current.setColorMode('dark');
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save theme preference:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Toggle behavior', () => {
    it('should toggle from light to dark', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      act(() => {
        result.current.toggleColorMode();
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });
    });

    it('should toggle from dark to light', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('dark');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });

      act(() => {
        result.current.toggleColorMode();
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });

    it('should toggle multiple times correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      // light → dark
      await act(async () => {
        await result.current.toggleColorMode();
      });
      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });

      // dark → light
      await act(async () => {
        await result.current.toggleColorMode();
      });
      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      // light → dark again
      await act(async () => {
        await result.current.toggleColorMode();
      });
      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });
    });
  });

  describe('System preference detection', () => {
    it('should use light when system is light and no stored preference', async () => {
      mockUseColorScheme.mockReturnValue('light');
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });

    it('should use dark when system is dark and no stored preference', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('dark');
      });
    });

    it('should fallback to light when system returns null', async () => {
      mockUseColorScheme.mockReturnValue(null);
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });

    it('should ignore system preference when stored preference exists', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      mockAsyncStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });
    });
  });

  describe('Persistence', () => {
    it('should save to AsyncStorage when color mode changes', async () => {
      mockUseColorScheme.mockReturnValue('light');
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(result.current.colorMode).toBe('light');
      });

      await act(async () => {
        await result.current.setColorMode('dark');
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          '@unleashd/theme_preference',
          'dark'
        );
      });
    });

    it('should load from AsyncStorage on mount', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('dark');

      renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
          '@unleashd/theme_preference'
        );
      });
    });
  });
});
