// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
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
import { FavoritesProvider, useFavorites } from '../FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavoriteAnimal } from '@/types/favorites';
import { logger } from '@/utils/logger';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

const mockAnimal: FavoriteAnimal = {
  animalID: '123',
  animalName: 'Buddy',
  animalSpecies: 'Dog',
  animalThumbnailUrl: 'https://example.com/buddy.jpg',
  animalBreed: 'Golden Retriever',
  animalLocationCitystate: 'San Francisco, CA',
  animalGeneralAge: 'Adult',
  animalSex: 'Male',
  favoritedAt: Date.now(),
};

const mockAnimal2: FavoriteAnimal = {
  animalID: '456',
  animalName: 'Mittens',
  animalSpecies: 'Cat',
  animalThumbnailUrl: 'https://example.com/mittens.jpg',
  animalBreed: 'Tabby',
  animalLocationCitystate: 'Los Angeles, CA',
  animalGeneralAge: 'Young',
  animalSex: 'Female',
  favoritedAt: Date.now(),
};

describe('FavoritesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('Hook usage', () => {
    it('should throw error when used outside FavoritesProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useFavorites());
      }).toThrow('useFavorites must be used within a FavoritesProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should work when used inside FavoritesProvider', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
        expect(result.current.favorites).toEqual([]);
        expect(result.current.count).toBe(0);
      });
    });
  });

  describe('Initialization', () => {
    it('should start with empty favorites when no stored data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toEqual([]);
        expect(result.current.count).toBe(0);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should load stored favorites from AsyncStorage', async () => {
      const storedData = {
        version: 1,
        favorites: [mockAnimal],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
        expect(result.current.favorites[0].animalID).toBe('123');
        expect(result.current.count).toBe(1);
      });
    });

    it('should handle corrupted storage data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toEqual([]);
        expect(result.current.count).toBe(0);
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load favorites from storage:',
        expect.any(Error)
      );
    });

    it('should handle AsyncStorage read errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toEqual([]);
      });

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Adding favorites', () => {
    it('should add an animal to favorites', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].animalID).toBe('123');
      expect(result.current.count).toBe(1);
      expect(result.current.isFavorite('123')).toBe(true);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:favorites:animals',
        expect.stringContaining('"animalID":"123"')
      );
    });

    it('should add multiple animals to favorites', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal2);
      });

      expect(result.current.favorites).toHaveLength(2);
      expect(result.current.count).toBe(2);
      expect(result.current.isFavorite('123')).toBe(true);
      expect(result.current.isFavorite('456')).toBe(true);
    });

    it('should not add duplicate animals', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal);
        await result.current.addFavorite(mockAnimal);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.count).toBe(1);
    });

    it('should add newest favorites to the beginning', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal2);
      });

      // Most recent should be first
      expect(result.current.favorites[0].animalID).toBe('456');
      expect(result.current.favorites[1].animalID).toBe('123');
    });

    it('should handle AsyncStorage write errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Write error'));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal);
      });

      // Should still update in-memory state
      expect(result.current.favorites).toHaveLength(1);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Removing favorites', () => {
    it('should remove an animal from favorites', async () => {
      const storedData = {
        version: 1,
        favorites: [mockAnimal],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      await act(async () => {
        await result.current.removeFavorite('123');
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.count).toBe(0);
      expect(result.current.isFavorite('123')).toBe(false);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:favorites:animals',
        expect.stringContaining('[]')
      );
    });

    it('should remove specific animal from multiple favorites', async () => {
      const storedData = {
        version: 1,
        favorites: [mockAnimal, mockAnimal2],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(2);
      });

      await act(async () => {
        await result.current.removeFavorite('123');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].animalID).toBe('456');
      expect(result.current.isFavorite('123')).toBe(false);
      expect(result.current.isFavorite('456')).toBe(true);
    });
  });

  describe('Toggle favorites', () => {
    it('should add animal when not favorited', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleFavorite(mockAnimal);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.isFavorite('123')).toBe(true);
    });

    it('should remove animal when already favorited', async () => {
      const storedData = {
        version: 1,
        favorites: [mockAnimal],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      await act(async () => {
        await result.current.toggleFavorite(mockAnimal);
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.isFavorite('123')).toBe(false);
    });
  });

  describe('Clear all favorites', () => {
    it('should clear all favorites', async () => {
      const storedData = {
        version: 1,
        favorites: [mockAnimal, mockAnimal2],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(2);
      });

      await act(async () => {
        await result.current.clearAllFavorites();
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.count).toBe(0);
      expect(result.current.isFavorite('123')).toBe(false);
      expect(result.current.isFavorite('456')).toBe(false);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:favorites:animals',
        expect.stringContaining('[]')
      );
    });
  });

  describe('isFavorite lookup', () => {
    it('should return false for non-favorited animal', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isFavorite('999')).toBe(false);
    });

    it('should return true for favorited animal', async () => {
      const storedData = {
        version: 1,
        favorites: [mockAnimal],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      expect(result.current.isFavorite('123')).toBe(true);
    });
  });

  describe('Data persistence', () => {
    it('should persist favorites with correct version', async () => {
      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite(mockAnimal);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:favorites:animals',
        expect.stringContaining('"version":1')
      );
    });

    it('should sort favorites by most recent when loading from storage', async () => {
      const older = { ...mockAnimal, favoritedAt: 1000 };
      const newer = { ...mockAnimal2, favoritedAt: 2000 };
      const storedData = {
        version: 1,
        favorites: [older, newer],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedData));

      const { result } = renderHook(() => useFavorites(), {
        wrapper: ({ children }) => (
          <FavoritesProvider>{children}</FavoritesProvider>
        ),
      });

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(2);
      });

      // Most recent should be first
      expect(result.current.favorites[0].animalID).toBe('456');
      expect(result.current.favorites[1].animalID).toBe('123');
    });
  });
});
