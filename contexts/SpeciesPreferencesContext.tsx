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
  SpeciesPreferences,
  SpeciesPreferencesContextState,
  StoredSpeciesData,
} from '@/types/species-preferences';
import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { logger } from '@/utils/logger';

// Storage key
const STORAGE_KEY = '@unleashd:preferences:species';

// Current version for data migrations
const STORAGE_VERSION = 1;

// Default preferences (Dog as default)
const DEFAULT_PREFERENCES: SpeciesPreferences = {
  defaultSpecies: RESCUEGROUPS_CONFIG.SPECIES.DOG,
};

// Create context
const SpeciesPreferencesContext = createContext<
  SpeciesPreferencesContextState | undefined
>(undefined);

interface SpeciesPreferencesProviderProps {
  children: ReactNode;
}

export function SpeciesPreferencesProvider({
  children,
}: SpeciesPreferencesProviderProps) {
  const [preferences, setPreferences] =
    useState<SpeciesPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load preferences from AsyncStorage on mount
   */
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as StoredSpeciesData;

          // Validate version and data structure
          if (
            data.version === STORAGE_VERSION &&
            typeof data.defaultSpecies === 'string'
          ) {
            setPreferences({
              defaultSpecies: data.defaultSpecies,
            });
          } else {
            logger.warn('Invalid species preferences data, using defaults');
          }
        }
      } catch (error) {
        logger.error('Failed to load species preferences from storage:', error);
        // Don't throw - just start with default preferences
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
    async (newPreferences: SpeciesPreferences) => {
      try {
        const data: StoredSpeciesData = {
          version: STORAGE_VERSION,
          defaultSpecies: newPreferences.defaultSpecies,
          lastUpdated: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        logger.error('Failed to save species preferences to storage:', error);
        // Don't throw - continue with in-memory state
      }
    },
    []
  );

  /**
   * Update preferences (partial update supported)
   */
  const updatePreferences = useCallback(
    async (updates: Partial<SpeciesPreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);
      await savePreferences(newPreferences);
    },
    [preferences, savePreferences]
  );

  /**
   * Clear all preferences (reset to default)
   */
  const clearPreferences = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setPreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      logger.error('Failed to clear species preferences from storage:', error);
      // Still update in-memory state even if storage clear fails
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  const value: SpeciesPreferencesContextState = {
    preferences,
    updatePreferences,
    clearPreferences,
    isLoading,
  };

  return (
    <SpeciesPreferencesContext.Provider value={value}>
      {children}
    </SpeciesPreferencesContext.Provider>
  );
}

/**
 * Hook to access species preferences context
 * @throws Error if used outside of SpeciesPreferencesProvider
 */
export function useSpeciesPreferences(): SpeciesPreferencesContextState {
  const context = useContext(SpeciesPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useSpeciesPreferences must be used within a SpeciesPreferencesProvider'
    );
  }
  return context;
}
