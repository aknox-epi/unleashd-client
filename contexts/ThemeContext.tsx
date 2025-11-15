import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@unleashd/theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorModeState] = useState<ColorMode>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load theme preference from AsyncStorage on mount.
   * If no preference is stored, defaults to system theme.
   */
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && ['light', 'dark'].includes(stored)) {
          setColorModeState(stored as ColorMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  /**
   * Set color mode and save to AsyncStorage
   */
  const setColorMode = async (mode: ColorMode) => {
    try {
      setColorModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  /**
   * Toggle between light and dark mode
   */
  const toggleColorMode = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  // Don't render children until we've loaded the preference
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        setColorMode,
        toggleColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
