import { useState, useEffect } from 'react';
import { FlatList, RefreshControl, Pressable } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';
import { AnimalCard } from '@/components/AnimalCard';
import { useAnimalSearch } from '@/hooks/useAnimals';
import { useRescueGroupsContext } from '@/contexts/RescueGroupsContext';
import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import {
  getErrorMessage,
  type Animal,
  type AnimalSpecies,
} from '@/services/rescuegroups';
import { isDevelopment } from '@/utils/env';
import { useWarningToast } from '@/hooks/useWarningToast';
import { useTheme } from '@/contexts/ThemeContext';

export default function Explore() {
  const { search, loadMore, results, total, hasMore, isLoading, error } =
    useAnimalSearch();
  const { warnings } = useRescueGroupsContext();
  const { colorMode } = useTheme();
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies>(
    RESCUEGROUPS_CONFIG.SPECIES.DOG
  );
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [warningsDismissed, setWarningsDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isDarkMode = colorMode === 'dark';

  // Show toast notifications in production
  useWarningToast(warnings, error);

  // Auto-search on mount with dogs
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setSearchPerformed(true);
    setErrorDismissed(false);
    setWarningsDismissed(false);
    await search({
      species: selectedSpecies,
      limit: 20,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorDismissed(false);
    setWarningsDismissed(false);
    await search({
      species: selectedSpecies,
      limit: 20,
    });
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      await loadMore();
    }
  };

  const handleAnimalPress = (animal: Animal) => {
    // TODO: Navigate to animal detail screen
    // Placeholder for future navigation functionality
    if (isDevelopment()) {
      // eslint-disable-next-line no-console
      console.log('Pressed animal:', animal.animalName);
    }
  };

  const renderHeader = () => (
    <VStack space="lg" className="w-full">
      <Heading className="text-2xl font-bold">Explore Pets</Heading>

      <VStack space="md">
        <Select
          selectedValue={selectedSpecies}
          onValueChange={(value) => setSelectedSpecies(value as AnimalSpecies)}
        >
          <SelectTrigger variant="outline" size="md">
            <SelectInput placeholder="Select Species" />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectItem
                label="Dogs"
                value={RESCUEGROUPS_CONFIG.SPECIES.DOG}
              />
              <SelectItem
                label="Cats"
                value={RESCUEGROUPS_CONFIG.SPECIES.CAT}
              />
              <SelectItem
                label="Birds"
                value={RESCUEGROUPS_CONFIG.SPECIES.BIRD}
              />
              <SelectItem
                label="Rabbits"
                value={RESCUEGROUPS_CONFIG.SPECIES.RABBIT}
              />
              <SelectItem
                label="Small Animals"
                value={RESCUEGROUPS_CONFIG.SPECIES.SMALL_ANIMAL}
              />
              <SelectItem
                label="Horses"
                value={RESCUEGROUPS_CONFIG.SPECIES.HORSE}
              />
              <SelectItem
                label="Reptiles"
                value={RESCUEGROUPS_CONFIG.SPECIES.REPTILE}
              />
              <SelectItem
                label="Barnyard"
                value={RESCUEGROUPS_CONFIG.SPECIES.BARNYARD}
              />
            </SelectContent>
          </SelectPortal>
        </Select>

        <Button onPress={handleSearch} isDisabled={isLoading}>
          <Icon as={Search} className="text-typography-0 mr-2" />
          <ButtonText>Search {selectedSpecies}s</ButtonText>
        </Button>
      </VStack>

      {isDevelopment() && error && !errorDismissed && (
        <HStack
          space="md"
          className="border-l-4 border-error-500 bg-error-50 p-4 rounded-r-lg"
        >
          <VStack space="sm" className="flex-1">
            <Text className="font-semibold text-error-700">Error:</Text>
            <Text className="text-error-700 text-sm">
              {getErrorMessage(error)}
            </Text>
          </VStack>
          <Pressable onPress={() => setErrorDismissed(true)} className="p-1">
            <Icon as={X} className="text-error-700" size="sm" />
          </Pressable>
        </HStack>
      )}

      {isDevelopment() && warnings.length > 0 && !warningsDismissed && (
        <HStack
          space="md"
          className="border-l-4 border-warning-500 bg-warning-50 p-4 rounded-r-lg"
        >
          <VStack space="sm" className="flex-1">
            <Text className="font-semibold text-warning-700">
              API Warnings ({warnings.length}):
            </Text>
            {warnings.map((warning, index) => (
              <Text key={index} className="text-warning-700 text-sm">
                • {warning}
              </Text>
            ))}
          </VStack>
          <Pressable onPress={() => setWarningsDismissed(true)} className="p-1">
            <Icon as={X} className="text-warning-700" size="sm" />
          </Pressable>
        </HStack>
      )}

      {searchPerformed && results.length > 0 && (
        <Text className="font-semibold text-center">
          Found {total} pets (showing {results.length})
        </Text>
      )}
    </VStack>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    if (!searchPerformed) {
      return (
        <Center className="py-12">
          <VStack space="md" className="items-center">
            <Text className="text-typography-500 text-center">
              Select a species and search to find adoptable pets
            </Text>
          </VStack>
        </Center>
      );
    }

    if (error) {
      return (
        <Center className="py-12">
          <VStack space="md" className="items-center max-w-md">
            <Text className="text-error-600 font-semibold">
              Unable to load pets
            </Text>
            <Text className="text-typography-500 text-center">
              Please try again later
            </Text>
            <Button onPress={handleSearch} size="sm">
              <ButtonText>Retry</ButtonText>
            </Button>
          </VStack>
        </Center>
      );
    }

    return (
      <Center className="py-12">
        <VStack space="md" className="items-center">
          <Text className="text-typography-500 text-center">
            No {selectedSpecies.toLowerCase()}s found
          </Text>
          <Text className="text-typography-400 text-sm text-center">
            Try selecting a different species
          </Text>
        </VStack>
      </Center>
    );
  };

  const renderFooter = () => {
    if (!hasMore) {
      return results.length > 0 ? (
        <Center className="py-6">
          <Text className="text-typography-400 text-sm">
            No more pets to load
          </Text>
        </Center>
      ) : null;
    }

    if (isLoading && results.length > 0) {
      return (
        <Center className="py-6">
          <Spinner size="small" />
        </Center>
      );
    }

    return null;
  };

  return (
    <Box className="flex-1">
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onPress={handleAnimalPress}
            isDarkMode={isDarkMode}
          />
        )}
        keyExtractor={(item) => item.animalID}
        contentContainerStyle={{ padding: 24, gap: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </Box>
  );
}
