import { useEffect, useState } from 'react';
import { ScrollView, Linking, Share, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ArrowLeft, Share2, Heart } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { Image } from '@/components/ui/image';
import { animalService } from '@/services/rescuegroups';
import { getErrorMessage, type Animal } from '@/services/rescuegroups';
import { useTheme } from '@/contexts/ThemeContext';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Subscribe to theme changes to ensure component re-renders when theme updates
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { colorMode } = useTheme();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadAnimalDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAnimalDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await animalService.getAnimalById(id);
      setAnimal(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load pet'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!animal) return;

    try {
      const message = `Check out ${animal.animalName}, a ${animal.animalGeneralAge} ${animal.animalSex} ${animal.animalBreed}!`;
      await Share.share({
        message,
        title: `Adopt ${animal.animalName}`,
        ...(Platform.OS === 'ios' && { url: animal.animalUrl }),
      });
    } catch {
      // User cancelled or error occurred
    }
  };

  const handleContactShelter = () => {
    // TODO: Get organization details and contact info
    // For now, open the animal's URL if available
    if (animal?.animalUrl) {
      Linking.openURL(animal.animalUrl);
    }
  };

  const renderPrimaryImage = () => {
    if (!animal?.animalPictures || animal.animalPictures.length === 0) {
      return (
        <Box className="w-full h-80 bg-background-200 items-center justify-center">
          <Text className="text-typography-400">No photo available</Text>
        </Box>
      );
    }

    const primaryImage = animal.animalPictures[0];
    const imageUrl =
      primaryImage.urlSecureLarge ||
      primaryImage.urlSecureFullsize ||
      animal.animalThumbnailUrl;

    if (!imageUrl) {
      return (
        <Box className="w-full h-80 bg-background-200 items-center justify-center">
          <Text className="text-typography-400">No photo available</Text>
        </Box>
      );
    }

    return (
      <Box className="w-full h-80 bg-background-200">
        <Image
          source={{ uri: imageUrl }}
          alt={animal.animalName}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </Box>
    );
  };

  const renderCharacteristic = (label: string, value: string | undefined) => {
    if (!value) return null;

    return (
      <HStack space="sm" className="items-center">
        <Text className="font-semibold text-typography-700">{label}:</Text>
        <Text className="text-typography-600">{value}</Text>
      </HStack>
    );
  };

  const renderCompatibilityBadge = (
    label: string,
    value: string | undefined
  ) => {
    if (!value || value === 'Unknown') return null;

    const isPositive = value === 'Yes' || value === '1';
    const variant = isPositive ? 'solid' : 'outline';

    return (
      <Badge
        action={isPositive ? 'success' : 'muted'}
        variant={variant}
        size="sm"
      >
        <BadgeText>{label}</BadgeText>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0">
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerLeft: () => (
              <Button variant="link" size="sm" onPress={() => router.back()}>
                <ButtonIcon as={ArrowLeft} />
              </Button>
            ),
          }}
        />
        <Center className="flex-1">
          <Spinner size="large" />
        </Center>
      </Box>
    );
  }

  if (error || !animal) {
    return (
      <Box className="flex-1 bg-background-0">
        <Stack.Screen
          options={{
            title: 'Error',
            headerLeft: () => (
              <Button variant="link" size="sm" onPress={() => router.back()}>
                <ButtonIcon as={ArrowLeft} />
              </Button>
            ),
          }}
        />
        <Center className="flex-1 px-6">
          <VStack space="lg" className="items-center max-w-md">
            <Text className="text-error-600 font-semibold text-xl">
              Unable to load pet details
            </Text>
            <Text className="text-typography-500 text-center">
              {error ? getErrorMessage(error) : 'Pet not found'}
            </Text>
            <Button onPress={loadAnimalDetails}>
              <ButtonText>Try Again</ButtonText>
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          title: animal.animalName,
          headerLeft: () => (
            <Button variant="link" size="sm" onPress={() => router.back()}>
              <ButtonIcon as={ArrowLeft} />
            </Button>
          ),
          headerRight: () => (
            <HStack space="sm">
              <Button variant="link" size="sm" onPress={handleShare}>
                <ButtonIcon as={Share2} />
              </Button>
              <Button variant="link" size="sm">
                <ButtonIcon as={Heart} />
              </Button>
            </HStack>
          ),
        }}
      />

      <ScrollView className="bg-background-0">
        {renderPrimaryImage()}

        <VStack space="lg" className="p-6">
          {/* Header */}
          <VStack space="sm">
            <Heading className="text-3xl font-bold">
              {animal.animalName}
            </Heading>
            <HStack space="sm" className="flex-wrap">
              <Badge action="info" variant="solid" size="md">
                <BadgeText>{animal.animalSpecies}</BadgeText>
              </Badge>
              <Badge action="muted" variant="outline" size="md">
                <BadgeText>{animal.animalBreed}</BadgeText>
              </Badge>
            </HStack>
            {animal.animalLocationCitystate && (
              <Text className="text-typography-500">
                {animal.animalLocationCitystate}
              </Text>
            )}
          </VStack>

          <Divider />

          {/* Basic Info */}
          <VStack space="md">
            <Heading className="text-xl font-semibold">About</Heading>
            <VStack space="sm">
              {renderCharacteristic('Sex', animal.animalSex)}
              {renderCharacteristic('Age', animal.animalGeneralAge)}
              {renderCharacteristic('Size', animal.animalGeneralSizePotential)}
              {renderCharacteristic('Color', animal.animalColor)}
              {renderCharacteristic('Spayed/Neutered', animal.animalAltered)}
              {animal.animalSpecies === 'Cat' &&
                renderCharacteristic('Declawed', animal.animalDeclawed)}
              {renderCharacteristic('House Trained', animal.animalHousetrained)}
            </VStack>
          </VStack>

          {/* Description */}
          {animal.animalDescriptionPlain && (
            <>
              <Divider />
              <VStack space="md">
                <Heading className="text-xl font-semibold">Description</Heading>
                <Text className="text-typography-600 leading-6 whitespace-normal">
                  {animal.animalDescriptionPlain}
                </Text>
              </VStack>
            </>
          )}

          {/* Compatibility */}
          {(animal.animalOKWithKids ||
            animal.animalOKWithDogs ||
            animal.animalOKWithCats ||
            animal.animalOKWithAdults) && (
            <>
              <Divider />
              <VStack space="md">
                <Heading className="text-xl font-semibold">Good With</Heading>
                <HStack space="sm" className="flex-wrap">
                  {renderCompatibilityBadge('Kids', animal.animalOKWithKids)}
                  {renderCompatibilityBadge('Dogs', animal.animalOKWithDogs)}
                  {renderCompatibilityBadge('Cats', animal.animalOKWithCats)}
                  {renderCompatibilityBadge(
                    'Adults',
                    animal.animalOKWithAdults
                  )}
                </HStack>
              </VStack>
            </>
          )}

          {/* Temperament */}
          {(animal.animalEnergyLevel ||
            animal.animalExerciseNeeds ||
            animal.animalGroomingNeeds ||
            animal.animalVocal) && (
            <>
              <Divider />
              <VStack space="md">
                <Heading className="text-xl font-semibold">Temperament</Heading>
                <VStack space="sm">
                  {renderCharacteristic(
                    'Energy Level',
                    animal.animalEnergyLevel
                  )}
                  {renderCharacteristic(
                    'Exercise Needs',
                    animal.animalExerciseNeeds
                  )}
                  {renderCharacteristic(
                    'Grooming Needs',
                    animal.animalGroomingNeeds
                  )}
                  {renderCharacteristic('Vocal', animal.animalVocal)}
                </VStack>
              </VStack>
            </>
          )}

          {/* Special Needs */}
          {animal.animalSpecialNeeds === 'Yes' && (
            <>
              <Divider />
              <VStack space="md">
                <Heading className="text-xl font-semibold text-warning-600">
                  Special Needs
                </Heading>
                {animal.animalSpecialNeedsDescription ? (
                  <Text className="text-typography-600">
                    {animal.animalSpecialNeedsDescription}
                  </Text>
                ) : (
                  <Text className="text-typography-600">
                    This pet has special needs. Please contact the shelter for
                    details.
                  </Text>
                )}
              </VStack>
            </>
          )}

          {/* Adoption Fee */}
          {animal.animalAdoptionFee && (
            <>
              <Divider />
              <VStack space="sm">
                <Heading className="text-xl font-semibold">
                  Adoption Fee
                </Heading>
                <Text className="text-typography-600 text-lg">
                  {animal.animalAdoptionFee}
                </Text>
              </VStack>
            </>
          )}

          {/* Contact Button */}
          <Button
            size="lg"
            onPress={handleContactShelter}
            className="mt-4"
            isDisabled={!animal.animalUrl}
          >
            <ButtonText>Contact Shelter</ButtonText>
          </Button>

          {/* Last Updated */}
          {animal.animalUpdatedDate && (
            <Text className="text-typography-400 text-sm text-center">
              Last updated:{' '}
              {new Date(animal.animalUpdatedDate).toLocaleDateString()}
            </Text>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
