import { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { AnimalCard } from '@/components/AnimalCard';
import { organizationService } from '@/services/rescuegroups';
import {
  getErrorMessage,
  type Organization,
  type Animal,
} from '@/services/rescuegroups';
import { useTheme } from '@/contexts/ThemeContext';
import { logger } from '@/utils/logger';

const ITEMS_PER_PAGE = 20;

export default function OrganizationPetsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorMode } = useTheme();
  const isDarkMode = colorMode === 'dark';

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [pets, setPets] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalPets, setTotalPets] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadOrganization();
    loadInitialPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrganization = async () => {
    if (!id) return;

    try {
      const org = await organizationService.getOrganizationById(id);
      if (org) {
        setOrganization(org);
      }
    } catch (err) {
      logger.error(
        `Failed to load organization: ${getErrorMessage(err)}`,
        'OrgPetsList'
      );
    }
  };

  const loadInitialPets = async () => {
    if (!id) {
      setError(new Error('No organization ID provided'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setOffset(0);

      const result = await organizationService.getAnimalsByOrgId(
        id,
        ITEMS_PER_PAGE,
        0
      );

      setPets(result.data);
      setTotalPets(result.total);
      setHasMore(result.hasMore);
      setOffset(ITEMS_PER_PAGE);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error(`Failed to load pets: ${errorMessage}`, 'OrgPetsList');
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePets = async () => {
    if (!id || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);

      const result = await organizationService.getAnimalsByOrgId(
        id,
        ITEMS_PER_PAGE,
        offset
      );

      setPets((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setOffset((prev) => prev + ITEMS_PER_PAGE);
    } catch (err) {
      logger.error(
        `Failed to load more pets: ${getErrorMessage(err)}`,
        'OrgPetsList'
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadInitialPets();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBack = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web
    }
    router.back();
  };

  const handlePetPress = useCallback((animal: Animal) => {
    router.push(`/pet/${animal.animalID}`);
  }, []);

  const renderPetCard = useCallback(
    ({ item }: { item: Animal }) => (
      <Box className="px-4 mb-3">
        <AnimalCard
          animal={item}
          onPress={handlePetPress}
          isDarkMode={isDarkMode}
        />
      </Box>
    ),
    [handlePetPress, isDarkMode]
  );

  const renderHeader = () => (
    <Box className="px-4 pt-3 pb-2">
      <Text className="text-typography-500">
        {totalPets} {totalPets === 1 ? 'pet' : 'pets'} available
      </Text>
    </Box>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <Box className="py-4">
        <ActivityIndicator size="small" />
      </Box>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <Center className="py-12">
        <Text className="text-typography-500 text-center">
          No pets currently available from this organization
        </Text>
      </Center>
    );
  };

  if (isLoading) {
    return (
      <>
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
        <Center className="flex-1 bg-background-0">
          <Spinner size="large" />
        </Center>
      </>
    );
  }

  if (error) {
    return (
      <>
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
        <Box className="flex-1 bg-background-0">
          <Center className="mt-8">
            <Heading size="lg" className="mb-2">
              Unable to Load Pets
            </Heading>
            <Text className="text-typography-500 text-center">
              {error.message}
            </Text>
            <Button onPress={loadInitialPets} className="mt-4">
              <ButtonText>Try Again</ButtonText>
            </Button>
          </Center>
        </Box>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${organization?.orgName || 'Organization'} Pets`,
          headerLeft: () => (
            <Box className="ml-2">
              <Button variant="link" size="md" onPress={handleBack}>
                <ButtonIcon as={ArrowLeft} size="xl" />
              </Button>
            </Box>
          ),
        }}
      />
      <Box className="flex-1 bg-background-0">
        <FlatList
          data={pets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item.animalID}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMorePets}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#fff' : '#000'}
              colors={['#000']}
            />
          }
          contentContainerStyle={{
            flexGrow: 1,
            maxWidth: 448, // max-w-md
            width: '100%',
            alignSelf: 'center',
          }}
        />
      </Box>
    </>
  );
}
