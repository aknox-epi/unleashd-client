import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseLatestChangelog, isNewerVersion } from '@/utils/changelog-parser';
import type {
  WhatsNewContextState,
  WhatsNewPreferences,
  ChangelogEntry,
} from '@/types/whats-new';

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: '@unleashd:whats-new:preferences',
} as const;

// Default preferences
const DEFAULT_PREFERENCES: WhatsNewPreferences = {
  enabled: false, // Opt-in by default
  lastSeenVersion: null,
};

// Create context
const WhatsNewContext = createContext<WhatsNewContextState | undefined>(
  undefined
);

interface WhatsNewProviderProps {
  children: ReactNode;
  /**
   * The changelog content as a string
   * This should be the raw content from CHANGELOG.md
   */
  changelogContent: string;
  /**
   * Current app version from package.json
   */
  currentVersion: string;
}

export function WhatsNewProvider({
  children,
  changelogContent,
  currentVersion,
}: WhatsNewProviderProps) {
  const [preferences, setPreferences] =
    useState<WhatsNewPreferences>(DEFAULT_PREFERENCES);
  const [latestChangelog, setLatestChangelog] = useState<ChangelogEntry | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /**
   * Load preferences from AsyncStorage
   */
  const loadPreferences = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        const parsed = JSON.parse(stored) as WhatsNewPreferences;
        setPreferences(parsed);
      }
    } catch (error) {
      console.error("Failed to load What's New preferences:", error);
    }
  }, []);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPreferences();
  }, [loadPreferences]);

  // Parse changelog on mount or when content changes
  useEffect(() => {
    const parsed = parseLatestChangelog(changelogContent);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLatestChangelog(parsed);
  }, [changelogContent]);

  /**
   * Save preferences to AsyncStorage
   */
  const savePreferences = async (newPreferences: WhatsNewPreferences) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error("Failed to save What's New preferences:", error);
    }
  };

  /**
   * Toggle the enabled state
   */
  const toggleEnabled = async () => {
    const newPreferences: WhatsNewPreferences = {
      ...preferences,
      enabled: !preferences.enabled,
    };
    await savePreferences(newPreferences);
  };

  /**
   * Mark the current version as seen
   */
  const markVersionAsSeen = async () => {
    const newPreferences: WhatsNewPreferences = {
      ...preferences,
      lastSeenVersion: currentVersion,
    };
    await savePreferences(newPreferences);
    setIsDrawerOpen(false);
  };

  /**
   * Open the What's New drawer
   */
  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  /**
   * Close the What's New drawer
   */
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  /**
   * Determine if there's a new version
   * Only true if:
   * 1. Feature is enabled
   * 2. lastSeenVersion is null OR currentVersion > lastSeenVersion
   */
  const hasNewVersion =
    preferences.enabled &&
    (!preferences.lastSeenVersion ||
      isNewerVersion(preferences.lastSeenVersion, currentVersion));

  const contextValue: WhatsNewContextState = {
    isEnabled: preferences.enabled,
    hasNewVersion,
    currentVersion,
    lastSeenVersion: preferences.lastSeenVersion,
    latestChangelog,
    isDrawerOpen,
    toggleEnabled,
    markVersionAsSeen,
    openDrawer,
    closeDrawer,
  };

  return (
    <WhatsNewContext.Provider value={contextValue}>
      {children}
    </WhatsNewContext.Provider>
  );
}

/**
 * Hook to access the What's New context
 * @throws Error if used outside of WhatsNewProvider
 */
export function useWhatsNew(): WhatsNewContextState {
  const context = useContext(WhatsNewContext);
  if (context === undefined) {
    throw new Error('useWhatsNew must be used within a WhatsNewProvider');
  }
  return context;
}
