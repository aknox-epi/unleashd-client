import type {
  ChangelogEntry,
  ChangelogSection,
  TimelineFilter,
} from '@/types/whats-new';
import { logger } from '@/utils/logger';

/**
 * Parse CHANGELOG.md content and extract the most recent version entry
 * @param changelogContent - Raw content from CHANGELOG.md
 * @returns The latest changelog entry or null if parsing fails
 */
export function parseLatestChangelog(
  changelogContent: string
): ChangelogEntry | null {
  try {
    // Split into lines for processing
    const lines = changelogContent.split('\n');

    // Find the first version heading (e.g., "## 0.1.3 (2025-11-12)")
    let versionLineIndex = -1;
    let version = '';
    let date = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const versionMatch = line.match(/^##\s+(\d+\.\d+\.\d+)\s+\(([^)]+)\)/);
      if (versionMatch) {
        versionLineIndex = i;
        version = versionMatch[1];
        date = versionMatch[2];
        break;
      }
    }

    if (versionLineIndex === -1) {
      return null;
    }

    // Find the next version heading or end of file
    let endIndex = lines.length;
    for (let i = versionLineIndex + 1; i < lines.length; i++) {
      if (lines[i].trim().match(/^##\s+\d+\.\d+\.\d+/)) {
        endIndex = i;
        break;
      }
    }

    // Extract the content for this version
    const versionLines = lines.slice(versionLineIndex + 1, endIndex);

    // Parse sections (Features, Bug Fixes, Documentation, etc.)
    const sections: ChangelogSection[] = [];
    let currentSection: ChangelogSection | null = null;

    for (const line of versionLines) {
      const trimmedLine = line.trim();

      // Check for section heading (e.g., "### Features")
      const sectionMatch = trimmedLine.match(/^###\s+(.+)$/);
      if (sectionMatch) {
        // Save previous section if it exists
        if (currentSection && currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          title: sectionMatch[1],
          items: [],
        };
        continue;
      }

      // Check for list item (e.g., "- add settings tab...")
      const itemMatch = trimmedLine.match(/^-\s+(.+)$/);
      if (itemMatch && currentSection) {
        let itemText = itemMatch[1];
        let commitHash: string | undefined;
        let commitUrl: string | undefined;

        // Extract commit hash and URL from format: ([hash](url))
        const commitMatch = itemText.match(
          /\s*\(\[([a-f0-9]{7})\]\(([^)]+)\)\)$/i
        );
        if (commitMatch) {
          commitHash = commitMatch[1];
          commitUrl = commitMatch[2];
          // Remove the commit link from the text
          itemText = itemText.replace(
            /\s*\(\[([a-f0-9]{7})\]\([^)]+\)\)$/i,
            ''
          );
        }

        // Remove PR references like ([#123](...))
        itemText = itemText.replace(/\s*\(\[#\d+\]\([^)]+\)\)\s*/i, '');

        currentSection.items.push({
          text: itemText.trim(),
          commitHash,
          commitUrl,
        });
      }
    }

    // Don't forget to add the last section
    if (currentSection && currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    return {
      version,
      date,
      sections,
    };
  } catch (error) {
    logger.error('Failed to parse changelog:', error);
    return null;
  }
}

/**
 * Compare two semantic versions
 * @param v1 - First version (e.g., "0.1.2")
 * @param v2 - Second version (e.g., "0.1.3")
 * @returns true if v1 < v2
 */
export function isNewerVersion(v1: string, v2: string): boolean {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] < parts2[i]) return true;
    if (parts1[i] > parts2[i]) return false;
  }

  return false; // versions are equal
}

/**
 * Parse CHANGELOG.md content and extract all version entries
 * @param changelogContent - Raw content from CHANGELOG.md
 * @returns Array of all changelog entries or empty array if parsing fails
 */
export function parseAllChangelogs(changelogContent: string): ChangelogEntry[] {
  try {
    const lines = changelogContent.split('\n');
    const entries: ChangelogEntry[] = [];

    // Find all version headings
    const versionIndices: Array<{
      index: number;
      version: string;
      date: string;
    }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const versionMatch = line.match(/^##\s+(\d+\.\d+\.\d+)\s+\(([^)]+)\)/);
      if (versionMatch) {
        versionIndices.push({
          index: i,
          version: versionMatch[1],
          date: versionMatch[2],
        });
      }
    }

    // Parse each version section
    for (let i = 0; i < versionIndices.length; i++) {
      const { index, version, date } = versionIndices[i];
      const nextIndex =
        i < versionIndices.length - 1
          ? versionIndices[i + 1].index
          : lines.length;

      // Extract content for this version
      const versionLines = lines.slice(index + 1, nextIndex);

      // Parse sections
      const sections: ChangelogSection[] = [];
      let currentSection: ChangelogSection | null = null;

      for (const line of versionLines) {
        const trimmedLine = line.trim();

        // Check for section heading (e.g., "### Features")
        const sectionMatch = trimmedLine.match(/^###\s+(.+)$/);
        if (sectionMatch) {
          if (currentSection && currentSection.items.length > 0) {
            sections.push(currentSection);
          }
          currentSection = {
            title: sectionMatch[1],
            items: [],
          };
          continue;
        }

        // Check for list item (e.g., "- add settings tab...")
        const itemMatch = trimmedLine.match(/^-\s+(.+)$/);
        if (itemMatch && currentSection) {
          let itemText = itemMatch[1];
          let commitHash: string | undefined;
          let commitUrl: string | undefined;

          // Extract commit hash and URL from format: ([hash](url))
          const commitMatch = itemText.match(
            /\s*\(\[([a-f0-9]{7})\]\(([^)]+)\)\)$/i
          );
          if (commitMatch) {
            commitHash = commitMatch[1];
            commitUrl = commitMatch[2];
            itemText = itemText.replace(
              /\s*\(\[([a-f0-9]{7})\]\([^)]+\)\)$/i,
              ''
            );
          }

          // Remove PR references like ([#123](...))
          itemText = itemText.replace(/\s*\(\[#\d+\]\([^)]+\)\)\s*/i, '');

          currentSection.items.push({
            text: itemText.trim(),
            commitHash,
            commitUrl,
          });
        }
      }

      // Add last section
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }

      // Only add entries that have sections
      if (sections.length > 0) {
        entries.push({
          version,
          date,
          sections,
        });
      }
    }

    return entries;
  } catch (error) {
    logger.error('Failed to parse all changelogs:', error);
    return [];
  }
}

/**
 * Filter changelog entries by date range
 * @param entries - All changelog entries
 * @param timeline - Timeline filter to apply
 * @returns Filtered changelog entries
 */
export function filterByTimeline(
  entries: ChangelogEntry[],
  timeline: TimelineFilter
): ChangelogEntry[] {
  if (timeline === 'latest') {
    return entries.slice(0, 1);
  }

  if (timeline === 'all') {
    return entries;
  }

  const now = new Date();
  let cutoffDate: Date;

  switch (timeline) {
    case 'last7days':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last30days':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'last3months':
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return entries;
  }

  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
}

/**
 * Filter changelog entries by section types
 * @param entries - Changelog entries
 * @param types - Selected section types to include (empty = all types)
 * @returns Filtered changelog entries with only selected types
 */
export function filterByTypes(
  entries: ChangelogEntry[],
  types: string[]
): ChangelogEntry[] {
  // If no types selected, show all
  if (types.length === 0) {
    return entries;
  }

  return entries
    .map((entry) => ({
      ...entry,
      sections: entry.sections.filter((section) =>
        types.includes(section.title)
      ),
    }))
    .filter((entry) => entry.sections.length > 0); // Remove entries with no matching sections
}
