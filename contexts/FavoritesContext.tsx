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
  FavoriteOrganization,
  FavoritesContextState,
  StoredFavoritesData,
  StoredOrgFavoritesData,
} from '@/types/favorites';
import { logger } from '@/utils/logger';

// Storage keys
const STORAGE_KEY_ANIMALS = '@unleashd:favorites:animals';
const STORAGE_KEY_ORGS = '@unleashd:favorites:organizations';

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
  const [favoriteOrgs, setFavoriteOrgs] = useState<FavoriteOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load favorites from AsyncStorage on mount
   */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Load animal favorites
        const storedAnimals = await AsyncStorage.getItem(STORAGE_KEY_ANIMALS);
        if (storedAnimals) {
          const data = JSON.parse(storedAnimals) as StoredFavoritesData;

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

        // Load organization favorites
        const storedOrgs = await AsyncStorage.getItem(STORAGE_KEY_ORGS);
        if (storedOrgs) {
          const data = JSON.parse(storedOrgs) as StoredOrgFavoritesData;

          // Validate version and data structure
          if (
            data.version === STORAGE_VERSION &&
            Array.isArray(data.favorites)
          ) {
            // Sort by most recently favorited (descending)
            const sorted = data.favorites.sort(
              (a, b) => b.favoritedAt - a.favoritedAt
            );
            setFavoriteOrgs(sorted);
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
   * Save animal favorites to AsyncStorage
   */
  const saveFavorites = useCallback(async (newFavorites: FavoriteAnimal[]) => {
    try {
      const data: StoredFavoritesData = {
        version: STORAGE_VERSION,
        favorites: newFavorites,
      };
      await AsyncStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save favorites to storage:', error);
      // Don't throw - continue with in-memory state
    }
  }, []);

  /**
   * Save organization favorites to AsyncStorage
   */
  const saveOrgFavorites = useCallback(
    async (newFavorites: FavoriteOrganization[]) => {
      try {
        const data: StoredOrgFavoritesData = {
          version: STORAGE_VERSION,
          favorites: newFavorites,
        };
        await AsyncStorage.setItem(STORAGE_KEY_ORGS, JSON.stringify(data));
      } catch (error) {
        logger.error('Failed to save org favorites to storage:', error);
        // Don't throw - continue with in-memory state
      }
    },
    []
  );

  /**
   * Create a Set of favorite animal IDs for O(1) lookup performance
   */
  const favoriteIds = useMemo(
    () => new Set(favorites.map((fav) => fav.animalID)),
    [favorites]
  );

  /**
   * Create a Set of favorite organization IDs for O(1) lookup performance
   */
  const favoriteOrgIds = useMemo(
    () => new Set(favoriteOrgs.map((fav) => fav.orgID)),
    [favoriteOrgs]
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
   * Check if an organization is favorited (O(1) lookup)
   */
  const isOrgFavorite = useCallback(
    (orgId: string): boolean => {
      return favoriteOrgIds.has(orgId);
    },
    [favoriteOrgIds]
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
   * Add an organization to favorites
   */
  const addOrgFavorite = useCallback(
    async (org: FavoriteOrganization) => {
      // Check if already favorited
      if (isOrgFavorite(org.orgID)) {
        return;
      }

      // Add timestamp
      const favoriteWithTimestamp: FavoriteOrganization = {
        ...org,
        favoritedAt: Date.now(),
      };

      // Add to beginning (most recent first)
      const newFavorites = [favoriteWithTimestamp, ...favoriteOrgs];
      setFavoriteOrgs(newFavorites);

      // Persist to storage
      await saveOrgFavorites(newFavorites);
    },
    [favoriteOrgs, isOrgFavorite, saveOrgFavorites]
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
   * Remove an organization from favorites
   */
  const removeOrgFavorite = useCallback(
    async (orgId: string) => {
      const newFavorites = favoriteOrgs.filter((fav) => fav.orgID !== orgId);
      setFavoriteOrgs(newFavorites);

      // Persist to storage
      await saveOrgFavorites(newFavorites);
    },
    [favoriteOrgs, saveOrgFavorites]
  );

  /**
   * Toggle animal favorite status
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
   * Toggle organization favorite status
   */
  const toggleOrgFavorite = useCallback(
    async (org: FavoriteOrganization) => {
      if (isOrgFavorite(org.orgID)) {
        await removeOrgFavorite(org.orgID);
      } else {
        await addOrgFavorite(org);
      }
    },
    [isOrgFavorite, addOrgFavorite, removeOrgFavorite]
  );

  /**
   * Clear all animal favorites
   */
  const clearAllFavorites = useCallback(async () => {
    setFavorites([]);
    await saveFavorites([]);
  }, [saveFavorites]);

  /**
   * Clear all organization favorites
   */
  const clearAllOrgFavorites = useCallback(async () => {
    setFavoriteOrgs([]);
    await saveOrgFavorites([]);
  }, [saveOrgFavorites]);

  const contextValue: FavoritesContextState = {
    favorites,
    favoriteOrgs,
    isFavorite,
    isOrgFavorite,
    addFavorite,
    addOrgFavorite,
    removeFavorite,
    removeOrgFavorite,
    toggleFavorite,
    toggleOrgFavorite,
    clearAllFavorites,
    clearAllOrgFavorites,
    isLoading,
    count: favorites.length,
    orgCount: favoriteOrgs.length,
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
