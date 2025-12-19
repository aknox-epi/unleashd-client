import { useEffect, useState } from 'react';
import { ScrollView, Linking, Share, Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import {
  Share2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  ExternalLink,
  Heart,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { AppHeader } from '@/components/AppHeader';
import { useConditionalBack } from '@/hooks/useConditionalBack';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';
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
import { AnimalCard } from '@/components/AnimalCard';
import { organizationService } from '@/services/rescuegroups';
import {
  getErrorMessage,
  type Organization,
  type Animal,
} from '@/services/rescuegroups';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { FavoriteOrganization } from '@/types/favorites';
import { logger } from '@/utils/logger';

export default function OrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorMode } = useTheme();
  const isDarkMode = colorMode === 'dark';
  const { isOrgFavorite, toggleOrgFavorite } = useFavorites();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [recentPets, setRecentPets] = useState<Animal[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [totalPets, setTotalPets] = useState(0);
  const [isContactActionSheetOpen, setIsContactActionSheetOpen] =
    useState(false);

  const isFavorited = id ? isOrgFavorite(id) : false;
  const { canGoBack, goBack, goToExplore } = useConditionalBack();

  useEffect(() => {
    loadOrganizationDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (organization) {
      loadRecentPets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization]);

  const loadOrganizationDetails = async () => {
    if (!id) {
      setError(new Error('No organization ID provided'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const org = await organizationService.getOrganizationById(id);

      if (!org) {
        throw new Error('Organization not found');
      }

      setOrganization(org);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error(`Failed to load organization: ${errorMessage}`, 'OrgDetail');
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentPets = async () => {
    if (!id) return;

    try {
      setPetsLoading(true);

      // Load first 5 pets from organization
      const result = await organizationService.getAnimalsByOrgId(id, 5);

      setRecentPets(result.data);
      setTotalPets(result.total);
    } catch (err) {
      logger.error(`Failed to load pets: ${getErrorMessage(err)}`, 'OrgDetail');
    } finally {
      setPetsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!organization) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const message = `Check out ${organization.orgName}${
        organization.orgWebsiteUrl ? `: ${organization.orgWebsiteUrl}` : ''
      }`;

      await Share.share({
        message,
        title: organization.orgName,
      });
    } catch (err) {
      logger.error(`Failed to share: ${getErrorMessage(err)}`, 'OrgDetail');
    }
  };

  const handleCallPhone = () => {
    if (organization?.orgPhone) {
      const phoneUrl = `tel:${organization.orgPhone}`;
      Linking.openURL(phoneUrl);
    }
  };

  const handleSendEmail = () => {
    if (organization?.orgEmail) {
      const emailUrl = `mailto:${organization.orgEmail}`;
      Linking.openURL(emailUrl);
    }
  };

  const handleOpenWebsite = () => {
    if (organization?.orgWebsiteUrl) {
      Linking.openURL(organization.orgWebsiteUrl);
    }
  };

  const handleGetDirections = () => {
    if (!organization) return;

    const { orgAddress, orgCity, orgState, orgPostalCode } = organization;
    const addressParts = [orgAddress, orgCity, orgState, orgPostalCode]
      .filter(Boolean)
      .join(', ');

    if (!addressParts) {
      logger.warn('No address available for directions', 'OrgDetail');
      return;
    }

    const encodedAddress = encodeURIComponent(addressParts);
    const mapsUrl =
      Platform.OS === 'ios'
        ? `maps://maps.apple.com/?address=${encodedAddress}`
        : `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    Linking.openURL(mapsUrl);
  };

  const handleViewAllPets = () => {
    if (!id) return;
    router.push(`/org/pets/${id}`);
  };

  const handlePetPress = (animal: Animal) => {
    router.push(`/pet/${animal.animalID}`);
  };

  const handleFavoritePress = async () => {
    if (!organization) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not supported on web
    }

    const favoriteOrg: FavoriteOrganization = {
      orgID: organization.orgID,
      orgName: organization.orgName,
      orgType: organization.orgType,
      orgLocationCityState: organization.orgLocationCityState,
      orgCity: organization.orgCity,
      orgState: organization.orgState,
      orgAbout: organization.orgAbout,
      favoritedAt: Date.now(),
    };

    await toggleOrgFavorite(favoriteOrg);
  };

  // Format location string
  const location =
    organization?.orgLocationCityState ||
    [organization?.orgCity, organization?.orgState].filter(Boolean).join(', ');

  // Check if address is available for directions
  const hasAddress = Boolean(organization?.orgAddress);

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: '',
            headerLeft: () => (
              <AppHeader
                canGoBack={canGoBack}
                onBack={goBack}
                onPressApp={goToExplore}
              />
            ),
          }}
        />
        <Center className="flex-1 bg-background-0">
          <Spinner size="large" />
        </Center>
      </>
    );
  }

  if (error || !organization) {
    return (
      <>
        <Stack.Screen
          options={{
            title: '',
            headerLeft: () => (
              <AppHeader
                canGoBack={canGoBack}
                onBack={goBack}
                onPressApp={goToExplore}
              />
            ),
          }}
        />
        <ScrollView className="flex-1 bg-background-0">
          <Box className="px-4">
            <Center className="mt-8">
              <Heading size="lg" className="mb-2">
                Unable to Load Organization
              </Heading>
              <Text className="text-typography-500 text-center">
                {error?.message || 'Organization not found'}
              </Text>
              <Button onPress={loadOrganizationDetails} className="mt-4">
                <ButtonText>Try Again</ButtonText>
              </Button>
            </Center>
          </Box>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => (
            <AppHeader
              canGoBack={canGoBack}
              onBack={goBack}
              onPressApp={goToExplore}
            />
          ),
          headerRight: () => (
            <Box className="mr-2">
              <HStack space="md">
                <Button variant="link" size="md" onPress={handleFavoritePress}>
                  <ButtonIcon
                    as={Heart}
                    size="xl"
                    fill={isFavorited ? 'currentColor' : 'none'}
                    className={
                      isFavorited ? 'text-error-500' : 'text-typography-700'
                    }
                  />
                </Button>
                <Button variant="link" size="md" onPress={handleShare}>
                  <ButtonIcon as={Share2} size="xl" />
                </Button>
              </HStack>
            </Box>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background-0">
        <Box className="max-w-md w-full mx-auto">
          {/* Organization Hero */}
          <VStack space="md" className="p-4 pt-4">
            <HStack space="md" className="items-center">
              <Box
                className={`h-20 w-20 rounded-lg border ${
                  isDarkMode
                    ? 'bg-background-100 border-outline-300'
                    : 'bg-background-50 border-outline-200'
                } items-center justify-center`}
              >
                <Building2
                  size={40}
                  color={
                    isDarkMode ? 'rgb(163, 163, 163)' : 'rgb(212, 212, 212)'
                  }
                />
              </Box>
              <VStack space="xs" className="flex-1">
                <Heading size="xl" className="text-typography-900">
                  {organization.orgName}
                </Heading>
                {organization.orgType && (
                  <Text className="text-typography-500 text-lg">
                    {organization.orgType}
                  </Text>
                )}
              </VStack>
            </HStack>
          </VStack>

          <Divider className="my-2" />

          {/* About Section */}
          {organization.orgAbout && (
            <>
              <VStack space="sm" className="p-4">
                <Heading size="md">About</Heading>
                <Text className="text-typography-700 whitespace-normal">
                  {organization.orgAbout}
                </Text>
              </VStack>
              <Divider className="my-2" />
            </>
          )}

          {/* Location & Contact Section */}
          <VStack space="md" className="p-4">
            <Heading size="md">Location & Contact</Heading>

            {location && (
              <HStack space="sm" className="items-start">
                <MapPin size={20} className="text-typography-500 mt-0.5" />
                <VStack space="xs" className="flex-1">
                  <Text className="font-semibold text-typography-700">
                    Location
                  </Text>
                  <Text className="text-typography-600">{location}</Text>
                  {organization.orgAddress && (
                    <Text className="text-typography-500 text-sm">
                      {organization.orgAddress}
                    </Text>
                  )}
                </VStack>
              </HStack>
            )}

            {organization.orgPhone && (
              <Pressable onPress={handleCallPhone}>
                <HStack space="sm" className="items-center">
                  <Phone size={20} className="text-typography-500" />
                  <VStack space="xs" className="flex-1">
                    <Text className="font-semibold text-typography-700">
                      Phone
                    </Text>
                    <Text className="text-info-600">
                      {organization.orgPhone}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
            )}

            {organization.orgEmail && (
              <Pressable onPress={handleSendEmail}>
                <HStack space="sm" className="items-center">
                  <Mail size={20} className="text-typography-500" />
                  <VStack space="xs" className="flex-1">
                    <Text className="font-semibold text-typography-700">
                      Email
                    </Text>
                    <Text className="text-info-600">
                      {organization.orgEmail}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
            )}

            {organization.orgWebsiteUrl && (
              <Pressable onPress={handleOpenWebsite}>
                <HStack space="sm" className="items-center">
                  <Globe size={20} className="text-typography-500" />
                  <VStack space="xs" className="flex-1">
                    <Text className="font-semibold text-typography-700">
                      Website
                    </Text>
                    <Text className="text-info-600 truncate">
                      {organization.orgWebsiteUrl}
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
            )}

            {/* Social Media Links */}
            {(organization.orgFacebookUrl || organization.orgTwitterUrl) && (
              <HStack space="sm" className="items-center">
                <Text className="font-semibold text-typography-700">
                  Connect:
                </Text>
                {organization.orgFacebookUrl && (
                  <Pressable
                    onPress={() =>
                      Linking.openURL(organization.orgFacebookUrl!)
                    }
                  >
                    <Text className="text-info-600">Facebook</Text>
                  </Pressable>
                )}
                {organization.orgFacebookUrl && organization.orgTwitterUrl && (
                  <Text className="text-typography-500">•</Text>
                )}
                {organization.orgTwitterUrl && (
                  <Pressable
                    onPress={() => Linking.openURL(organization.orgTwitterUrl!)}
                  >
                    <Text className="text-info-600">Twitter</Text>
                  </Pressable>
                )}
              </HStack>
            )}
          </VStack>

          <Divider className="my-2" />

          {/* Available Pets Section */}
          <VStack space="md" className="p-4">
            <HStack className="justify-between items-center">
              <Heading size="md">Available Pets</Heading>
              {totalPets > 0 && (
                <Text className="text-typography-500">
                  {totalPets} {totalPets === 1 ? 'pet' : 'pets'}
                </Text>
              )}
            </HStack>

            {petsLoading ? (
              <Center className="py-8">
                <Spinner />
              </Center>
            ) : recentPets.length > 0 ? (
              <VStack space="sm">
                {recentPets.map((pet) => (
                  <AnimalCard
                    key={pet.animalID}
                    animal={pet}
                    onPress={handlePetPress}
                    isDarkMode={isDarkMode}
                  />
                ))}

                {totalPets > recentPets.length && (
                  <Button onPress={handleViewAllPets} variant="outline">
                    <ButtonText>View All {totalPets} Pets</ButtonText>
                    <ButtonIcon as={ExternalLink} />
                  </Button>
                )}
              </VStack>
            ) : (
              <Text className="text-typography-500 text-center py-4">
                No pets currently available
              </Text>
            )}
          </VStack>

          {/* Contact Actions */}
          <Box className="p-4 pb-8">
            <Button onPress={() => setIsContactActionSheetOpen(true)}>
              <ButtonText>Contact Organization</ButtonText>
            </Button>
          </Box>
        </Box>
      </ScrollView>

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
              handleCallPhone();
              setIsContactActionSheetOpen(false);
            }}
            isDisabled={!organization?.orgPhone}
          >
            <ActionsheetIcon as={Phone} />
            <ActionsheetItemText>Call</ActionsheetItemText>
          </ActionsheetItem>

          {/* Email */}
          <ActionsheetItem
            onPress={() => {
              handleSendEmail();
              setIsContactActionSheetOpen(false);
            }}
            isDisabled={!organization?.orgEmail}
          >
            <ActionsheetIcon as={Mail} />
            <ActionsheetItemText>Email</ActionsheetItemText>
          </ActionsheetItem>

          {/* Visit Website */}
          <ActionsheetItem
            onPress={() => {
              handleOpenWebsite();
              setIsContactActionSheetOpen(false);
            }}
            isDisabled={!organization?.orgWebsiteUrl}
          >
            <ActionsheetIcon as={Globe} />
            <ActionsheetItemText>Visit Website</ActionsheetItemText>
          </ActionsheetItem>

          {/* Get Directions */}
          <ActionsheetItem
            onPress={() => {
              handleGetDirections();
              setIsContactActionSheetOpen(false);
            }}
            isDisabled={!hasAddress}
          >
            <ActionsheetIcon as={MapPin} />
            <ActionsheetItemText>Get Directions</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </>
  );
}
