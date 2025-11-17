/**
 * Type definitions for location preferences
 * Used to persist user's location search settings across app sessions
 */

/**
 * Location preferences stored in memory and AsyncStorage
 */
export interface LocationPreferences {
  zipCode: string;
  radius: number | '';
}

/**
 * Data structure stored in AsyncStorage
 * Includes version for future migrations and timestamp for tracking
 */
export interface StoredLocationData {
  version: number;
  zipCode: string;
  radius: number | '';
  lastUpdated: number;
}

/**
 * Context state shape for LocationPreferencesContext
 */
export interface LocationPreferencesContextState {
  preferences: LocationPreferences;
  updatePreferences: (prefs: Partial<LocationPreferences>) => Promise<void>;
  clearPreferences: () => Promise<void>;
  isLoading: boolean;
}
