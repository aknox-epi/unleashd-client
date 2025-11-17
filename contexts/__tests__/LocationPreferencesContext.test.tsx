import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LocationPreferencesProvider,
  useLocationPreferences,
} from '../LocationPreferencesContext';
import type { StoredLocationData } from '@/types/location-preferences';

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
  },
}));

describe('LocationPreferencesContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LocationPreferencesProvider>{children}</LocationPreferencesProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('loads preferences from AsyncStorage on mount', async () => {
      const storedData: StoredLocationData = {
        version: 1,
        zipCode: '94102',
        radius: 25,
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(storedData)
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.zipCode).toBe('94102');
      expect(result.current.preferences.radius).toBe(25);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@unleashd:preferences:location'
      );
    });

    it('starts with empty preferences when no data stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
    });

    it('handles corrupted data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        'invalid json {'
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should start with empty preferences on error
      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
    });

    it('handles invalid version gracefully', async () => {
      const invalidData = {
        version: 999,
        zipCode: '94102',
        radius: 25,
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(invalidData)
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should start with empty preferences when version doesn't match
      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
    });

    it('handles storage read errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should start with empty preferences on error
      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
    });
  });

  describe('Update Preferences', () => {
    it('updates preferences and saves to AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          zipCode: '90210',
          radius: 50,
        });
      });

      expect(result.current.preferences.zipCode).toBe('90210');
      expect(result.current.preferences.radius).toBe(50);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:preferences:location',
        expect.stringContaining('"zipCode":"90210"')
      );
    });

    it('supports partial updates', async () => {
      const storedData: StoredLocationData = {
        version: 1,
        zipCode: '94102',
        radius: 25,
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(storedData)
      );
      (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Update only zipCode
      await act(async () => {
        await result.current.updatePreferences({ zipCode: '10001' });
      });

      expect(result.current.preferences.zipCode).toBe('10001');
      expect(result.current.preferences.radius).toBe(25); // Unchanged
    });

    it('handles storage write errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Write error')
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferences({
          zipCode: '90210',
          radius: 50,
        });
      });

      // In-memory state should still be updated even if storage fails
      expect(result.current.preferences.zipCode).toBe('90210');
      expect(result.current.preferences.radius).toBe(50);
    });
  });

  describe('Clear Preferences', () => {
    it('clears preferences and removes from AsyncStorage', async () => {
      const storedData: StoredLocationData = {
        version: 1,
        zipCode: '94102',
        radius: 25,
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(storedData)
      );
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.zipCode).toBe('94102');

      await act(async () => {
        await result.current.clearPreferences();
      });

      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@unleashd:preferences:location'
      );
    });

    it('clears in-memory state even if storage removal fails', async () => {
      const storedData: StoredLocationData = {
        version: 1,
        zipCode: '94102',
        radius: 25,
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(storedData)
      );
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Remove error')
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearPreferences();
      });

      // In-memory state should still be cleared
      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
    });
  });

  describe('Hook Usage', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useLocationPreferences());
      }).toThrow(
        'useLocationPreferences must be used within a LocationPreferencesProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Data Validation', () => {
    it('validates data structure on load', async () => {
      const invalidData = {
        version: 1,
        zipCode: 12345, // Should be string
        radius: '25', // Should be number or empty string
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(invalidData)
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use defaults when validation fails
      expect(result.current.preferences.zipCode).toBe('');
      expect(result.current.preferences.radius).toBe('');
    });

    it('accepts empty string for radius', async () => {
      const storedData: StoredLocationData = {
        version: 1,
        zipCode: '94102',
        radius: '',
        lastUpdated: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(storedData)
      );

      const { result } = renderHook(() => useLocationPreferences(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.zipCode).toBe('94102');
      expect(result.current.preferences.radius).toBe('');
    });
  });
});
