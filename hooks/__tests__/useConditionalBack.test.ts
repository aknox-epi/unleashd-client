import { renderHook, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useConditionalBack } from '../useConditionalBack';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    canGoBack: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('useConditionalBack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canGoBack', () => {
    it('returns true when navigation history exists', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useConditionalBack());

      expect(result.current.canGoBack).toBe(true);
    });

    it('returns false when no navigation history exists', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useConditionalBack());

      expect(result.current.canGoBack).toBe(false);
    });
  });

  describe('goBack', () => {
    it('navigates back when history exists', async () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goBack();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
      expect(router.back).toHaveBeenCalled();
    });

    it('does nothing when no history exists', async () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goBack();
      });

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
    });

    it('handles haptics errors gracefully', async () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(
        new Error('Haptics not supported')
      );

      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goBack();
      });

      // Should still navigate even if haptics fails
      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('goToExplore', () => {
    it('navigates to explore tab with replace', async () => {
      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goToExplore();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
      expect(router.replace).toHaveBeenCalledWith('/tabs/(tabs)/explore');
    });

    it('handles haptics errors gracefully', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(
        new Error('Haptics not supported')
      );

      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goToExplore();
      });

      // Should still navigate even if haptics fails
      expect(router.replace).toHaveBeenCalledWith('/tabs/(tabs)/explore');
    });
  });

  describe('haptics feedback', () => {
    it('uses Light haptics for back navigation', async () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goBack();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('uses Medium haptics for explore navigation', async () => {
      const { result } = renderHook(() => useConditionalBack());

      await act(async () => {
        await result.current.goToExplore();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });
  });
});
