import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LocationPreferences,
  LocationPreferencesContextState,
  StoredLocationData,
} from '@/types/location-preferences';
import { logger } from '@/utils/logger';

// Storage key
const STORAGE_KEY = '@unleashd:preferences:location';

// Current version for data migrations
const STORAGE_VERSION = 1;

// Default preferences (empty)
const DEFAULT_PREFERENCES: LocationPreferences = {
  zipCode: '',
  radius: '',
};

// Create context
const LocationPreferencesContext = createContext<
  LocationPreferencesContextState | undefined
>(undefined);

interface LocationPreferencesProviderProps {
  children: ReactNode;
}

export function LocationPreferencesProvider({
  children,
}: LocationPreferencesProviderProps) {
  const [preferences, setPreferences] =
    useState<LocationPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load preferences from AsyncStorage on mount
   */
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as StoredLocationData;

          // Validate version and data structure
          if (
            data.version === STORAGE_VERSION &&
            typeof data.zipCode === 'string' &&
            (typeof data.radius === 'number' || data.radius === '')
          ) {
            setPreferences({
              zipCode: data.zipCode,
              radius: data.radius,
            });
          } else {
            logger.warn('Invalid location preferences data, using defaults');
          }
        }
      } catch (error) {
        logger.error(
          'Failed to load location preferences from storage:',
          error
        );
        // Don't throw - just start with empty preferences
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  /**
   * Save preferences to AsyncStorage
   */
  const savePreferences = useCallback(
    async (newPreferences: LocationPreferences) => {
      try {
        const data: StoredLocationData = {
          version: STORAGE_VERSION,
          zipCode: newPreferences.zipCode,
          radius: newPreferences.radius,
          lastUpdated: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        logger.error('Failed to save location preferences to storage:', error);
        // Don't throw - continue with in-memory state
      }
    },
    []
  );

  /**
   * Update preferences (partial update supported)
   */
  const updatePreferences = useCallback(
    async (updates: Partial<LocationPreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);
      await savePreferences(newPreferences);
    },
    [preferences, savePreferences]
  );

  /**
   * Clear all preferences
   */
  const clearPreferences = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setPreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      logger.error('Failed to clear location preferences from storage:', error);
      // Still update in-memory state even if storage clear fails
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  const value: LocationPreferencesContextState = {
    preferences,
    updatePreferences,
    clearPreferences,
    isLoading,
  };

  return (
    <LocationPreferencesContext.Provider value={value}>
      {children}
    </LocationPreferencesContext.Provider>
  );
}

/**
 * Hook to access location preferences context
 * @throws Error if used outside of LocationPreferencesProvider
 */
export function useLocationPreferences(): LocationPreferencesContextState {
  const context = useContext(LocationPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useLocationPreferences must be used within a LocationPreferencesProvider'
    );
  }
  return context;
}
