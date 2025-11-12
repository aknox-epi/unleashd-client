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
import { Slot } from 'expo-router';
import { RescueGroupsProvider } from '@/contexts/RescueGroupsContext';
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from '@/contexts/ThemeContext';

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
      <RootLayoutNav />
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const { colorMode } = useTheme();

  return (
    <RescueGroupsProvider>
      <GluestackUIProvider mode={colorMode}>
        <ThemeProvider value={colorMode === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </GluestackUIProvider>
    </RescueGroupsProvider>
  );
}
