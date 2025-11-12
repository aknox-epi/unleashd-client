import type { ChangelogEntry, ChangelogSection } from '@/types/whats-new';

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
    console.error('Failed to parse changelog:', error);
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
