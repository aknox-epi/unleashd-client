/**
 * Favorites type definitions
 * Defines the data model for favorited animals, organizations, and related state
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
 * Minimal organization data stored in favorites
 * Keeps storage lightweight by only storing essential display fields
 */
export interface FavoriteOrganization {
  orgID: string;
  orgName: string;
  orgType?: string;
  orgLocationCitystate?: string;
  orgCity?: string;
  orgState?: string;
  orgAbout?: string;
  favoritedAt: number; // Unix timestamp
}

/**
 * Favorites context state interface
 */
export interface FavoritesContextState {
  /** Array of favorited animals, sorted by most recently favorited */
  favorites: FavoriteAnimal[];
  /** Array of favorited organizations, sorted by most recently favorited */
  favoriteOrgs: FavoriteOrganization[];
  /** Check if an animal is favorited (O(1) lookup) */
  isFavorite: (animalId: string) => boolean;
  /** Check if an organization is favorited (O(1) lookup) */
  isOrgFavorite: (orgId: string) => boolean;
  /** Add an animal to favorites */
  addFavorite: (animal: FavoriteAnimal) => Promise<void>;
  /** Add an organization to favorites */
  addOrgFavorite: (org: FavoriteOrganization) => Promise<void>;
  /** Remove an animal from favorites */
  removeFavorite: (animalId: string) => Promise<void>;
  /** Remove an organization from favorites */
  removeOrgFavorite: (orgId: string) => Promise<void>;
  /** Toggle favorite status (add if not favorited, remove if favorited) */
  toggleFavorite: (animal: FavoriteAnimal) => Promise<void>;
  /** Toggle organization favorite status */
  toggleOrgFavorite: (org: FavoriteOrganization) => Promise<void>;
  /** Clear all animal favorites */
  clearAllFavorites: () => Promise<void>;
  /** Clear all organization favorites */
  clearAllOrgFavorites: () => Promise<void>;
  /** Loading state (true while loading from AsyncStorage) */
  isLoading: boolean;
  /** Total count of animal favorites */
  count: number;
  /** Total count of organization favorites */
  orgCount: number;
}

/**
 * Stored favorites data structure for animals
 * Versioned for future migrations
 */
export interface StoredFavoritesData {
  version: number;
  favorites: FavoriteAnimal[];
}

/**
 * Stored favorites data structure for organizations
 * Versioned for future migrations
 */
export interface StoredOrgFavoritesData {
  version: number;
  favorites: FavoriteOrganization[];
}
