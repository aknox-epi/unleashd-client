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
  SpeciesPreferencesProvider,
  useSpeciesPreferences,
} from '../SpeciesPreferencesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';
import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import type { AnimalSpecies } from '@/services/rescuegroups';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('SpeciesPreferencesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('Hook usage', () => {
    it('should throw error when used outside SpeciesPreferencesProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSpeciesPreferences());
      }).toThrow(
        'useSpeciesPreferences must be used within a SpeciesPreferencesProvider'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should work when used inside SpeciesPreferencesProvider', async () => {
      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
      });
    });
  });

  describe('Initialization', () => {
    it('should start with default preferences (Dog) when no stored data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        '@unleashd:preferences:species'
      );
    });

    it('should load stored preferences on mount', async () => {
      const storedData = {
        version: 1,
        defaultSpecies: 'Cat' as AnimalSpecies,
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe('Cat');
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should use default preferences if stored data has wrong version', async () => {
      const storedData = {
        version: 999,
        defaultSpecies: 'Cat' as AnimalSpecies,
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Invalid species preferences data, using defaults'
        );
      });
    });

    it('should use default preferences if stored data is invalid', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to load species preferences from storage:',
          expect.any(Error)
        );
      });
    });

    it('should use default preferences if defaultSpecies is not a string', async () => {
      const storedData = {
        version: 1,
        defaultSpecies: 123, // Invalid type
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Invalid species preferences data, using defaults'
        );
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update species preference and save to AsyncStorage', async () => {
      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          defaultSpecies: 'Cat',
        });
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe('Cat');
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:preferences:species',
        expect.stringContaining('Cat')
      );
    });

    it('should handle save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          defaultSpecies: 'Rabbit',
        });
      });

      // Should still update in-memory state even if save fails
      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe('Rabbit');
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save species preferences to storage:',
        expect.any(Error)
      );
    });

    it('should support partial updates', async () => {
      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          defaultSpecies: 'Bird',
        });
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe('Bird');
      });
    });
  });

  describe('clearPreferences', () => {
    it('should clear preferences and reset to defaults', async () => {
      const storedData = {
        version: 1,
        defaultSpecies: 'Horse' as AnimalSpecies,
        lastUpdated: Date.now(),
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe('Horse');
      });

      await act(async () => {
        await result.current.clearPreferences();
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
      });

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@unleashd:preferences:species'
      );
    });

    it('should handle clear errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
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
        expect(result.current.preferences.defaultSpecies).toBe(
          RESCUEGROUPS_CONFIG.SPECIES.DOG
        );
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to clear species preferences from storage:',
        expect.any(Error)
      );
    });
  });

  describe('Storage format', () => {
    it('should save preferences with correct version and timestamp', async () => {
      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const beforeUpdate = Date.now();

      await act(async () => {
        await result.current.updatePreferences({
          defaultSpecies: 'Reptile',
        });
      });

      const afterUpdate = Date.now();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:preferences:species',
        expect.any(String)
      );

      const savedData = JSON.parse(
        (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );

      expect(savedData).toMatchObject({
        version: 1,
        defaultSpecies: 'Reptile',
      });

      expect(savedData.lastUpdated).toBeGreaterThanOrEqual(beforeUpdate);
      expect(savedData.lastUpdated).toBeLessThanOrEqual(afterUpdate);
    });
  });

  describe('Multiple species options', () => {
    it('should handle all species options correctly', async () => {
      const speciesOptions: AnimalSpecies[] = [
        'Dog',
        'Cat',
        'Bird',
        'Rabbit',
        'Small Animal',
        'Horse',
        'Reptile',
        'Barnyard',
      ];

      for (const species of speciesOptions) {
        const { result } = renderHook(() => useSpeciesPreferences(), {
          wrapper: ({ children }) => (
            <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
          ),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
          await result.current.updatePreferences({
            defaultSpecies: species,
          });
        });

        await waitFor(() => {
          expect(result.current.preferences.defaultSpecies).toBe(species);
        });
      }
    });
  });

  describe('Concurrent updates', () => {
    it('should handle multiple rapid updates correctly', async () => {
      const { result } = renderHook(() => useSpeciesPreferences(), {
        wrapper: ({ children }) => (
          <SpeciesPreferencesProvider>{children}</SpeciesPreferencesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({ defaultSpecies: 'Cat' });
        await result.current.updatePreferences({ defaultSpecies: 'Bird' });
        await result.current.updatePreferences({ defaultSpecies: 'Rabbit' });
      });

      await waitFor(() => {
        expect(result.current.preferences.defaultSpecies).toBe('Rabbit');
      });

      // Should have saved all updates
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });
});
