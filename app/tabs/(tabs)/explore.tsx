import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FlatList, RefreshControl, Pressable } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  X,
  Search,
  SearchX,
  AlertCircle,
  ArrowUp,
  Filter,
  ChevronDown,
  MapPin,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  AccessibleSelect,
  AccessibleSelectTrigger,
  AccessibleSelectInput,
  AccessibleSelectPortal,
  AccessibleSelectContent,
  AccessibleSelectDragIndicatorWrapper,
  AccessibleSelectDragIndicator,
  AccessibleSelectItem,
} from '@/components/AccessibleSelect';
import { AnimalCard } from '@/components/AnimalCard';
import { AnimalCardSkeleton } from '@/components/AnimalCardSkeleton';
import { Fab, FabIcon } from '@/components/ui/fab';
import { useAnimalSearch } from '@/hooks/useAnimals';
import { useRescueGroupsContext } from '@/contexts/RescueGroupsContext';
import { useLocationPreferences } from '@/contexts/LocationPreferencesContext';
import { useSortPreferences } from '@/contexts/SortPreferencesContext';
import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import {
  getErrorMessage,
  type Animal,
  type AnimalSpecies,
  type Sex,
  type GeneralAge,
  type GeneralSizePotential,
} from '@/services/rescuegroups';
import {
  SortOption,
  SORT_LABELS,
  getSortFieldMapping,
  getSortOptionFromLabel,
} from '@/types/sort-preferences';
import { isDevelopment } from '@/utils/env';
import { useWarningToast } from '@/hooks/useWarningToast';
import { useTheme } from '@/contexts/ThemeContext';
import {
  isValidZipCode,
  formatZipCode,
  getBaseZipCode,
} from '@/utils/zipCodeValidation';

export default function Explore() {
  const { search, loadMore, results, total, hasMore, isLoading, error } =
    useAnimalSearch();
  const { warnings } = useRescueGroupsContext();
  const {
    preferences: locationPreferences,
    updatePreferences: updateLocationPreferences,
    isLoading: prefsLoading,
  } = useLocationPreferences();
  const {
    preferences: sortPreferences,
    updatePreferences: updateSortPreferences,
    isLoading: sortPrefsLoading,
  } = useSortPreferences();
  const { colorMode } = useTheme();
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies>(
    RESCUEGROUPS_CONFIG.SPECIES.DOG
  );
  const [selectedGender, setSelectedGender] = useState<Sex>('');
  const [selectedAge, setSelectedAge] = useState<GeneralAge>('');
  const [selectedSize, setSelectedSize] = useState<GeneralSizePotential>('');
  const [selectedSort, setSelectedSort] = useState<SortOption>(
    SortOption.NEWEST
  );
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState<number | ''>('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [warningsDismissed, setWarningsDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSortChanging, setIsSortChanging] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isDarkMode = colorMode === 'dark';

  // Show toast notifications in production
  useWarningToast(warnings, error);

  // Load saved location preferences on mount
  useEffect(() => {
    if (!prefsLoading && locationPreferences.zipCode) {
      setZipCode(locationPreferences.zipCode);
      setRadius(locationPreferences.radius);
    }
  }, [prefsLoading, locationPreferences]);

  // Load saved sort preferences on mount
  useEffect(() => {
    if (!sortPrefsLoading && sortPreferences.selectedSort) {
      setSelectedSort(sortPreferences.selectedSort);
    }
  }, [sortPrefsLoading, sortPreferences]);

  // Auto-search on mount with dogs
  useEffect(() => {
    handleSearch(false); // Skip haptic on auto-search
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(
    async (includeHaptic = true) => {
      if (includeHaptic) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          // Haptics not supported on web, ignore
        }
      }

      // Validate zip code before searching
      if (zipCode && !isValidZipCode(zipCode)) {
        setZipCodeError('Please enter a valid 5-digit ZIP code');
        return;
      }

      setSearchPerformed(true);
      setErrorDismissed(false);
      setWarningsDismissed(false);

      // Get sort field mapping
      const sortMapping = getSortFieldMapping(selectedSort);

      await search({
        species: selectedSpecies,
        sex: selectedGender || undefined,
        age: selectedAge || undefined,
        size: selectedSize || undefined,
        location:
          zipCode && isValidZipCode(zipCode)
            ? getBaseZipCode(zipCode)
            : undefined,
        radius: radius || undefined,
        sort: sortMapping.field,
        order: sortMapping.order,
        limit: 20,
      });

      // Save location preferences if location was used in search
      if (zipCode && isValidZipCode(zipCode)) {
        await updateLocationPreferences({ zipCode, radius });
      }
    },
    [
      zipCode,
      selectedSpecies,
      selectedGender,
      selectedAge,
      selectedSize,
      selectedSort,
      radius,
      search,
      updateLocationPreferences,
    ]
  );

  const handleRefresh = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    setIsRefreshing(true);
    setErrorDismissed(false);
    setWarningsDismissed(false);

    // Get sort field mapping
    const sortMapping = getSortFieldMapping(selectedSort);

    await search({
      species: selectedSpecies,
      sex: selectedGender || undefined,
      age: selectedAge || undefined,
      size: selectedSize || undefined,
      location:
        zipCode && isValidZipCode(zipCode)
          ? getBaseZipCode(zipCode)
          : undefined,
      radius: radius || undefined,
      sort: sortMapping.field,
      order: sortMapping.order,
      limit: 20,
    });
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      await loadMore();
    }
  };

  const handleAnimalPress = async (animal: Animal) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    router.push(`/pet/${animal.animalID}`);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 300);
  };

  const scrollToTop = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not supported on web, ignore
    }
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (selectedGender) count++;
    if (selectedAge) count++;
    if (selectedSize) count++;
    if (zipCode && isValidZipCode(zipCode)) count++;
    if (radius) count++;
    return count;
  }, [selectedGender, selectedAge, selectedSize, zipCode, radius]);

  const handleClearFilters = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    setSelectedGender('');
    setSelectedAge('');
    setSelectedSize('');
    setZipCode('');
    setRadius('');
    setZipCodeError('');
  }, []);

  const handleZipCodeChange = useCallback(
    (value: string) => {
      const formatted = formatZipCode(value);
      setZipCode(formatted);

      // Clear error when user starts typing
      if (zipCodeError) {
        setZipCodeError('');
      }
    },
    [zipCodeError]
  );

  const validateZipCodeOnBlur = useCallback(() => {
    if (zipCode && !isValidZipCode(zipCode)) {
      setZipCodeError('Please enter a valid 5-digit ZIP code');
    } else {
      setZipCodeError('');
    }
  }, [zipCode]);

  const handleSortChange = useCallback(
    async (value: string) => {
      try {
        await Haptics.selectionAsync();
      } catch {
        // Haptics not supported on web, ignore
      }
      const newSort = value as SortOption;
      setSelectedSort(newSort);

      // Save sort preference
      await updateSortPreferences({ selectedSort: newSort });

      // Auto-trigger search if search has been performed
      if (searchPerformed) {
        setIsSortChanging(true);
        await handleSearch(false);
        setIsSortChanging(false);
      }
    },
    [searchPerformed, handleSearch, updateSortPreferences]
  );

  const renderHeader = useMemo(() => {
    const activeFiltersCount = getActiveFilterCount();

    return (
      <VStack space="lg" className="w-full">
        <Heading className="text-2xl font-bold">Explore Pets</Heading>

        <VStack space="md">
          <AccessibleSelect
            selectedValue={selectedSpecies}
            onValueChange={(value) => {
              try {
                Haptics.selectionAsync();
              } catch {
                // Haptics not supported on web, ignore
              }
              setSelectedSpecies(value as AnimalSpecies);
            }}
          >
            <AccessibleSelectTrigger variant="outline" size="md">
              <AccessibleSelectInput placeholder="Select Species" />
            </AccessibleSelectTrigger>
            <AccessibleSelectPortal>
              <AccessibleSelectContent>
                <AccessibleSelectDragIndicatorWrapper>
                  <AccessibleSelectDragIndicator />
                </AccessibleSelectDragIndicatorWrapper>
                <AccessibleSelectItem
                  label="Dogs"
                  value={RESCUEGROUPS_CONFIG.SPECIES.DOG}
                />
                <AccessibleSelectItem
                  label="Cats"
                  value={RESCUEGROUPS_CONFIG.SPECIES.CAT}
                />
                <AccessibleSelectItem
                  label="Birds"
                  value={RESCUEGROUPS_CONFIG.SPECIES.BIRD}
                />
                <AccessibleSelectItem
                  label="Rabbits"
                  value={RESCUEGROUPS_CONFIG.SPECIES.RABBIT}
                />
                <AccessibleSelectItem
                  label="Small Animals"
                  value={RESCUEGROUPS_CONFIG.SPECIES.SMALL_ANIMAL}
                />
                <AccessibleSelectItem
                  label="Horses"
                  value={RESCUEGROUPS_CONFIG.SPECIES.HORSE}
                />
                <AccessibleSelectItem
                  label="Reptiles"
                  value={RESCUEGROUPS_CONFIG.SPECIES.REPTILE}
                />
                <AccessibleSelectItem
                  label="Barnyard"
                  value={RESCUEGROUPS_CONFIG.SPECIES.BARNYARD}
                />
              </AccessibleSelectContent>
            </AccessibleSelectPortal>
          </AccessibleSelect>

          <AccessibleSelect
            selectedValue={SORT_LABELS[selectedSort]}
            onValueChange={(value) => {
              // Find the sort option that matches this label
              const sortOption = getSortOptionFromLabel(value);
              if (sortOption) {
                handleSortChange(sortOption);
              }
            }}
            isDisabled={isSortChanging}
          >
            <AccessibleSelectTrigger variant="outline" size="md">
              <AccessibleSelectInput placeholder="Sort By" />
              {isSortChanging && (
                <Box className="pr-3">
                  <Spinner size="small" />
                </Box>
              )}
            </AccessibleSelectTrigger>
            <AccessibleSelectPortal>
              <AccessibleSelectContent>
                <AccessibleSelectDragIndicatorWrapper>
                  <AccessibleSelectDragIndicator />
                </AccessibleSelectDragIndicatorWrapper>
                <AccessibleSelectItem
                  label={SORT_LABELS[SortOption.NEWEST]}
                  value={SORT_LABELS[SortOption.NEWEST]}
                />
                <AccessibleSelectItem
                  label={SORT_LABELS[SortOption.OLDEST]}
                  value={SORT_LABELS[SortOption.OLDEST]}
                />
                <AccessibleSelectItem
                  label={SORT_LABELS[SortOption.DISTANCE_NEAR]}
                  value={SORT_LABELS[SortOption.DISTANCE_NEAR]}
                  isDisabled={!zipCode || !!zipCodeError}
                />
                <AccessibleSelectItem
                  label={SORT_LABELS[SortOption.DISTANCE_FAR]}
                  value={SORT_LABELS[SortOption.DISTANCE_FAR]}
                  isDisabled={!zipCode || !!zipCodeError}
                />
                <AccessibleSelectItem
                  label={SORT_LABELS[SortOption.NAME_ASC]}
                  value={SORT_LABELS[SortOption.NAME_ASC]}
                />
                <AccessibleSelectItem
                  label={SORT_LABELS[SortOption.NAME_DESC]}
                  value={SORT_LABELS[SortOption.NAME_DESC]}
                />
              </AccessibleSelectContent>
            </AccessibleSelectPortal>
          </AccessibleSelect>

          <Accordion
            type="single"
            variant="unfilled"
            size="md"
            value={isFiltersExpanded ? ['filters'] : []}
            onValueChange={(value) =>
              setIsFiltersExpanded(value.includes('filters'))
            }
          >
            <AccordionItem value="filters">
              <AccordionHeader>
                <AccordionTrigger>
                  <HStack space="sm" className="flex-1">
                    <Icon as={Filter} size="sm" />
                    <AccordionTitleText>
                      Filters
                      {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
                    </AccordionTitleText>
                  </HStack>
                  <AccordionIcon as={ChevronDown} />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <VStack space="md" className="pt-2">
                  <AccessibleSelect
                    selectedValue={selectedGender}
                    onValueChange={(value) => {
                      try {
                        Haptics.selectionAsync();
                      } catch {
                        // Haptics not supported on web, ignore
                      }
                      setSelectedGender(value as Sex);
                    }}
                  >
                    <AccessibleSelectTrigger variant="outline" size="md">
                      <AccessibleSelectInput placeholder="Gender (All)" />
                    </AccessibleSelectTrigger>
                    <AccessibleSelectPortal>
                      <AccessibleSelectContent>
                        <AccessibleSelectDragIndicatorWrapper>
                          <AccessibleSelectDragIndicator />
                        </AccessibleSelectDragIndicatorWrapper>
                        <AccessibleSelectItem label="All Genders" value="" />
                        <AccessibleSelectItem label="Male" value="Male" />
                        <AccessibleSelectItem label="Female" value="Female" />
                      </AccessibleSelectContent>
                    </AccessibleSelectPortal>
                  </AccessibleSelect>

                  <AccessibleSelect
                    selectedValue={selectedAge}
                    onValueChange={(value) => {
                      try {
                        Haptics.selectionAsync();
                      } catch {
                        // Haptics not supported on web, ignore
                      }
                      setSelectedAge(value as GeneralAge);
                    }}
                  >
                    <AccessibleSelectTrigger variant="outline" size="md">
                      <AccessibleSelectInput placeholder="Age (All)" />
                    </AccessibleSelectTrigger>
                    <AccessibleSelectPortal>
                      <AccessibleSelectContent>
                        <AccessibleSelectDragIndicatorWrapper>
                          <AccessibleSelectDragIndicator />
                        </AccessibleSelectDragIndicatorWrapper>
                        <AccessibleSelectItem label="All Ages" value="" />
                        <AccessibleSelectItem label="Baby" value="Baby" />
                        <AccessibleSelectItem label="Young" value="Young" />
                        <AccessibleSelectItem label="Adult" value="Adult" />
                        <AccessibleSelectItem label="Senior" value="Senior" />
                      </AccessibleSelectContent>
                    </AccessibleSelectPortal>
                  </AccessibleSelect>

                  <AccessibleSelect
                    selectedValue={selectedSize}
                    onValueChange={(value) => {
                      try {
                        Haptics.selectionAsync();
                      } catch {
                        // Haptics not supported on web, ignore
                      }
                      setSelectedSize(value as GeneralSizePotential);
                    }}
                  >
                    <AccessibleSelectTrigger variant="outline" size="md">
                      <AccessibleSelectInput placeholder="Size (All)" />
                    </AccessibleSelectTrigger>
                    <AccessibleSelectPortal>
                      <AccessibleSelectContent>
                        <AccessibleSelectDragIndicatorWrapper>
                          <AccessibleSelectDragIndicator />
                        </AccessibleSelectDragIndicatorWrapper>
                        <AccessibleSelectItem label="All Sizes" value="" />
                        <AccessibleSelectItem label="Small" value="Small" />
                        <AccessibleSelectItem label="Medium" value="Medium" />
                        <AccessibleSelectItem label="Large" value="Large" />
                        <AccessibleSelectItem label="X-Large" value="X-Large" />
                      </AccessibleSelectContent>
                    </AccessibleSelectPortal>
                  </AccessibleSelect>

                  <VStack space="sm">
                    <Text className="text-sm font-medium text-typography-600">
                      Location (Optional)
                    </Text>
                    <Input
                      variant="outline"
                      size="md"
                      isInvalid={!!zipCodeError}
                    >
                      <InputSlot className="pl-3">
                        <InputIcon as={MapPin} />
                      </InputSlot>
                      <InputField
                        placeholder="ZIP Code"
                        value={zipCode}
                        onChangeText={handleZipCodeChange}
                        onBlur={validateZipCodeOnBlur}
                        keyboardType="number-pad"
                        maxLength={10}
                      />
                    </Input>
                    {zipCodeError && (
                      <Text className="text-xs text-error-600">
                        {zipCodeError}
                      </Text>
                    )}
                  </VStack>

                  <AccessibleSelect
                    selectedValue={radius ? radius.toString() : ''}
                    onValueChange={(value) => {
                      try {
                        Haptics.selectionAsync();
                      } catch {
                        // Haptics not supported on web, ignore
                      }
                      setRadius(value ? Number(value) : '');
                    }}
                    isDisabled={!zipCode || !!zipCodeError}
                  >
                    <AccessibleSelectTrigger variant="outline" size="md">
                      <AccessibleSelectInput
                        placeholder={
                          !zipCode
                            ? 'Distance (Enter ZIP first)'
                            : 'Distance (Any)'
                        }
                      />
                    </AccessibleSelectTrigger>
                    <AccessibleSelectPortal>
                      <AccessibleSelectContent>
                        <AccessibleSelectDragIndicatorWrapper>
                          <AccessibleSelectDragIndicator />
                        </AccessibleSelectDragIndicatorWrapper>
                        <AccessibleSelectItem label="Any Distance" value="" />
                        <AccessibleSelectItem label="10 miles" value="10" />
                        <AccessibleSelectItem label="25 miles" value="25" />
                        <AccessibleSelectItem label="50 miles" value="50" />
                        <AccessibleSelectItem label="100 miles" value="100" />
                        <AccessibleSelectItem label="250 miles" value="250" />
                        <AccessibleSelectItem label="500 miles" value="500" />
                      </AccessibleSelectContent>
                    </AccessibleSelectPortal>
                  </AccessibleSelect>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={handleClearFilters}
                    >
                      <ButtonText>Clear All Filters</ButtonText>
                    </Button>
                  )}
                </VStack>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
            <Pressable
              onPress={() => setWarningsDismissed(true)}
              className="p-1"
            >
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSpecies,
    selectedGender,
    selectedAge,
    selectedSize,
    selectedSort,
    zipCode,
    zipCodeError,
    radius,
    isFiltersExpanded,
    searchPerformed,
    results.length,
    total,
    error,
    errorDismissed,
    warnings,
    warningsDismissed,
    isDarkMode,
    isLoading,
    isSortChanging,
    getActiveFilterCount,
    handleSearch,
    handleSortChange,
    handleClearFilters,
    handleZipCodeChange,
    validateZipCodeOnBlur,
  ]);

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    if (!searchPerformed) {
      return (
        <Center className="py-12">
          <VStack space="lg" className="items-center max-w-xs">
            <Icon
              as={Search}
              size="xl"
              className="text-typography-300"
              style={{ width: 64, height: 64 }}
            />
            <VStack space="sm" className="items-center">
              <Text className="text-typography-600 font-semibold text-center">
                Start Your Search
              </Text>
              <Text className="text-typography-500 text-center text-sm">
                Select a species above and tap search to find adorable adoptable
                pets near you
              </Text>
            </VStack>
          </VStack>
        </Center>
      );
    }

    if (error) {
      return (
        <Center className="py-12">
          <VStack space="lg" className="items-center max-w-xs">
            <Icon
              as={AlertCircle}
              size="xl"
              className="text-error-500"
              style={{ width: 64, height: 64 }}
            />
            <VStack space="sm" className="items-center">
              <Text className="text-error-600 font-semibold text-center">
                Unable to Load Pets
              </Text>
              <Text className="text-typography-500 text-center text-sm">
                We encountered an issue loading the pet listings. Please check
                your connection and try again.
              </Text>
            </VStack>
            <Button onPress={handleSearch} size="sm" className="mt-2">
              <ButtonText>Retry</ButtonText>
            </Button>
          </VStack>
        </Center>
      );
    }

    return (
      <Center className="py-12">
        <VStack space="lg" className="items-center max-w-xs">
          <Icon
            as={SearchX}
            size="xl"
            className="text-typography-300"
            style={{ width: 64, height: 64 }}
          />
          <VStack space="sm" className="items-center">
            <Text className="text-typography-600 font-semibold text-center">
              No {selectedSpecies}s Found
            </Text>
            <Text className="text-typography-500 text-center text-sm">
              We couldn&apos;t find any {selectedSpecies.toLowerCase()}s
              available for adoption right now. Try selecting a different
              species or check back later.
            </Text>
          </VStack>
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
        ref={flatListRef}
        data={isLoading && results.length === 0 ? Array(5).fill(null) : results}
        renderItem={({ item }) =>
          isLoading && results.length === 0 ? (
            <AnimalCardSkeleton isDarkMode={isDarkMode} />
          ) : (
            <AnimalCard
              animal={item}
              onPress={handleAnimalPress}
              isDarkMode={isDarkMode}
            />
          )
        }
        keyExtractor={(item, index) =>
          isLoading && results.length === 0
            ? `skeleton-${index}`
            : item.animalID
        }
        contentContainerStyle={{ padding: 24, gap: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDarkMode ? '#9BA1A6' : '#687076'}
            colors={['#0a7ea4', '#0891b2']}
            progressBackgroundColor={isDarkMode ? '#1F2937' : '#F9FAFB'}
          />
        }
      />
      {showScrollToTop && (
        <Fab onPress={scrollToTop} size="md" placement="bottom right">
          <FabIcon as={ArrowUp} />
        </Fab>
      )}
    </Box>
  );
}
