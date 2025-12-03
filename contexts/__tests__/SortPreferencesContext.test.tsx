// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import {
  SortPreferencesProvider,
  useSortPreferences,
} from '../SortPreferencesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SortOption } from '@/types/sort-preferences';
import { logger } from '@/utils/logger';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('SortPreferencesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('Hook usage', () => {
    it('should throw error when used outside SortPreferencesProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSortPreferences());
      }).toThrow(
        'useSortPreferences must be used within a SortPreferencesProvider'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should work when used inside SortPreferencesProvider', async () => {
      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.preferences.selectedSort).toBe(SortOption.NEWEST);
      });
    });
  });

  describe('Initialization', () => {
    it('should start with default preferences (newest) when no stored data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(SortOption.NEWEST);
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        '@unleashd:preferences:sort'
      );
    });

    it('should load stored preferences on mount', async () => {
      const storedData = {
        version: 1,
        selectedSort: SortOption.NAME_ASC,
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(
          SortOption.NAME_ASC
        );
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should use default preferences if stored data has wrong version', async () => {
      const storedData = {
        version: 999,
        selectedSort: SortOption.OLDEST,
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(SortOption.NEWEST);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Invalid sort preferences data, using defaults'
        );
      });
    });

    it('should use default preferences if stored data is invalid', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(SortOption.NEWEST);
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to load sort preferences from storage:',
          expect.any(Error)
        );
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update sort preference and save to AsyncStorage', async () => {
      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          selectedSort: SortOption.DISTANCE_NEAR,
        });
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(
          SortOption.DISTANCE_NEAR
        );
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:preferences:sort',
        expect.stringContaining(SortOption.DISTANCE_NEAR)
      );
    });

    it('should handle save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          selectedSort: SortOption.OLDEST,
        });
      });

      // Should still update in-memory state even if save fails
      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(SortOption.OLDEST);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save sort preferences to storage:',
        expect.any(Error)
      );
    });

    it('should support partial updates', async () => {
      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          selectedSort: SortOption.NAME_DESC,
        });
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(
          SortOption.NAME_DESC
        );
      });
    });
  });

  describe('clearPreferences', () => {
    it('should clear preferences and reset to defaults', async () => {
      const storedData = {
        version: 1,
        selectedSort: SortOption.DISTANCE_FAR,
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(
          SortOption.DISTANCE_FAR
        );
      });

      await act(async () => {
        await result.current.clearPreferences();
      });

      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(SortOption.NEWEST);
      });

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@unleashd:preferences:sort'
      );
    });

    it('should handle clear errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearPreferences();
      });

      // Should still update in-memory state even if storage clear fails
      await waitFor(() => {
        expect(result.current.preferences.selectedSort).toBe(SortOption.NEWEST);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to clear sort preferences from storage:',
        expect.any(Error)
      );
    });
  });

  describe('Storage format', () => {
    it('should save preferences with correct version and timestamp', async () => {
      const { result } = renderHook(() => useSortPreferences(), {
        wrapper: ({ children }) => (
          <SortPreferencesProvider>{children}</SortPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const beforeUpdate = Date.now();

      await act(async () => {
        await result.current.updatePreferences({
          selectedSort: SortOption.NAME_ASC,
        });
      });

      const afterUpdate = Date.now();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:preferences:sort',
        expect.any(String)
      );

      const savedData = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );

      expect(savedData).toMatchObject({
        version: 1,
        selectedSort: SortOption.NAME_ASC,
      });

      expect(savedData.lastUpdated).toBeGreaterThanOrEqual(beforeUpdate);
      expect(savedData.lastUpdated).toBeLessThanOrEqual(afterUpdate);
    });
  });

  describe('Multiple sort options', () => {
    it('should handle all sort options correctly', async () => {
      const sortOptions = [
        SortOption.NEWEST,
        SortOption.OLDEST,
        SortOption.DISTANCE_NEAR,
        SortOption.DISTANCE_FAR,
        SortOption.NAME_ASC,
        SortOption.NAME_DESC,
      ];

      for (const sortOption of sortOptions) {
        const { result } = renderHook(() => useSortPreferences(), {
          wrapper: ({ children }) => (
            <SortPreferencesProvider>{children}</SortPreferencesProvider>
          ),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
          await result.current.updatePreferences({
            selectedSort: sortOption,
          });
        });

        await waitFor(() => {
          expect(result.current.preferences.selectedSort).toBe(sortOption);
        });
      }
    });
  });
});
