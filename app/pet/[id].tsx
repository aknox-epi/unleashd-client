import { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  Linking,
  Share,
  Platform,
  FlatList,
  Dimensions,
  Pressable,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Modal as RNModal,
  StatusBar,
  Image as RNImage,
  PanResponder,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  MapPin,
} from 'lucide-react-native';
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
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetIcon,
} from '@/components/ui/actionsheet';
import { SpeciesBadge } from '@/components/SpeciesBadge';
import { useFavorites } from '@/contexts/FavoritesContext';
import { animalService, organizationService } from '@/services/rescuegroups';
import {
  getErrorMessage,
  type Animal,
  type Organization,
} from '@/services/rescuegroups';
import type { FavoriteAnimal } from '@/types/favorites';
import { logger } from '@/utils/logger';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();
  // Subscribe to theme changes to ensure component re-renders when theme updates
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreenModalVisible, setIsFullscreenModalVisible] =
    useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [isContactActionSheetOpen, setIsContactActionSheetOpen] =
    useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fullscreenFlatListRef = useRef<FlatList>(null);
  const modalTranslateY = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(1)).current;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    loadAnimalDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch organization details after animal loads
  useEffect(() => {
    if (animal?.animalOrgID) {
      loadOrganizationDetails(animal.animalOrgID);
    }
  }, [animal?.animalOrgID]);

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

  const loadOrganizationDetails = async (orgId: string) => {
    try {
      const data = await organizationService.getOrganizationById(orgId);
      setOrganization(data);
    } catch (err) {
      // Don't block the UI if org fetch fails - just log the error
      logger.warn('Failed to load organization details:', err);
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

  const handleBack = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }

    // Check if we can go back, otherwise navigate to explore
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/tabs/explore');
    }
  };

  const handleFavorite = async () => {
    if (!animal) return;

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

  const getMapsUrl = () => {
    // Only provide directions if there's a valid street address
    // Prevents vague "just take me to this city" links
    if (!organization || !organization.orgAddress) return null;

    const address = [
      organization.orgAddress,
      organization.orgCity,
      organization.orgState,
    ]
      .filter(Boolean)
      .join(', ');

    const encodedAddress = encodeURIComponent(address);

    if (Platform.OS === 'ios') {
      return `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (Platform.OS === 'android') {
      return `geo:0,0?q=${encodedAddress}`;
    } else {
      return `https://www.google.com/maps/search/${encodedAddress}`;
    }
  };

  const handleCall = () => {
    if (organization?.orgPhone) {
      Linking.openURL(`tel:${organization.orgPhone}`);
    }
  };

  const handleEmail = () => {
    if (organization?.orgEmail) {
      Linking.openURL(`mailto:${organization.orgEmail}`);
    }
  };

  const handleWebsite = () => {
    if (organization?.orgWebsite) {
      Linking.openURL(organization.orgWebsite);
    }
  };

  const handleViewListing = () => {
    if (animal?.animalUrl) {
      Linking.openURL(animal.animalUrl);
    }
  };

  const handleGetDirections = () => {
    const mapsUrl = getMapsUrl();
    if (mapsUrl) {
      Linking.openURL(mapsUrl);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentImageIndex(index);
  };

  const navigateToImage = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * screenWidth,
      animated: true,
    });
    setCurrentImageIndex(index);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      navigateToImage(currentImageIndex - 1);
    }
  };

  const goToNextImage = () => {
    const validImages =
      animal?.animalPictures?.filter((pic) => getImageUrl(pic)) || [];
    if (currentImageIndex < validImages.length - 1) {
      navigateToImage(currentImageIndex + 1);
    }
  };

  const getImageUrl = (picture: Animal['animalPictures'][0]) => {
    return (
      picture.urlSecureLarge ||
      picture.urlSecureFullsize ||
      picture.urlSecureSmall ||
      picture.urlSecureThumbnail
    );
  };

  const formatAdoptionFee = (fee: string | undefined): string | null => {
    if (!fee) return null;

    const trimmedFee = fee.trim();

    // Already has dollar sign
    if (trimmedFee.startsWith('$')) {
      return trimmedFee;
    }

    // Check if it's a numeric value (with optional decimal)
    if (/^\d+(\.\d{0,2})?$/.test(trimmedFee)) {
      return `$${trimmedFee}`;
    }

    // Non-numeric values like "Free", "Contact shelter", etc.
    return trimmedFee;
  };

  const openFullscreenImage = (index: number) => {
    setFullscreenImageIndex(index);
    setIsFullscreenModalVisible(true);
    // Reset animation values
    modalTranslateY.setValue(0);
    modalOpacity.setValue(1);
  };

  const closeFullscreenModal = () => {
    // Animate the modal out
    Animated.parallel([
      Animated.timing(modalTranslateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsFullscreenModalVisible(false);
      // Reset values for next open
      modalTranslateY.setValue(0);
      modalOpacity.setValue(1);
    });
  };

  // PanResponder for swipe-to-dismiss gesture (mobile only)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes that are significantly more vertical than horizontal
        // Require 2x more vertical movement to avoid interfering with horizontal scrolling
        const isVertical =
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 2;
        const hasMinVerticalMovement = Math.abs(gestureState.dy) > 20;

        return (
          Platform.OS !== 'web' &&
          isVertical &&
          hasMinVerticalMovement &&
          gestureState.dy > 0 // Only downward swipes
        );
      },
      onPanResponderGrant: () => {
        // User started dragging
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipes
        if (gestureState.dy > 0) {
          modalTranslateY.setValue(gestureState.dy);
          // Fade out as user swipes down
          const opacity = 1 - gestureState.dy / (screenHeight * 0.5);
          modalOpacity.setValue(Math.max(0, opacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down more than 150px or with sufficient velocity, dismiss
        if (
          gestureState.dy > 150 ||
          (gestureState.dy > 50 && gestureState.vy > 0.5)
        ) {
          closeFullscreenModal();
        } else {
          // Snap back to original position
          Animated.parallel([
            Animated.spring(modalTranslateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 65,
              friction: 10,
            }),
            Animated.timing(modalOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handleFullscreenScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setFullscreenImageIndex(index);
  };

  const navigateFullscreenImage = (index: number) => {
    fullscreenFlatListRef.current?.scrollToOffset({
      offset: index * screenWidth,
      animated: true,
    });
    setFullscreenImageIndex(index);
  };

  const goToPreviousFullscreenImage = () => {
    if (fullscreenImageIndex > 0) {
      navigateFullscreenImage(fullscreenImageIndex - 1);
    }
  };

  const goToNextFullscreenImage = () => {
    const validImages =
      animal?.animalPictures?.filter((pic) => getImageUrl(pic)) || [];
    if (fullscreenImageIndex < validImages.length - 1) {
      navigateFullscreenImage(fullscreenImageIndex + 1);
    }
  };

  const renderImageGallery = () => {
    if (!animal?.animalPictures || animal.animalPictures.length === 0) {
      return (
        <Box className="w-full h-80 bg-background-200 items-center justify-center">
          <Text className="text-typography-400">No photo available</Text>
        </Box>
      );
    }

    // Filter out images without valid URLs
    const validImages = animal.animalPictures.filter((pic) => getImageUrl(pic));

    if (validImages.length === 0) {
      return (
        <Box className="w-full h-80 bg-background-200 items-center justify-center">
          <Text className="text-typography-400">No photo available</Text>
        </Box>
      );
    }

    // If only one image, render it directly without FlatList to avoid gesture conflicts
    if (validImages.length === 1) {
      const imageUrl = getImageUrl(validImages[0]);
      return (
        <Box className="w-full h-80 bg-background-200">
          <Pressable onPress={() => openFullscreenImage(0)}>
            <Image
              source={{ uri: imageUrl }}
              alt={`${animal.animalName} photo`}
              className="w-full h-full"
              style={{ width: '100%', height: 320 }}
              resizeMode="cover"
            />
          </Pressable>
        </Box>
      );
    }

    return (
      <Box className="w-full h-80 bg-background-200">
        <FlatList
          ref={flatListRef}
          data={validImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          directionalLockEnabled
          keyExtractor={(item) => item.mediaID}
          renderItem={({ item, index }) => {
            const imageUrl = getImageUrl(item);
            return (
              <Pressable onPress={() => openFullscreenImage(index)}>
                <Box
                  className="bg-background-200 items-center justify-center"
                  style={{ width: screenWidth, height: 320 }}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    alt={`${animal.animalName} photo`}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </Box>
              </Pressable>
            );
          }}
        />

        {/* Pagination Indicators */}
        <HStack
          space="xs"
          className="absolute bottom-4 left-0 right-0 justify-center"
        >
          {validImages.map((_, index) => {
            return (
              <Box
                key={index}
                className={`rounded-full ${
                  index === currentImageIndex
                    ? 'w-2 h-2 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            );
          })}
        </HStack>

        {/* Photo Counter */}
        <Box className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-full">
          <Text className="text-white text-xs font-medium">
            {currentImageIndex + 1} / {validImages.length}
          </Text>
        </Box>

        {/* Navigation Buttons (Web Only) */}
        {Platform.OS === 'web' && (
          <>
            {/* Previous Button */}
            {currentImageIndex > 0 && (
              <Pressable
                onPress={goToPreviousImage}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: [{ translateY: -20 }],
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 9999,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>
            )}

            {/* Next Button */}
            {currentImageIndex < validImages.length - 1 && (
              <Pressable
                onPress={goToNextImage}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: [{ translateY: -20 }],
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 9999,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={24} color="white" />
              </Pressable>
            )}
          </>
        )}
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

    // Use SpeciesBadge for Dogs and Cats to maintain consistent species colors
    if ((label === 'Dogs' || label === 'Cats') && isPositive) {
      return <SpeciesBadge species={label} size="sm" variant={variant} />;
    }

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
              <Box className="ml-2">
                <Button variant="link" size="md" onPress={handleBack}>
                  <ButtonIcon as={ArrowLeft} size="xl" />
                </Button>
              </Box>
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
              <Box className="ml-2">
                <Button variant="link" size="md" onPress={handleBack}>
                  <ButtonIcon as={ArrowLeft} size="xl" />
                </Button>
              </Box>
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
          gestureEnabled: true,
          headerLeft: () => (
            <Box className="ml-2">
              <Button variant="link" size="md" onPress={handleBack}>
                <ButtonIcon as={ArrowLeft} size="xl" />
              </Button>
            </Box>
          ),
          headerRight: () => (
            <Box className="mr-2">
              <HStack space="md">
                <Button variant="link" size="md" onPress={handleShare}>
                  <ButtonIcon as={Share2} size="xl" />
                </Button>
                <Button variant="link" size="md" onPress={handleFavorite}>
                  <ButtonIcon
                    as={Heart}
                    size="xl"
                    fill={isFavorite(animal.animalID) ? 'currentColor' : 'none'}
                    className={
                      isFavorite(animal.animalID)
                        ? 'text-error-500'
                        : 'text-typography-700'
                    }
                  />
                </Button>
              </HStack>
            </Box>
          ),
        }}
      />

      <ScrollView className="bg-background-0">
        {renderImageGallery()}

        <VStack space="lg" className="p-6">
          {/* Header */}
          <VStack space="sm">
            <Heading className="text-3xl font-bold">
              {animal.animalName}
            </Heading>
            <HStack space="sm" className="flex-wrap">
              <SpeciesBadge species={animal.animalSpecies} size="md" />
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
          {formatAdoptionFee(animal.animalAdoptionFee) && (
            <>
              <Divider />
              <VStack space="sm">
                <Heading className="text-xl font-semibold">
                  Adoption Fee
                </Heading>
                <Text className="text-typography-600 text-lg">
                  {formatAdoptionFee(animal.animalAdoptionFee)}
                </Text>
              </VStack>
            </>
          )}

          {/* Adoption Requirements */}
          {(animal.animalFence || organization?.orgAboutAdopt) && (
            <>
              <Divider />
              <VStack space="md">
                <Heading className="text-xl font-semibold">
                  Adoption Requirements
                </Heading>
                <VStack space="sm">
                  {animal.animalFence && (
                    <HStack space="sm" className="items-start">
                      <Text className="text-typography-700">•</Text>
                      <Text className="text-typography-600 flex-1">
                        Fenced yard required
                      </Text>
                    </HStack>
                  )}
                  {organization?.orgAboutAdopt ? (
                    <Text className="text-typography-600 leading-6">
                      {organization.orgAboutAdopt}
                    </Text>
                  ) : (
                    <>
                      <HStack space="sm" className="items-start">
                        <Text className="text-typography-700">•</Text>
                        <Text className="text-typography-600 flex-1">
                          Complete adoption application
                        </Text>
                      </HStack>
                      <HStack space="sm" className="items-start">
                        <Text className="text-typography-700">•</Text>
                        <Text className="text-typography-600 flex-1">
                          Provide references
                        </Text>
                      </HStack>
                      <HStack space="sm" className="items-start">
                        <Text className="text-typography-700">•</Text>
                        <Text className="text-typography-600 flex-1">
                          Home visit may be required
                        </Text>
                      </HStack>
                    </>
                  )}
                  {organization?.orgWebsite && (
                    <Text className="text-typography-500 text-sm">
                      Visit the organization&apos;s website for complete
                      adoption requirements
                    </Text>
                  )}
                </VStack>
              </VStack>
            </>
          )}

          {/* Organization Info */}
          {organization && (
            <>
              <Divider />
              <VStack space="md">
                <Heading className="text-xl font-semibold">
                  About the Organization
                </Heading>

                {/* Organization Name */}
                {organization.orgName && (
                  <Text className="text-typography-700 font-semibold text-lg">
                    {organization.orgName}
                  </Text>
                )}

                {/* Organization Description */}
                {organization.orgAbout && (
                  <Text className="text-typography-600 leading-6">
                    {organization.orgAbout}
                  </Text>
                )}

                {/* Location */}
                {(organization.orgCity || organization.orgState) && (
                  <HStack space="sm" className="items-center">
                    <Text className="font-semibold text-typography-700">
                      Location:
                    </Text>
                    <Text className="text-typography-600">
                      {[organization.orgCity, organization.orgState]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </HStack>
                )}

                {/* Contact Info */}
                <VStack space="xs">
                  {organization.orgPhone && (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(`tel:${organization.orgPhone}`)
                      }
                    >
                      <HStack space="sm" className="items-center">
                        <Text className="font-semibold text-typography-700">
                          Phone:
                        </Text>
                        <Text className="text-info-600">
                          {organization.orgPhone}
                        </Text>
                      </HStack>
                    </Pressable>
                  )}
                  {organization.orgEmail && (
                    <Pressable
                      onPress={() =>
                        Linking.openURL(`mailto:${organization.orgEmail}`)
                      }
                    >
                      <HStack space="sm" className="items-center">
                        <Text className="font-semibold text-typography-700">
                          Email:
                        </Text>
                        <Text className="text-info-600">
                          {organization.orgEmail}
                        </Text>
                      </HStack>
                    </Pressable>
                  )}
                  {organization.orgWebsite && (
                    <Pressable
                      onPress={() => Linking.openURL(organization.orgWebsite!)}
                    >
                      <HStack space="sm" className="items-center">
                        <Text className="font-semibold text-typography-700">
                          Website:
                        </Text>
                        <Text className="text-info-600">
                          {organization.orgWebsite}
                        </Text>
                      </HStack>
                    </Pressable>
                  )}
                </VStack>

                {/* Social Media Links */}
                {(organization.orgFacebook || organization.orgTwitter) && (
                  <HStack space="sm" className="items-center">
                    <Text className="font-semibold text-typography-700">
                      Connect:
                    </Text>
                    {organization.orgFacebook && (
                      <Pressable
                        onPress={() =>
                          Linking.openURL(organization.orgFacebook!)
                        }
                      >
                        <Text className="text-info-600">Facebook</Text>
                      </Pressable>
                    )}
                    {organization.orgFacebook && organization.orgTwitter && (
                      <Text className="text-typography-500">•</Text>
                    )}
                    {organization.orgTwitter && (
                      <Pressable
                        onPress={() =>
                          Linking.openURL(organization.orgTwitter!)
                        }
                      >
                        <Text className="text-info-600">Twitter</Text>
                      </Pressable>
                    )}
                  </HStack>
                )}
              </VStack>
            </>
          )}

          {/* Contact Button */}
          <Button
            size="lg"
            onPress={() => setIsContactActionSheetOpen(true)}
            className="mt-4"
          >
            <ButtonText>Contact Shelter</ButtonText>
          </Button>

          {/* Contact Action Sheet */}
          <Actionsheet
            isOpen={isContactActionSheetOpen}
            onClose={() => setIsContactActionSheetOpen(false)}
          >
            <ActionsheetBackdrop />
            <ActionsheetContent>
              <ActionsheetDragIndicatorWrapper>
                <ActionsheetDragIndicator />
              </ActionsheetDragIndicatorWrapper>

              {/* Call */}
              <ActionsheetItem
                onPress={() => {
                  handleCall();
                  setIsContactActionSheetOpen(false);
                }}
                isDisabled={!organization?.orgPhone}
              >
                <ActionsheetIcon as={Phone} />
                <ActionsheetItemText>Call Shelter</ActionsheetItemText>
              </ActionsheetItem>

              {/* Email */}
              <ActionsheetItem
                onPress={() => {
                  handleEmail();
                  setIsContactActionSheetOpen(false);
                }}
                isDisabled={!organization?.orgEmail}
              >
                <ActionsheetIcon as={Mail} />
                <ActionsheetItemText>Send Email</ActionsheetItemText>
              </ActionsheetItem>

              {/* Website */}
              <ActionsheetItem
                onPress={() => {
                  handleWebsite();
                  setIsContactActionSheetOpen(false);
                }}
                isDisabled={!organization?.orgWebsite}
              >
                <ActionsheetIcon as={Globe} />
                <ActionsheetItemText>Visit Website</ActionsheetItemText>
              </ActionsheetItem>

              {/* View Listing */}
              <ActionsheetItem
                onPress={() => {
                  handleViewListing();
                  setIsContactActionSheetOpen(false);
                }}
                isDisabled={!animal?.animalUrl}
              >
                <ActionsheetIcon as={ExternalLink} />
                <ActionsheetItemText>View Listing</ActionsheetItemText>
              </ActionsheetItem>

              {/* Get Directions */}
              <ActionsheetItem
                onPress={() => {
                  handleGetDirections();
                  setIsContactActionSheetOpen(false);
                }}
                isDisabled={!getMapsUrl()}
              >
                <ActionsheetIcon as={MapPin} />
                <ActionsheetItemText>Get Directions</ActionsheetItemText>
              </ActionsheetItem>
            </ActionsheetContent>
          </Actionsheet>

          {/* Last Updated */}
          {animal.animalUpdatedDate && (
            <Text className="text-typography-400 text-sm text-center">
              Last updated:{' '}
              {new Date(animal.animalUpdatedDate).toLocaleDateString()}
            </Text>
          )}
        </VStack>
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <RNModal
        visible={isFullscreenModalVisible}
        transparent={false}
        animationType="none"
        onRequestClose={closeFullscreenModal}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'black',
            transform: [{ translateY: modalTranslateY }],
            opacity: modalOpacity,
          }}
          {...panResponder.panHandlers}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <StatusBar barStyle="light-content" />

          {/* Close Button */}
          <Pressable
            onPress={closeFullscreenModal}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 50 : 20,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 9999,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close fullscreen image"
            accessibilityHint="Double tap to close the fullscreen view"
          >
            <X size={24} color="white" />
          </Pressable>

          {animal?.animalPictures &&
            (() => {
              const validImages = animal.animalPictures.filter((pic) =>
                getImageUrl(pic)
              );

              return (
                <Box className="flex-1 justify-center">
                  <FlatList
                    ref={fullscreenFlatListRef}
                    data={validImages}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleFullscreenScroll}
                    scrollEventThrottle={16}
                    initialScrollIndex={fullscreenImageIndex}
                    getItemLayout={(_, index) => ({
                      length: screenWidth,
                      offset: screenWidth * index,
                      index,
                    })}
                    keyExtractor={(item) => item.mediaID}
                    renderItem={({ item }) => {
                      const imageUrl = getImageUrl(item);
                      return (
                        <Box
                          style={{ width: screenWidth, height: screenHeight }}
                        >
                          <RNImage
                            source={{ uri: imageUrl }}
                            style={{ width: screenWidth, height: screenHeight }}
                            resizeMode="contain"
                          />
                        </Box>
                      );
                    }}
                  />

                  {/* Pagination Indicators */}
                  {validImages.length > 1 && (
                    <HStack
                      space="xs"
                      className="absolute bottom-8 left-0 right-0 justify-center"
                    >
                      {validImages.map((_, index) => (
                        <Box
                          key={index}
                          className={`rounded-full ${
                            index === fullscreenImageIndex
                              ? 'w-2 h-2 bg-white'
                              : 'w-1.5 h-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </HStack>
                  )}

                  {/* Photo Counter */}
                  {validImages.length > 1 && (
                    <Box className="absolute top-20 left-0 right-0 items-center">
                      <Box className="bg-black/60 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-medium">
                          {fullscreenImageIndex + 1} / {validImages.length}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  {/* Navigation Buttons (Web Only) */}
                  {Platform.OS === 'web' && validImages.length > 1 && (
                    <>
                      {/* Previous Button */}
                      {fullscreenImageIndex > 0 && (
                        <Pressable
                          onPress={goToPreviousFullscreenImage}
                          style={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: [{ translateY: -20 }],
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: 9999,
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Previous image"
                          accessibilityHint="Double tap to view the previous image"
                        >
                          <ChevronLeft size={24} color="white" />
                        </Pressable>
                      )}

                      {/* Next Button */}
                      {fullscreenImageIndex < validImages.length - 1 && (
                        <Pressable
                          onPress={goToNextFullscreenImage}
                          style={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: [{ translateY: -20 }],
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            borderRadius: 9999,
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Next image"
                          accessibilityHint="Double tap to view the next image"
                        >
                          <ChevronRight size={24} color="white" />
                        </Pressable>
                      )}
                    </>
                  )}
                </Box>
              );
            })()}
        </Animated.View>
      </RNModal>
    </Box>
  );
}
