import React, { useState } from 'react';
import { Pressable } from 'react-native';
import {
  Dog,
  Cat,
  Bird,
  Rabbit,
  Image as ImageIcon,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Icon } from '@/components/ui/icon';
import type { Animal } from '@/services/rescuegroups';

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
      className={`h-32 w-32 rounded-lg border ${
        isDarkMode
          ? 'bg-background-100 border-outline-300'
          : 'bg-background-50 border-outline-200'
      } items-center justify-center`}
    >
      <Icon
        as={SpeciesIcon}
        size="xl"
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
  const imageUrl = getAnimalImageUrl(animal);
  const shouldShowFallback = !imageUrl || hasImageError;

  const handlePress = () => {
    if (onPress) {
      onPress(animal);
    }
  };

  const content = (
    <VStack
      className="border border-outline-200 rounded-lg p-4 bg-background-0"
      space="sm"
    >
      <HStack space="md">
        {shouldShowFallback ? (
          <ImageFallback
            species={animal.animalSpecies}
            isDarkMode={isDarkMode}
          />
        ) : (
          <Image
            source={{ uri: imageUrl }}
            size="xl"
            alt={animal.animalName}
            className="rounded-lg"
            onError={() => setHasImageError(true)}
          />
        )}
        <VStack space="sm" className="flex-1">
          <Heading size="sm" className="font-semibold">
            {animal.animalName}
          </Heading>
          <HStack space="sm">
            <Text className="text-typography-500">{animal.animalSpecies}</Text>
            {animal.animalBreed && (
              <>
                <Text className="text-typography-500">•</Text>
                <Text className="text-typography-500">
                  {animal.animalBreed}
                </Text>
              </>
            )}
          </HStack>
          {animal.animalGeneralAge && (
            <Text className="text-typography-500">
              Age: {animal.animalGeneralAge}
            </Text>
          )}
          {animal.animalSex && (
            <Text className="text-typography-500">Sex: {animal.animalSex}</Text>
          )}
          {animal.animalLocationCitystate && (
            <Text className="text-typography-400 text-sm">
              Location: {animal.animalLocationCitystate}
            </Text>
          )}
        </VStack>
      </HStack>
    </VStack>
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
