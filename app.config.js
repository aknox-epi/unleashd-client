/**
 * Validates that required environment variables are set at config time.
 * This provides early feedback during expo config evaluation.
 */
function validateEnvironment() {
  const apiKey = process.env.EXPO_PUBLIC_RESCUEGROUPS_API_KEY;

  if (!apiKey) {
    console.error(
      '\n❌ Configuration Error: Missing required environment variables\n'
    );
    console.error('EXPO_PUBLIC_RESCUEGROUPS_API_KEY is not set.\n');
    console.error('Please follow these steps:\n');
    console.error('  1. Copy .env.example to .env.local');
    console.error('  2. Add your RescueGroups API key to .env.local');
    console.error(
      '  3. See docs/RESCUEGROUPS_SETUP.md for detailed setup instructions\n'
    );

    // Note: We log but don't throw to allow certain commands (like 'expo prebuild' or 'npx expo install')
    // The prebuild script will enforce this validation for actual builds
  }
}

// Run validation when config is loaded
validateEnvironment();

module.exports = {
  expo: {
    name: 'starter-kit-expo',
    slug: 'starter-kit-expo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'starterkitexpo',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router', 'expo-web-browser', 'expo-font'],
    experiments: {
      typedRoutes: true,
    },
  },
};
