/**
 * Types for the What's New / Changelog notification feature
 */

/**
 * Represents a single changelog entry parsed from CHANGELOG.md
 */
export interface ChangelogEntry {
  version: string;
  date: string;
  sections: ChangelogSection[];
}

/**
 * Represents a changelog item with optional commit link
 */
export interface ChangelogItem {
  text: string;
  commitHash?: string;
  commitUrl?: string;
}

/**
 * A section within a changelog entry (e.g., Features, Bug Fixes)
 */
export interface ChangelogSection {
  title: string;
  items: ChangelogItem[];
}

/**
 * User preferences for What's New feature
 */
export interface WhatsNewPreferences {
  enabled: boolean;
  lastSeenVersion: string | null;
}

/**
 * Timeline filter options for filtering changelog entries
 */
export type TimelineFilter =
  | 'latest'
  | 'last7days'
  | 'last30days'
  | 'last3months'
  | 'all';

/**
 * Filters for changelog display
 */
export interface ChangelogFilters {
  timeline: TimelineFilter;
  types: string[]; // Selected section types (e.g., ['Features', 'Bug Fixes'])
}

/**
 * Context state for What's New feature
 */
export interface WhatsNewContextState {
  isEnabled: boolean;
  hasNewVersion: boolean;
  currentVersion: string;
  lastSeenVersion: string | null;
  latestChangelog: ChangelogEntry | null;
  allChangelogs: ChangelogEntry[];
  filters: ChangelogFilters;
  filteredChangelogs: ChangelogEntry[];
  isDrawerOpen: boolean;
  toggleEnabled: () => Promise<void>;
  markVersionAsSeen: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  setFilters: (filters: ChangelogFilters) => void;
}
