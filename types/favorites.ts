/**
 * Favorites type definitions
 * Defines the data model for favorited animals and related state
 */

/**
 * Minimal animal data stored in favorites
 * Keeps storage lightweight by only storing essential display fields
 */
export interface FavoriteAnimal {
  animalID: string;
  animalName: string;
  animalSpecies: string;
  animalThumbnailUrl?: string;
  animalBreed?: string;
  animalLocationCitystate?: string;
  animalGeneralAge?: string;
  animalSex?: string;
  favoritedAt: number; // Unix timestamp
}

/**
 * Favorites context state interface
 */
export interface FavoritesContextState {
  /** Array of favorited animals, sorted by most recently favorited */
  favorites: FavoriteAnimal[];
  /** Check if an animal is favorited (O(1) lookup) */
  isFavorite: (animalId: string) => boolean;
  /** Add an animal to favorites */
  addFavorite: (animal: FavoriteAnimal) => Promise<void>;
  /** Remove an animal from favorites */
  removeFavorite: (animalId: string) => Promise<void>;
  /** Toggle favorite status (add if not favorited, remove if favorited) */
  toggleFavorite: (animal: FavoriteAnimal) => Promise<void>;
  /** Clear all favorites */
  clearAllFavorites: () => Promise<void>;
  /** Loading state (true while loading from AsyncStorage) */
  isLoading: boolean;
  /** Total count of favorites */
  count: number;
}

/**
 * Stored favorites data structure
 * Versioned for future migrations
 */
export interface StoredFavoritesData {
  version: number;
  favorites: FavoriteAnimal[];
}
