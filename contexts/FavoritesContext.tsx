import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  FavoriteAnimal,
  FavoritesContextState,
  StoredFavoritesData,
} from '@/types/favorites';
import { logger } from '@/utils/logger';

// Storage key
const STORAGE_KEY = '@unleashd:favorites:animals';

// Current version for data migrations
const STORAGE_VERSION = 1;

// Create context
const FavoritesContext = createContext<FavoritesContextState | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<FavoriteAnimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load favorites from AsyncStorage on mount
   */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as StoredFavoritesData;

          // Validate version and data structure
          if (
            data.version === STORAGE_VERSION &&
            Array.isArray(data.favorites)
          ) {
            // Sort by most recently favorited (descending)
            const sorted = data.favorites.sort(
              (a, b) => b.favoritedAt - a.favoritedAt
            );
            setFavorites(sorted);
          }
        }
      } catch (error) {
        logger.error('Failed to load favorites from storage:', error);
        // Don't throw - just start with empty favorites
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  /**
   * Save favorites to AsyncStorage
   */
  const saveFavorites = useCallback(async (newFavorites: FavoriteAnimal[]) => {
    try {
      const data: StoredFavoritesData = {
        version: STORAGE_VERSION,
        favorites: newFavorites,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save favorites to storage:', error);
      // Don't throw - continue with in-memory state
    }
  }, []);

  /**
   * Create a Set of favorite IDs for O(1) lookup performance
   */
  const favoriteIds = useMemo(
    () => new Set(favorites.map((fav) => fav.animalID)),
    [favorites]
  );

  /**
   * Check if an animal is favorited (O(1) lookup)
   */
  const isFavorite = useCallback(
    (animalId: string): boolean => {
      return favoriteIds.has(animalId);
    },
    [favoriteIds]
  );

  /**
   * Add an animal to favorites
   */
  const addFavorite = useCallback(
    async (animal: FavoriteAnimal) => {
      // Check if already favorited
      if (isFavorite(animal.animalID)) {
        return;
      }

      // Add timestamp
      const favoriteWithTimestamp: FavoriteAnimal = {
        ...animal,
        favoritedAt: Date.now(),
      };

      // Add to beginning (most recent first)
      const newFavorites = [favoriteWithTimestamp, ...favorites];
      setFavorites(newFavorites);

      // Persist to storage
      await saveFavorites(newFavorites);
    },
    [favorites, isFavorite, saveFavorites]
  );

  /**
   * Remove an animal from favorites
   */
  const removeFavorite = useCallback(
    async (animalId: string) => {
      const newFavorites = favorites.filter((fav) => fav.animalID !== animalId);
      setFavorites(newFavorites);

      // Persist to storage
      await saveFavorites(newFavorites);
    },
    [favorites, saveFavorites]
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (animal: FavoriteAnimal) => {
      if (isFavorite(animal.animalID)) {
        await removeFavorite(animal.animalID);
      } else {
        await addFavorite(animal);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(async () => {
    setFavorites([]);
    await saveFavorites([]);
  }, [saveFavorites]);

  const contextValue: FavoritesContextState = {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    isLoading,
    count: favorites.length,
  };

  // Don't render children until we've loaded favorites
  if (isLoading) {
    return null;
  }

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Hook to access the Favorites context
 * @throws Error if used outside of FavoritesProvider
 */
export function useFavorites(): FavoritesContextState {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
