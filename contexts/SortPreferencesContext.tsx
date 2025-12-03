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
  SortPreferences,
  SortPreferencesContextState,
  StoredSortData,
  SortOption,
} from '@/types/sort-preferences';
import { logger } from '@/utils/logger';

// Storage key
const STORAGE_KEY = '@unleashd:preferences:sort';

// Current version for data migrations
const STORAGE_VERSION = 1;

// Default preferences (newest first as fallback)
const DEFAULT_PREFERENCES: SortPreferences = {
  selectedSort: 'newest' as SortOption,
};

// Create context
const SortPreferencesContext = createContext<
  SortPreferencesContextState | undefined
>(undefined);

interface SortPreferencesProviderProps {
  children: ReactNode;
}

export function SortPreferencesProvider({
  children,
}: SortPreferencesProviderProps) {
  const [preferences, setPreferences] =
    useState<SortPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load preferences from AsyncStorage on mount
   */
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as StoredSortData;

          // Validate version and data structure
          if (
            data.version === STORAGE_VERSION &&
            typeof data.selectedSort === 'string'
          ) {
            setPreferences({
              selectedSort: data.selectedSort,
            });
          } else {
            logger.warn('Invalid sort preferences data, using defaults');
          }
        }
      } catch (error) {
        logger.error('Failed to load sort preferences from storage:', error);
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
    async (newPreferences: SortPreferences) => {
      try {
        const data: StoredSortData = {
          version: STORAGE_VERSION,
          selectedSort: newPreferences.selectedSort,
          lastUpdated: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        logger.error('Failed to save sort preferences to storage:', error);
        // Don't throw - continue with in-memory state
      }
    },
    []
  );

  /**
   * Update preferences (partial update supported)
   */
  const updatePreferences = useCallback(
    async (updates: Partial<SortPreferences>) => {
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
      logger.error('Failed to clear sort preferences from storage:', error);
      // Still update in-memory state even if storage clear fails
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  const value: SortPreferencesContextState = {
    preferences,
    updatePreferences,
    clearPreferences,
    isLoading,
  };

  return (
    <SortPreferencesContext.Provider value={value}>
      {children}
    </SortPreferencesContext.Provider>
  );
}

/**
 * Hook to access sort preferences context
 * @throws Error if used outside of SortPreferencesProvider
 */
export function useSortPreferences(): SortPreferencesContextState {
  const context = useContext(SortPreferencesContext);
  if (context === undefined) {
    throw new Error(
      'useSortPreferences must be used within a SortPreferencesProvider'
    );
  }
  return context;
}
