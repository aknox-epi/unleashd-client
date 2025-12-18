import React, { useRef, useEffect } from 'react';
import { Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Heart,
} from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { Organization } from '@/services/rescuegroups';

interface OrganizationCardProps {
  organization: Organization;
  onPress?: (organization: Organization) => void;
  isDarkMode?: boolean;
  variant?: 'compact' | 'detailed';
  showDistance?: boolean;
  showFavorite?: boolean;
  isFavorited?: boolean;
  onFavoritePress?: (organization: Organization) => void;
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
    typeof distance === 'number' ? distance : parseFloat(String(distance));

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
 * OrganizationCard component displays a rescue organization in a card format
 * Supports two variants: compact (for lists) and detailed (full information)
 */
export function OrganizationCard({
  organization,
  onPress,
  isDarkMode = false,
  variant = 'compact',
  showDistance = false,
  showFavorite = false,
  isFavorited = false,
  onFavoritePress,
}: OrganizationCardProps) {
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
      onPress(organization);
    }
  };

  const handleFavoritePress = async (e?: React.BaseSyntheticEvent) => {
    // Stop event propagation to prevent card press
    e?.stopPropagation?.();

    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not supported on web, ignore
    }

    if (onFavoritePress) {
      onFavoritePress(organization);
    }
  };

  // Location string (city, state)
  const location =
    organization.orgLocationCityState ||
    [organization.orgCity, organization.orgState].filter(Boolean).join(', ');

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
        {showFavorite && (
          <Box className="absolute top-2 right-2 z-10">
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID={`favorite-button-${organization.orgID}`}
            >
              <Icon
                as={Heart}
                size="lg"
                className={
                  isFavorited
                    ? 'text-error-500'
                    : isDarkMode
                      ? 'text-typography-400'
                      : 'text-typography-300'
                }
                fill={isFavorited ? 'currentColor' : 'none'}
              />
            </Pressable>
          </Box>
        )}

        <HStack space="md">
          {/* Icon */}
          <Box
            className={`h-20 w-20 rounded-lg border ${
              isDarkMode
                ? 'bg-background-100 border-outline-300'
                : 'bg-background-50 border-outline-200'
            } items-center justify-center`}
          >
            <Icon
              as={Building2}
              size="xl"
              className={
                isDarkMode ? 'text-typography-400' : 'text-typography-300'
              }
            />
          </Box>

          {/* Content */}
          <VStack space="xs" className="flex-1 shrink pr-8">
            <Heading size="sm" className="font-semibold">
              {organization.orgName}
            </Heading>

            {organization.orgType && (
              <Text size="sm" className="text-typography-500">
                {organization.orgType}
              </Text>
            )}

            {variant === 'detailed' && organization.orgAbout && (
              <Text size="sm" className="text-typography-500">
                {organization.orgAbout}
              </Text>
            )}

            {location && (
              <HStack space="xs" className="items-center">
                <Icon as={MapPin} size="xs" className="text-typography-400" />
                <Text size="xs" className="text-typography-400">
                  {location}
                </Text>
              </HStack>
            )}

            {showDistance &&
              organization.orgDistance !== undefined &&
              formatDistance(organization.orgDistance) && (
                <Text
                  size="xs"
                  className={
                    isDarkMode
                      ? 'text-info-400 font-medium'
                      : 'text-info-600 font-medium'
                  }
                >
                  {formatDistance(organization.orgDistance)}
                </Text>
              )}

            {variant === 'detailed' && (
              <VStack space="xs" className="mt-1">
                {organization.orgPhone && (
                  <HStack space="xs" className="items-center">
                    <Icon
                      as={Phone}
                      size="xs"
                      className="text-typography-400"
                    />
                    <Text size="xs" className="text-typography-400">
                      {organization.orgPhone}
                    </Text>
                  </HStack>
                )}

                {organization.orgEmail && (
                  <HStack space="xs" className="items-center">
                    <Icon as={Mail} size="xs" className="text-typography-400" />
                    <Text size="xs" className="text-typography-400">
                      {organization.orgEmail}
                    </Text>
                  </HStack>
                )}

                {organization.orgWebsiteUrl && (
                  <HStack space="xs" className="items-center">
                    <Icon
                      as={Globe}
                      size="xs"
                      className="text-typography-400"
                    />
                    <Text size="xs" className="text-info-600">
                      Website
                    </Text>
                  </HStack>
                )}
              </VStack>
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
        testID={`organization-card-${organization.orgID}`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
