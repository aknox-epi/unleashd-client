/**
 * Tests for WhatsNewContext provider and hooks
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WhatsNewProvider, useWhatsNew } from '@/contexts/WhatsNewContext';
import type { ChangelogFilters } from '@/types/whats-new';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('WhatsNewContext', () => {
  const mockChangelogContent = `# Changelog

## 0.2.0 (2025-11-15)

### Features

- add settings tab ([abc1234](https://github.com/user/repo/commit/abc1234))
- add dark mode

### Bug Fixes

- fix crash on startup

## 0.1.0 (2025-11-12)

### Features

- initial release
`;

  const currentVersion = '0.2.0';

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  const createWrapper = (
    changelog: string = mockChangelogContent,
    version: string = currentVersion
  ) => {
    return ({ children }: { children: React.ReactNode }) => (
      <WhatsNewProvider changelogContent={changelog} currentVersion={version}>
        {children}
      </WhatsNewProvider>
    );
  };

  describe('useWhatsNew hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useWhatsNew());
      }).toThrow('useWhatsNew must be used within a WhatsNewProvider');

      consoleError.mockRestore();
    });

    it('should provide context when used inside provider', () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
      expect(result.current.currentVersion).toBe('0.2.0');
    });
  });

  describe('initialization', () => {
    it('should initialize with default preferences when no stored data', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.lastSeenVersion).toBeNull();
      });
    });

    it('should load stored preferences from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          lastSeenVersion: '0.1.0',
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.lastSeenVersion).toBe('0.1.0');
      });
    });

    it('should handle AsyncStorage read errors gracefully', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
      });

      consoleError.mockRestore();
    });

    it('should parse changelog content on mount', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.latestChangelog).not.toBeNull();
        expect(result.current.latestChangelog?.version).toBe('0.2.0');
        expect(result.current.allChangelogs).toHaveLength(2);
      });
    });

    it('should handle empty changelog content', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(''),
      });

      await waitFor(() => {
        expect(result.current.latestChangelog).toBeNull();
        expect(result.current.allChangelogs).toEqual([]);
      });
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle enabled state from true to false (default enabled)', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
      });

      await act(async () => {
        await result.current.toggleEnabled();
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(false);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:whats-new:preferences',
        JSON.stringify({ enabled: false, lastSeenVersion: null })
      );
    });

    it('should toggle enabled state from false to true (when manually disabled)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: false,
          lastSeenVersion: '0.1.0',
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(false);
      });

      await act(async () => {
        await result.current.toggleEnabled();
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
      });
    });

    it('should handle AsyncStorage write errors', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Write error'));

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.toggleEnabled();
      });

      // State should not change if save fails (should remain at default: true)
      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
      });

      consoleError.mockRestore();
    });
  });

  describe('markVersionAsSeen', () => {
    it('should update lastSeenVersion to current version', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.markVersionAsSeen();
      });

      await waitFor(() => {
        expect(result.current.lastSeenVersion).toBe('0.2.0');
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@unleashd:whats-new:preferences',
        JSON.stringify({ enabled: true, lastSeenVersion: '0.2.0' })
      );
    });

    it('should close drawer when marking version as seen', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.openDrawer();
      });

      await waitFor(() => {
        expect(result.current.isDrawerOpen).toBe(true);
      });

      await act(async () => {
        await result.current.markVersionAsSeen();
      });

      await waitFor(() => {
        expect(result.current.isDrawerOpen).toBe(false);
      });
    });

    it('should preserve enabled state when marking version', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          lastSeenVersion: null,
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
      });

      await act(async () => {
        await result.current.markVersionAsSeen();
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.lastSeenVersion).toBe('0.2.0');
      });
    });
  });

  describe('drawer state management', () => {
    it('should start with drawer closed', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isDrawerOpen).toBe(false);
      });
    });

    it('should open drawer when openDrawer is called', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.openDrawer();
      });

      await waitFor(() => {
        expect(result.current.isDrawerOpen).toBe(true);
      });
    });

    it('should close drawer when closeDrawer is called', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.openDrawer();
      });

      await waitFor(() => {
        expect(result.current.isDrawerOpen).toBe(true);
      });

      act(() => {
        result.current.closeDrawer();
      });

      await waitFor(() => {
        expect(result.current.isDrawerOpen).toBe(false);
      });
    });
  });

  describe('hasNewVersion', () => {
    it('should be false when feature is disabled', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: false,
          lastSeenVersion: null,
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(false);
        expect(result.current.hasNewVersion).toBe(false);
      });
    });

    it('should be true when enabled and lastSeenVersion is null', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          lastSeenVersion: null,
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.hasNewVersion).toBe(true);
      });
    });

    it('should be true when enabled and current version is newer', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          lastSeenVersion: '0.1.0',
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(mockChangelogContent, '0.2.0'),
      });

      await waitFor(() => {
        expect(result.current.hasNewVersion).toBe(true);
      });
    });

    it('should be false when enabled and versions are equal', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          lastSeenVersion: '0.2.0',
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(mockChangelogContent, '0.2.0'),
      });

      await waitFor(() => {
        expect(result.current.hasNewVersion).toBe(false);
      });
    });

    it('should be false when enabled but current version is older', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          enabled: true,
          lastSeenVersion: '0.2.0',
        })
      );

      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(mockChangelogContent, '0.1.0'),
      });

      await waitFor(() => {
        expect(result.current.hasNewVersion).toBe(false);
      });
    });
  });

  describe('filtering', () => {
    it('should initialize with default filters', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.filters).toEqual({
          timeline: 'latest',
          types: [],
        });
      });
    });

    it('should update filters when setFilters is called', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      const newFilters: ChangelogFilters = {
        timeline: 'all',
        types: ['Features'],
      };

      act(() => {
        result.current.setFilters(newFilters);
      });

      await waitFor(() => {
        expect(result.current.filters).toEqual(newFilters);
      });
    });

    it('should filter changelogs by timeline', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.allChangelogs).toHaveLength(2);
      });

      // Default is 'latest', should return 1 entry
      await waitFor(() => {
        expect(result.current.filteredChangelogs).toHaveLength(1);
        expect(result.current.filteredChangelogs[0].version).toBe('0.2.0');
      });

      // Change to 'all', should return all entries
      act(() => {
        result.current.setFilters({ timeline: 'all', types: [] });
      });

      await waitFor(() => {
        expect(result.current.filteredChangelogs).toHaveLength(2);
      });
    });

    it('should filter changelogs by types', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.allChangelogs).toHaveLength(2);
      });

      // Filter to only Features sections
      act(() => {
        result.current.setFilters({ timeline: 'all', types: ['Features'] });
      });

      await waitFor(() => {
        expect(result.current.filteredChangelogs).toHaveLength(2);
        // Each entry should only have Features section
        result.current.filteredChangelogs.forEach((entry) => {
          entry.sections.forEach((section) => {
            expect(section.title).toBe('Features');
          });
        });
      });
    });

    it('should apply both timeline and type filters', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.allChangelogs).toHaveLength(2);
      });

      // Apply both filters
      act(() => {
        result.current.setFilters({
          timeline: 'latest',
          types: ['Bug Fixes'],
        });
      });

      await waitFor(() => {
        expect(result.current.filteredChangelogs).toHaveLength(1);
        expect(result.current.filteredChangelogs[0].version).toBe('0.2.0');
        expect(result.current.filteredChangelogs[0].sections).toHaveLength(1);
        expect(result.current.filteredChangelogs[0].sections[0].title).toBe(
          'Bug Fixes'
        );
      });
    });

    it('should return empty array when filters match no entries', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.allChangelogs).toHaveLength(2);
      });

      // Filter by type that doesn't exist in latest version
      act(() => {
        result.current.setFilters({
          timeline: 'latest',
          types: ['Documentation'],
        });
      });

      await waitFor(() => {
        expect(result.current.filteredChangelogs).toEqual([]);
      });
    });
  });

  describe('changelog parsing', () => {
    it('should parse different changelog content in separate instances', async () => {
      // Test first instance with original changelog
      const { result: result1 } = renderHook(() => useWhatsNew(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <WhatsNewProvider
            changelogContent={mockChangelogContent}
            currentVersion="0.2.0"
          >
            {children}
          </WhatsNewProvider>
        ),
      });

      await waitFor(() => {
        expect(result1.current.latestChangelog?.version).toBe('0.2.0');
        expect(result1.current.allChangelogs).toHaveLength(2);
      });

      // Test second instance with new changelog
      const newChangelog = `## 0.3.0 (2025-11-20)

### Features

- new feature
`;

      const { result: result2 } = renderHook(() => useWhatsNew(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <WhatsNewProvider
            changelogContent={newChangelog}
            currentVersion="0.3.0"
          >
            {children}
          </WhatsNewProvider>
        ),
      });

      await waitFor(() => {
        expect(result2.current.latestChangelog?.version).toBe('0.3.0');
        expect(result2.current.allChangelogs).toHaveLength(1);
      });
    });

    it('should parse latest changelog with all sections', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.latestChangelog).not.toBeNull();
        expect(result.current.latestChangelog?.sections).toHaveLength(2);
        expect(result.current.latestChangelog?.sections[0].title).toBe(
          'Features'
        );
        expect(result.current.latestChangelog?.sections[1].title).toBe(
          'Bug Fixes'
        );
      });
    });

    it('should provide currentVersion from props', async () => {
      const { result } = renderHook(() => useWhatsNew(), {
        wrapper: createWrapper(mockChangelogContent, '1.0.0'),
      });

      await waitFor(() => {
        expect(result.current.currentVersion).toBe('1.0.0');
      });
    });
  });
});
