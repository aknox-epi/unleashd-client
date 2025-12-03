import React, { useState, useEffect, useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Dog,
  Cat,
  Bird,
  Rabbit,
  Image as ImageIcon,
  Heart,
  MapPin,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Animal } from '@/services/rescuegroups';
import type { FavoriteAnimal } from '@/types/favorites';

interface AnimalCardProps {
  animal: Animal;
  onPress?: (animal: Animal) => void;
  isDarkMode?: boolean;
}

/**
 * Get the best available image URL for an animal
 * Priority: animalThumbnailUrl > first picture's large URL > first picture's small URL
 */
function getAnimalImageUrl(animal: Animal): string | undefined {
  // Try direct thumbnail URL first (most reliable)
  if (animal.animalThumbnailUrl) {
    return animal.animalThumbnailUrl;
  }

  // Fallback to first picture in the array
  if (animal.animalPictures && animal.animalPictures.length > 0) {
    const firstPicture = animal.animalPictures[0];
    // Try large URL first, then small
    return (
      firstPicture.urlSecureLarge ||
      firstPicture.urlSecureSmall ||
      firstPicture.urlSecureThumbnail
    );
  }

  return undefined;
}

/**
 * Format distance for display
 * @param distance - Distance in miles (number or string)
 * @returns Formatted string like "12 miles" or "0.5 miles"
 */
function formatDistance(distance: number | undefined): string | null {
  if (distance === undefined || distance === null) {
    return null;
  }

  // Convert to number if it's a string (API sometimes returns strings)
  const numDistance =
    typeof distance === 'number' ? distance : parseFloat(distance);

  // Handle invalid numbers
  if (isNaN(numDistance)) {
    return null;
  }

  // Round to 1 decimal place for distances under 10 miles
  if (numDistance < 10) {
    return `${numDistance.toFixed(1)} miles`;
  }

  // Round to whole number for distances 10+ miles
  return `${Math.round(numDistance)} miles`;
}

/**
 * Get the appropriate icon for an animal species
 */
function getSpeciesIcon(species: string) {
  const speciesLower = species.toLowerCase();
  if (speciesLower.includes('dog')) return Dog;
  if (speciesLower.includes('cat')) return Cat;
  if (speciesLower.includes('bird')) return Bird;
  if (speciesLower.includes('rabbit')) return Rabbit;
  return ImageIcon; // Generic fallback
}

/**
 * Image fallback component for when no image is available or fails to load
 */
function ImageFallback({
  species,
  isDarkMode,
}: {
  species: string;
  isDarkMode: boolean;
}) {
  const SpeciesIcon = getSpeciesIcon(species);

  return (
    <Box
      className={`h-24 w-24 rounded-lg border ${
        isDarkMode
          ? 'bg-background-100 border-outline-300'
          : 'bg-background-50 border-outline-200'
      } items-center justify-center`}
    >
      <Icon
        as={SpeciesIcon}
        size="lg"
        className={isDarkMode ? 'text-typography-400' : 'text-typography-300'}
      />
    </Box>
  );
}

/**
 * AnimalCard component displays a single animal in a card format
 * Shows image, name, species, breed, age, sex, and location
 */
export function AnimalCard({
  animal,
  onPress,
  isDarkMode = false,
}: AnimalCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const imageUrl = getAnimalImageUrl(animal);
  const shouldShowFallback = !imageUrl || hasImageError;
  const favorited = isFavorite(animal.animalID);

  // Animation values - initialized once and stored in ref
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Run entrance animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress(animal);
    }
  };

  const handleFavoritePress = async (e: React.BaseSyntheticEvent) => {
    // Stop event propagation to prevent card press
    e.stopPropagation();

    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not supported on web, ignore
    }

    // Convert Animal to FavoriteAnimal
    const favoriteAnimal: FavoriteAnimal = {
      animalID: animal.animalID,
      animalName: animal.animalName,
      animalSpecies: animal.animalSpecies,
      animalThumbnailUrl: animal.animalThumbnailUrl,
      animalBreed: animal.animalBreed,
      animalLocationCitystate: animal.animalLocationCitystate,
      animalGeneralAge: animal.animalGeneralAge,
      animalSex: animal.animalSex,
      favoritedAt: Date.now(),
    };

    await toggleFavorite(favoriteAnimal);
  };

  const content = (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <VStack
        className="border border-outline-200 rounded-lg p-3 bg-background-0 relative"
        space="sm"
      >
        {/* Favorite button - absolute positioned top-right */}
        <Box className="absolute top-2 right-2 z-10">
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`favorite-button-${animal.animalID}`}
          >
            <Icon
              as={Heart}
              size="lg"
              className={
                favorited
                  ? 'text-error-500'
                  : isDarkMode
                    ? 'text-typography-400'
                    : 'text-typography-300'
              }
              fill={favorited ? 'currentColor' : 'none'}
            />
          </Pressable>
        </Box>

        <HStack space="md">
          {shouldShowFallback ? (
            <ImageFallback
              species={animal.animalSpecies}
              isDarkMode={isDarkMode}
            />
          ) : (
            <Image
              source={{ uri: imageUrl }}
              size="lg"
              alt={animal.animalName}
              className="rounded-lg"
              onError={() => setHasImageError(true)}
            />
          )}
          <VStack space="xs" className="flex-1 shrink pr-8">
            <Heading size="sm" className="font-semibold">
              {animal.animalName}
            </Heading>
            <VStack space="xs">
              <Text size="sm" className="text-typography-500">
                {animal.animalSpecies}
              </Text>
              {animal.animalBreed && (
                <Text size="sm" className="text-typography-500 flex-wrap">
                  {animal.animalBreed}
                </Text>
              )}
            </VStack>
            {animal.animalGeneralAge && (
              <Text size="sm" className="text-typography-500">
                Age: {animal.animalGeneralAge}
              </Text>
            )}
            {animal.animalSex && (
              <Text size="sm" className="text-typography-500">
                Sex: {animal.animalSex}
              </Text>
            )}
            {animal.animalLocationCitystate && (
              <HStack space="xs" className="items-center">
                <Icon as={MapPin} size="xs" className="text-typography-400" />
                <Text size="xs" className="text-typography-400">
                  Location: {animal.animalLocationCitystate}
                </Text>
              </HStack>
            )}
            {animal.animalLocationDistance !== undefined && (
              <Text
                size="xs"
                className={
                  isDarkMode
                    ? 'text-info-400 font-medium'
                    : 'text-info-600 font-medium'
                }
              >
                {formatDistance(animal.animalLocationDistance)}
              </Text>
            )}
          </VStack>
        </HStack>
      </VStack>
    </Animated.View>
  );

  // Wrap in Pressable only if onPress is provided
  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        testID={`animal-card-${animal.animalID}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
