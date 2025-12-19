import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Center } from '@/components/ui/center';
import { AnimalCard } from '@/components/AnimalCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Animal } from '@/services/rescuegroups';
import type { FavoriteAnimal } from '@/types/favorites';

/**
 * Convert FavoriteAnimal to Animal type for AnimalCard compatibility
 */
function favoriteToAnimal(favorite: FavoriteAnimal): Animal {
  return {
    animalID: favorite.animalID,
    animalName: favorite.animalName,
    animalSpecies: favorite.animalSpecies,
    animalThumbnailUrl: favorite.animalThumbnailUrl,
    animalBreed: favorite.animalBreed,
    animalLocationCitystate: favorite.animalLocationCitystate,
    animalGeneralAge: favorite.animalGeneralAge,
    animalSex: favorite.animalSex,
  } as Animal;
}

export default function FavoritesScreen() {
  const { favorites, count } = useFavorites();
  const { colorMode } = useTheme();
  const isDarkMode = colorMode === 'dark';
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    // Favorites are already in memory, just trigger re-render
    // Use a brief delay to show the refresh animation
    await new Promise((resolve) => {
      const timer = global.setTimeout(() => resolve(undefined), 500);
      return () => global.clearTimeout(timer);
    });
    setRefreshing(false);
  };

  const handleCardPress = async (animal: Animal) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    router.push(`/pet/${animal.animalID}`);
  };

  // Empty state
  if (count === 0) {
    return (
      <Box className="flex-1 bg-background-0">
        <Center className="flex-1 px-6">
          <VStack space="lg" className="items-center max-w-md">
            <Box className="w-24 h-24 items-center justify-center">
              <Icon
                as={Heart}
                size="xl"
                className={
                  isDarkMode ? 'text-typography-400' : 'text-typography-300'
                }
              />
            </Box>
            <VStack space="sm" className="items-center">
              <Heading size="xl" className="text-center">
                No Favorites Yet
              </Heading>
              <Text className="text-typography-500 text-center">
                Start adding pets to your favorites by tapping the heart icon on
                any pet card or detail screen.
              </Text>
            </VStack>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Center className="flex-1">
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.animalID}
          renderItem={({ item }) => (
            <AnimalCard
              animal={favoriteToAnimal(item)}
              onPress={handleCardPress}
              isDarkMode={isDarkMode}
            />
          )}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 24,
            gap: 16,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              colors={[isDarkMode ? '#9ca3af' : '#6b7280']}
            />
          }
          ListHeaderComponent={
            <Box className="px-4 py-4">
              <Text className="text-typography-500 text-sm">
                {count} {count === 1 ? 'favorite' : 'favorites'}
              </Text>
            </Box>
          }
          className="w-full max-w-md px-4"
        />
      </Center>
    </Box>
  );
}
