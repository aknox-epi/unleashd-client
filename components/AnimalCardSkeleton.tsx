import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

interface AnimalCardSkeletonProps {
  isDarkMode?: boolean;
}

/**
 * AnimalCardSkeleton component displays a loading placeholder
 * that mirrors the layout of the AnimalCard component
 */
export function AnimalCardSkeleton({
  isDarkMode = false,
}: AnimalCardSkeletonProps) {
  return (
    <VStack
      className="border border-outline-200 rounded-lg p-4 bg-background-0"
      space="sm"
    >
      <HStack space="md">
        {/* Image skeleton */}
        <Skeleton
          className="h-32 w-32 rounded-lg"
          startColor={isDarkMode ? 'bg-background-200' : 'bg-background-100'}
        />

        <VStack space="sm" className="flex-1">
          {/* Name skeleton */}
          <SkeletonText
            _lines={1}
            className="h-5 w-3/4"
            startColor={isDarkMode ? 'bg-background-200' : 'bg-background-100'}
          />

          {/* Species/Breed skeleton */}
          <SkeletonText
            _lines={1}
            className="h-4 w-full"
            startColor={isDarkMode ? 'bg-background-200' : 'bg-background-100'}
          />

          {/* Age skeleton */}
          <SkeletonText
            _lines={1}
            className="h-4 w-2/3"
            startColor={isDarkMode ? 'bg-background-200' : 'bg-background-100'}
          />

          {/* Sex skeleton */}
          <SkeletonText
            _lines={1}
            className="h-4 w-1/2"
            startColor={isDarkMode ? 'bg-background-200' : 'bg-background-100'}
          />

          {/* Location skeleton */}
          <SkeletonText
            _lines={1}
            className="h-3 w-3/4"
            startColor={isDarkMode ? 'bg-background-200' : 'bg-background-100'}
          />
        </VStack>
      </HStack>
    </VStack>
  );
}
