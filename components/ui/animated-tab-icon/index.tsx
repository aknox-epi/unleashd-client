import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/icon';
import { Sparkles } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface AnimatedTabIconProps {
  /**
   * The base icon to display (e.g., Settings, Cog)
   */
  icon: LucideIcon;
  /**
   * Icon color
   */
  color: string;
  /**
   * Whether to show the animated sparkle badge
   */
  showBadge?: boolean;
}

/**
 * Tab icon with optional animated sparkle badge
 * Used for the Settings tab to indicate new changelog content
 */
export function AnimatedTabIcon({
  icon: IconComponent,
  color,
  showBadge = false,
}: AnimatedTabIconProps) {
  // Animated values for pulse effect
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Start animation when badge is shown
  useEffect(() => {
    if (showBadge) {
      // Pulse animation: scale 0.8 → 1.2 → 0.8, opacity 0.6 → 1.0 → 0.6
      // Duration: 2 seconds per cycle
      scale.value = withRepeat(
        withSequence(
          withTiming(0.8, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, {
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        false
      );
    } else {
      // Reset to default values
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [showBadge, scale, opacity]);

  // Animated style for the sparkle badge
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Base icon */}
      <Icon as={IconComponent} size="xl" color={color} />

      {/* Animated sparkle badge (top-right corner) */}
      {showBadge && (
        <Animated.View
          style={[styles.badge, animatedStyle]}
          pointerEvents="none"
        >
          <Icon as={Sparkles} size="sm" color="#FFD700" />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'transparent',
  },
});
