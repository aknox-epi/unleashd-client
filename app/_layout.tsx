import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { RescueGroupsProvider } from '@/contexts/RescueGroupsContext';
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from '@/contexts/ThemeContext';
import { WhatsNewProvider } from '@/contexts/WhatsNewContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { LocationPreferencesProvider } from '@/contexts/LocationPreferencesContext';
import { SortPreferencesProvider } from '@/contexts/SortPreferencesContext';
import { CHANGELOG_CONTENT } from '@/constants/changelog';
import packageJson from '../package.json';

// Get version from package.json automatically
const APP_VERSION = packageJson.version;

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // eslint-disable-line
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <CustomThemeProvider>
      <FavoritesProvider>
        <LocationPreferencesProvider>
          <SortPreferencesProvider>
            <WhatsNewProvider
              changelogContent={CHANGELOG_CONTENT}
              currentVersion={APP_VERSION}
            >
              <RootLayoutNav />
            </WhatsNewProvider>
          </SortPreferencesProvider>
        </LocationPreferencesProvider>
      </FavoritesProvider>
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const { colorMode } = useTheme();

  return (
    <RescueGroupsProvider>
      <GluestackUIProvider mode={colorMode}>
        <ThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="tabs" options={{ headerShown: false }} />
            <Stack.Screen
              name="pet/[id]"
              options={{
                headerShown: true,
                headerTitle: '',
                gestureEnabled: true,
              }}
            />
          </Stack>
        </ThemeProvider>
      </GluestackUIProvider>
    </RescueGroupsProvider>
  );
}
