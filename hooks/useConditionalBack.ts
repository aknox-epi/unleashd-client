import { useCallback } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface UseConditionalBackReturn {
  canGoBack: boolean;
  goBack: () => Promise<void>;
  goToExplore: () => Promise<void>;
}

/**
 * Hook for conditional back navigation with fallback to explore
 * Returns navigation helpers for handling back button and app name navigation
 */
export function useConditionalBack(): UseConditionalBackReturn {
  const canGoBack = router.canGoBack();

  const goBack = useCallback(async () => {
    if (!canGoBack) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not supported on web
    }

    router.back();
  }, [canGoBack]);

  const goToExplore = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics not supported on web
    }

    router.replace('/tabs/(tabs)/explore');
  }, []);

  return { canGoBack, goBack, goToExplore };
}
