import React, { useState } from 'react';
import { FlatList, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Building2 } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Center } from '@/components/ui/center';
import { AnimalCard } from '@/components/AnimalCard';
import { OrganizationCard } from '@/components/OrganizationCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Animal, Organization } from '@/services/rescuegroups';
import type { FavoriteAnimal, FavoriteOrganization } from '@/types/favorites';

type TabType = 'pets' | 'organizations';

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

/**
 * Convert FavoriteOrganization to Organization type for OrganizationCard compatibility
 */
function favoriteToOrganization(favorite: FavoriteOrganization): Organization {
  return {
    orgID: favorite.orgID,
    orgName: favorite.orgName,
    orgType: favorite.orgType,
    orgLocationCitystate: favorite.orgLocationCitystate,
    orgCity: favorite.orgCity,
    orgState: favorite.orgState,
    orgAbout: favorite.orgAbout,
  } as Organization;
}

/**
 * Tab button component for switching between pets and organizations
 */
interface TabButtonProps {
  tab: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  badgeCount: number;
  activeTab: TabType;
  isDarkMode: boolean;
  onTabChange: (tab: TabType) => void;
}

function TabButton({
  tab,
  label,
  icon: IconComponent,
  badgeCount,
  activeTab,
  isDarkMode,
  onTabChange,
}: TabButtonProps) {
  const isActive = activeTab === tab;

  return (
    <Pressable
      onPress={() => onTabChange(tab)}
      className="flex-1"
      testID={`tab-button-${tab}`}
    >
      <Box
        className={`px-4 py-3 border-b-2 ${
          isActive
            ? 'border-primary-500'
            : isDarkMode
              ? 'border-outline-700'
              : 'border-outline-200'
        }`}
      >
        <HStack space="xs" className="items-center justify-center">
          <Icon
            as={IconComponent}
            size="sm"
            className={
              isActive
                ? 'text-primary-500'
                : isDarkMode
                  ? 'text-typography-400'
                  : 'text-typography-500'
            }
          />
          <Text
            className={`font-semibold ${
              isActive
                ? 'text-primary-500'
                : isDarkMode
                  ? 'text-typography-400'
                  : 'text-typography-500'
            }`}
          >
            {label}
          </Text>
          {badgeCount > 0 && (
            <Box
              className={`px-2 py-0.5 rounded-full ${
                isActive ? 'bg-primary-500' : 'bg-background-300'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? 'text-white' : 'text-typography-700'
                }`}
              >
                {badgeCount}
              </Text>
            </Box>
          )}
        </HStack>
      </Box>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const { favorites, favoriteOrgs, count, orgCount, toggleOrgFavorite } =
    useFavorites();
  const { colorMode } = useTheme();
  const isDarkMode = colorMode === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pets');

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

  const handleTabChange = async (tab: TabType) => {
    if (tab === activeTab) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    setActiveTab(tab);
  };

  const handleCardPress = async (animal: Animal) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    router.push(`/pet/${animal.animalID}`);
  };

  const handleOrgPress = async (org: Organization) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web, ignore
    }
    router.push(`/org/${org.orgID}`);
  };

  const handleOrgFavoritePress = async (org: Organization) => {
    const favoriteOrg: FavoriteOrganization = {
      orgID: org.orgID,
      orgName: org.orgName,
      orgType: org.orgType,
      orgLocationCitystate: org.orgLocationCitystate,
      orgCity: org.orgCity,
      orgState: org.orgState,
      orgAbout: org.orgAbout,
      favoritedAt: Date.now(),
    };
    await toggleOrgFavorite(favoriteOrg);
  };

  // Empty state for current tab
  const isEmpty = activeTab === 'pets' ? count === 0 : orgCount === 0;

  const emptyStateText =
    activeTab === 'pets'
      ? 'Start adding pets to your favorites by tapping the heart icon on any pet card or detail screen.'
      : 'Start adding organizations to your favorites by tapping the heart icon on any organization detail screen.';

  return (
    <Box className="flex-1 bg-background-0">
      {/* Tab Switcher */}
      <HStack className="bg-background-0 border-b border-outline-200">
        <TabButton
          tab="pets"
          label="Pets"
          icon={Heart}
          badgeCount={count}
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          onTabChange={handleTabChange}
        />
        <TabButton
          tab="organizations"
          label="Organizations"
          icon={Building2}
          badgeCount={orgCount}
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          onTabChange={handleTabChange}
        />
      </HStack>

      {/* Empty state */}
      {isEmpty ? (
        <Center className="flex-1 px-6">
          <VStack space="lg" className="items-center max-w-md">
            <Box className="w-24 h-24 items-center justify-center">
              <Icon
                as={activeTab === 'pets' ? Heart : Building2}
                size="xl"
                className={
                  isDarkMode ? 'text-typography-400' : 'text-typography-300'
                }
              />
            </Box>
            <VStack space="sm" className="items-center">
              <Heading size="xl" className="text-center">
                No {activeTab === 'pets' ? 'Pet' : 'Organization'} Favorites Yet
              </Heading>
              <Text className="text-typography-500 text-center">
                {emptyStateText}
              </Text>
            </VStack>
          </VStack>
        </Center>
      ) : (
        <Center className="flex-1">
          {activeTab === 'pets' ? (
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
          ) : (
            <FlatList
              data={favoriteOrgs}
              keyExtractor={(item) => item.orgID}
              renderItem={({ item }) => (
                <OrganizationCard
                  organization={favoriteToOrganization(item)}
                  onPress={handleOrgPress}
                  isDarkMode={isDarkMode}
                  variant="compact"
                  showFavorite={true}
                  isFavorited={true}
                  onFavoritePress={handleOrgFavoritePress}
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
                    {orgCount} {orgCount === 1 ? 'favorite' : 'favorites'}
                  </Text>
                </Box>
              }
              className="w-full max-w-md px-4"
            />
          )}
        </Center>
      )}
    </Box>
  );
}
