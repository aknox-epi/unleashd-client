import React from 'react';
import { Pressable } from 'react-native';
import { ArrowLeft, PawPrint } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonIcon } from '@/components/ui/button';

interface AppHeaderProps {
  canGoBack: boolean;
  onBack: () => void;
  onPressApp: () => void;
}

/**
 * Reusable app header component with conditional back button
 * Always shows "unleashd" with paw icon (always pressable to navigate to explore)
 * Shows back button only when navigation history exists
 */
export function AppHeader({ canGoBack, onBack, onPressApp }: AppHeaderProps) {
  return (
    <HStack space="sm" className="ml-2 items-center">
      {canGoBack && (
        <Button variant="link" size="md" onPress={onBack}>
          <ButtonIcon as={ArrowLeft} size="xl" />
        </Button>
      )}

      <Pressable
        onPress={onPressApp}
        accessibilityRole="button"
        accessibilityLabel="Go to Explore"
        accessibilityHint="Navigate to the explore screen"
      >
        <HStack space="xs" className="items-center">
          <PawPrint size={20} className="text-typography-900" />
          <Text className="text-lg font-bold text-typography-900">
            unleashd
          </Text>
        </HStack>
      </Pressable>
    </HStack>
  );
}
