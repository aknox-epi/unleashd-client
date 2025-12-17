/**
 * Tests for changelog parser utilities
 */

import {
  parseLatestChangelog,
  parseAllChangelogs,
  isNewerVersion,
  filterByTimeline,
  filterByTypes,
} from '@/utils/changelog-parser';
import type { ChangelogEntry } from '@/types/whats-new';

describe('changelog-parser', () => {
  describe('parseLatestChangelog', () => {
    it('should parse a valid changelog with single version (old format)', () => {
      const content = `# Changelog

## 0.1.3 (2025-11-12)

### Features

- add settings tab ([abc1234](https://github.com/user/repo/commit/abc1234))

### Bug Fixes

- fix crash on startup ([def5678](https://github.com/user/repo/commit/def5678))
`;

      const result = parseLatestChangelog(content);

      expect(result).not.toBeNull();
      expect(result?.version).toBe('0.1.3');
      expect(result?.date).toBe('2025-11-12');
      expect(result?.sections).toHaveLength(2);
      expect(result?.sections[0].title).toBe('Features');
      expect(result?.sections[0].items).toHaveLength(1);
      expect(result?.sections[0].items[0].text).toBe('add settings tab');
      expect(result?.sections[0].items[0].commitHash).toBe('abc1234');
      expect(result?.sections[1].title).toBe('Bug Fixes');
    });

    it('should parse version with markdown link (new format)', () => {
      const content = `# Changelog

## [0.7.0](https://github.com/user/repo/compare/v0.6.0...v0.7.0) (2025-12-17)

### Features

- implement automatic changelog embedding ([ae0751f](https://github.com/user/repo/commit/ae0751f))

### Bug Fixes

- fix version detection issue ([123abcd](https://github.com/user/repo/commit/123abcd))
`;

      const result = parseLatestChangelog(content);

      expect(result).not.toBeNull();
      expect(result?.version).toBe('0.7.0');
      expect(result?.date).toBe('2025-12-17');
      expect(result?.sections).toHaveLength(2);
      expect(result?.sections[0].title).toBe('Features');
      expect(result?.sections[0].items).toHaveLength(1);
      expect(result?.sections[0].items[0].text).toBe(
        'implement automatic changelog embedding'
      );
      expect(result?.sections[0].items[0].commitHash).toBe('ae0751f');
      expect(result?.sections[1].title).toBe('Bug Fixes');
    });

    it('should parse version with asterisk list markers', () => {
      const content = `# Changelog

## [0.7.0](https://github.com/user/repo/compare/v0.6.0...v0.7.0) (2025-12-17)

### Features

* implement automatic changelog embedding ([ae0751f](https://github.com/user/repo/commit/ae0751f))

### Bug Fixes

* fix version detection issue ([123abcd](https://github.com/user/repo/commit/123abcd))
`;

      const result = parseLatestChangelog(content);

      expect(result).not.toBeNull();
      expect(result?.version).toBe('0.7.0');
      expect(result?.date).toBe('2025-12-17');
      expect(result?.sections).toHaveLength(2);
      expect(result?.sections[0].title).toBe('Features');
      expect(result?.sections[0].items).toHaveLength(1);
      expect(result?.sections[0].items[0].text).toBe(
        'implement automatic changelog embedding'
      );
      expect(result?.sections[0].items[0].commitHash).toBe('ae0751f');
      expect(result?.sections[1].title).toBe('Bug Fixes');
      expect(result?.sections[1].items).toHaveLength(1);
    });

    it('should parse mixed dash and asterisk list markers', () => {
      const content = `# Changelog

## [0.8.0](https://github.com/user/repo/compare/v0.7.0...v0.8.0) (2025-12-18)

### Features

* feature with asterisk ([abc1234](https://github.com/user/repo/commit/abc1234))
- feature with dash ([def5678](https://github.com/user/repo/commit/def5678))
`;

      const result = parseLatestChangelog(content);

      expect(result).not.toBeNull();
      expect(result?.sections).toHaveLength(1);
      expect(result?.sections[0].items).toHaveLength(2);
      expect(result?.sections[0].items[0].text).toBe('feature with asterisk');
      expect(result?.sections[0].items[1].text).toBe('feature with dash');
    });

    it('should extract version number correctly', () => {
      const content = `## 1.2.3 (2025-11-12)

### Features

- test feature
`;

      const result = parseLatestChangelog(content);

      expect(result?.version).toBe('1.2.3');
    });

    it('should extract date correctly', () => {
      const content = `## 0.1.0 (2025-12-25)

### Features

- test feature
`;

      const result = parseLatestChangelog(content);

      expect(result?.date).toBe('2025-12-25');
    });

    it('should parse multiple sections', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

- feature one

### Bug Fixes

- fix one

### Documentation

- doc one

### Build System

- build one
`;

      const result = parseLatestChangelog(content);

      expect(result?.sections).toHaveLength(4);
      expect(result?.sections[0].title).toBe('Features');
      expect(result?.sections[1].title).toBe('Bug Fixes');
      expect(result?.sections[2].title).toBe('Documentation');
      expect(result?.sections[3].title).toBe('Build System');
    });

    it('should parse items with commit hashes and URLs', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

- add feature ([abc1234](https://github.com/user/repo/commit/abc1234))
`;

      const result = parseLatestChangelog(content);

      expect(result?.sections[0].items[0].text).toBe('add feature');
      expect(result?.sections[0].items[0].commitHash).toBe('abc1234');
      expect(result?.sections[0].items[0].commitUrl).toBe(
        'https://github.com/user/repo/commit/abc1234'
      );
    });

    it('should parse items without commit information', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

- add feature without commit
`;

      const result = parseLatestChangelog(content);

      expect(result?.sections[0].items[0].text).toBe(
        'add feature without commit'
      );
      expect(result?.sections[0].items[0].commitHash).toBeUndefined();
      expect(result?.sections[0].items[0].commitUrl).toBeUndefined();
    });

    it('should remove PR references from item text', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

- add feature ([#123](https://github.com/user/repo/pull/123)) ([abc1234](https://github.com/user/repo/commit/abc1234))
`;

      const result = parseLatestChangelog(content);

      expect(result?.sections[0].items[0].text).toBe('add feature');
      expect(result?.sections[0].items[0].commitHash).toBe('abc1234');
    });

    it('should handle changelog with no versions', () => {
      const content = `# Changelog

Some intro text with no versions.
`;

      const result = parseLatestChangelog(content);

      expect(result).toBeNull();
    });

    it('should handle malformed version headers', () => {
      const content = `# Changelog

## Invalid Version Header

### Features

- some feature
`;

      const result = parseLatestChangelog(content);

      expect(result).toBeNull();
    });

    it('should handle empty changelog content', () => {
      const content = '';

      const result = parseLatestChangelog(content);

      expect(result).toBeNull();
    });

    it('should handle sections with no items', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

### Bug Fixes

- fix one
`;

      const result = parseLatestChangelog(content);

      expect(result?.sections).toHaveLength(1);
      expect(result?.sections[0].title).toBe('Bug Fixes');
    });

    it('should parse only the first version when multiple exist', () => {
      const content = `## 0.2.0 (2025-11-15)

### Features

- new feature

## 0.1.0 (2025-11-12)

### Features

- old feature
`;

      const result = parseLatestChangelog(content);

      expect(result?.version).toBe('0.2.0');
      expect(result?.sections[0].items[0].text).toBe('new feature');
    });

    it('should handle multiple items in a section', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

- feature one
- feature two
- feature three
`;

      const result = parseLatestChangelog(content);

      expect(result?.sections[0].items).toHaveLength(3);
      expect(result?.sections[0].items[0].text).toBe('feature one');
      expect(result?.sections[0].items[1].text).toBe('feature two');
      expect(result?.sections[0].items[2].text).toBe('feature three');
    });
  });

  describe('isNewerVersion', () => {
    it('should return true when v2 is newer (major version)', () => {
      expect(isNewerVersion('0.1.0', '1.0.0')).toBe(true);
    });

    it('should return true when v2 is newer (minor version)', () => {
      expect(isNewerVersion('0.1.0', '0.2.0')).toBe(true);
    });

    it('should return true when v2 is newer (patch version)', () => {
      expect(isNewerVersion('0.1.0', '0.1.1')).toBe(true);
    });

    it('should return false when versions are equal', () => {
      expect(isNewerVersion('0.1.0', '0.1.0')).toBe(false);
    });

    it('should return false when v1 is newer (major version)', () => {
      expect(isNewerVersion('2.0.0', '1.0.0')).toBe(false);
    });

    it('should return false when v1 is newer (minor version)', () => {
      expect(isNewerVersion('0.3.0', '0.2.0')).toBe(false);
    });

    it('should return false when v1 is newer (patch version)', () => {
      expect(isNewerVersion('0.1.5', '0.1.2')).toBe(false);
    });

    it('should handle version comparisons correctly', () => {
      expect(isNewerVersion('0.1.2', '0.1.3')).toBe(true);
      expect(isNewerVersion('0.1.3', '0.1.2')).toBe(false);
    });

    it('should handle multi-digit version numbers', () => {
      expect(isNewerVersion('0.9.9', '0.10.0')).toBe(true);
      expect(isNewerVersion('1.99.99', '2.0.0')).toBe(true);
    });
  });

  describe('parseAllChangelogs', () => {
    it('should parse multiple version entries (old format)', () => {
      const content = `## 0.2.0 (2025-11-15)

### Features

- feature two

## 0.1.0 (2025-11-12)

### Features

- feature one
`;

      const result = parseAllChangelogs(content);

      expect(result).toHaveLength(2);
      expect(result[0].version).toBe('0.2.0');
      expect(result[1].version).toBe('0.1.0');
    });

    it('should parse mixed format versions (new and old)', () => {
      const content = `## [0.7.0](https://github.com/user/repo/compare/v0.6.0...v0.7.0) (2025-12-17)

### Features

- new format feature

## [0.6.0](https://github.com/user/repo/compare/v0.5.0...v0.6.0) (2025-12-15)

### Features

- another new format

## 0.2.0 (2025-11-15)

### Features

- old format feature

## 0.1.0 (2025-11-12)

### Features

- another old format
`;

      const result = parseAllChangelogs(content);

      expect(result).toHaveLength(4);
      expect(result[0].version).toBe('0.7.0');
      expect(result[0].date).toBe('2025-12-17');
      expect(result[1].version).toBe('0.6.0');
      expect(result[1].date).toBe('2025-12-15');
      expect(result[2].version).toBe('0.2.0');
      expect(result[2].date).toBe('2025-11-15');
      expect(result[3].version).toBe('0.1.0');
      expect(result[3].date).toBe('2025-11-12');
    });

    it('should parse versions with asterisk list markers', () => {
      const content = `## [0.8.0](https://github.com/user/repo/compare/v0.7.0...v0.8.0) (2025-12-18)

### Features

* feature with asterisk
* another asterisk feature

## [0.7.0](https://github.com/user/repo/compare/v0.6.0...v0.7.0) (2025-12-17)

### Features

* implement automatic changelog embedding

### Bug Fixes

* fix version detection

## [0.6.0](https://github.com/user/repo/compare/v0.5.0...v0.6.0) (2025-12-15)

### Features

- feature with dash
`;

      const result = parseAllChangelogs(content);

      expect(result).toHaveLength(3);
      expect(result[0].version).toBe('0.8.0');
      expect(result[0].sections[0].items).toHaveLength(2);
      expect(result[1].version).toBe('0.7.0');
      expect(result[1].sections).toHaveLength(2);
      expect(result[1].sections[0].items[0].text).toBe(
        'implement automatic changelog embedding'
      );
      expect(result[2].version).toBe('0.6.0');
      expect(result[2].sections[0].items[0].text).toBe('feature with dash');
    });

    it('should return entries in correct order', () => {
      const content = `## 0.3.0 (2025-11-20)

### Features

- three

## 0.2.0 (2025-11-15)

### Features

- two

## 0.1.0 (2025-11-12)

### Features

- one
`;

      const result = parseAllChangelogs(content);

      expect(result).toHaveLength(3);
      expect(result[0].version).toBe('0.3.0');
      expect(result[1].version).toBe('0.2.0');
      expect(result[2].version).toBe('0.1.0');
    });

    it('should parse each version sections correctly', () => {
      const content = `## 0.2.0 (2025-11-15)

### Features

- new feature

### Bug Fixes

- fix issue

## 0.1.0 (2025-11-12)

### Documentation

- add docs
`;

      const result = parseAllChangelogs(content);

      expect(result[0].sections).toHaveLength(2);
      expect(result[0].sections[0].title).toBe('Features');
      expect(result[0].sections[1].title).toBe('Bug Fixes');
      expect(result[1].sections).toHaveLength(1);
      expect(result[1].sections[0].title).toBe('Documentation');
    });

    it('should handle changelog with single version', () => {
      const content = `## 0.1.0 (2025-11-12)

### Features

- single version
`;

      const result = parseAllChangelogs(content);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('0.1.0');
    });

    it('should return empty array for invalid content', () => {
      const content = 'Invalid content with no versions';

      const result = parseAllChangelogs(content);

      expect(result).toEqual([]);
    });

    it('should skip versions with no sections', () => {
      const content = `## 0.2.0 (2025-11-15)

## 0.1.0 (2025-11-12)

### Features

- has content
`;

      const result = parseAllChangelogs(content);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('0.1.0');
    });

    it('should handle empty content', () => {
      const content = '';

      const result = parseAllChangelogs(content);

      expect(result).toEqual([]);
    });
  });

  describe('filterByTimeline', () => {
    const mockEntries: ChangelogEntry[] = [
      {
        version: '0.3.0',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 2 days ago
        sections: [{ title: 'Features', items: [{ text: 'feature 3' }] }],
      },
      {
        version: '0.2.0',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 15 days ago
        sections: [{ title: 'Features', items: [{ text: 'feature 2' }] }],
      },
      {
        version: '0.1.0',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 60 days ago
        sections: [{ title: 'Features', items: [{ text: 'feature 1' }] }],
      },
    ];

    it('should return only latest entry when timeline is latest', () => {
      const result = filterByTimeline(mockEntries, 'latest');

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('0.3.0');
    });

    it('should return all entries when timeline is all', () => {
      const result = filterByTimeline(mockEntries, 'all');

      expect(result).toHaveLength(3);
    });

    it('should filter by last 7 days', () => {
      const result = filterByTimeline(mockEntries, 'last7days');

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('0.3.0');
    });

    it('should filter by last 30 days', () => {
      const result = filterByTimeline(mockEntries, 'last30days');

      expect(result).toHaveLength(2);
      expect(result[0].version).toBe('0.3.0');
      expect(result[1].version).toBe('0.2.0');
    });

    it('should filter by last 3 months', () => {
      const result = filterByTimeline(mockEntries, 'last3months');

      expect(result).toHaveLength(3);
    });

    it('should handle entries with dates outside range', () => {
      const oldEntries: ChangelogEntry[] = [
        {
          version: '0.1.0',
          date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 1 year ago
          sections: [{ title: 'Features', items: [{ text: 'old feature' }] }],
        },
      ];

      const result = filterByTimeline(oldEntries, 'last7days');

      expect(result).toHaveLength(0);
    });

    it('should handle empty entries array', () => {
      const result = filterByTimeline([], 'last7days');

      expect(result).toEqual([]);
    });

    it('should handle entries at boundary of time range', () => {
      // Create a date 5 days ago to safely test boundary behavior
      // Note: Using 6.5 days can fail due to time-of-day differences when date
      // strings are parsed back as midnight UTC
      const boundaryEntry: ChangelogEntry[] = [
        {
          version: '0.1.0',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          sections: [
            { title: 'Features', items: [{ text: 'boundary feature' }] },
          ],
        },
      ];

      const result = filterByTimeline(boundaryEntry, 'last7days');

      // Should include entries within the time range
      expect(result).toHaveLength(1);
    });
  });

  describe('filterByTypes', () => {
    const mockEntries: ChangelogEntry[] = [
      {
        version: '0.2.0',
        date: '2025-11-15',
        sections: [
          { title: 'Features', items: [{ text: 'feature 1' }] },
          { title: 'Bug Fixes', items: [{ text: 'fix 1' }] },
          { title: 'Documentation', items: [{ text: 'doc 1' }] },
        ],
      },
      {
        version: '0.1.0',
        date: '2025-11-12',
        sections: [
          { title: 'Features', items: [{ text: 'feature 2' }] },
          { title: 'Build System', items: [{ text: 'build 1' }] },
        ],
      },
    ];

    it('should return all entries when types array is empty', () => {
      const result = filterByTypes(mockEntries, []);

      expect(result).toHaveLength(2);
      expect(result[0].sections).toHaveLength(3);
      expect(result[1].sections).toHaveLength(2);
    });

    it('should filter sections by selected types', () => {
      const result = filterByTypes(mockEntries, ['Features']);

      expect(result).toHaveLength(2);
      expect(result[0].sections).toHaveLength(1);
      expect(result[0].sections[0].title).toBe('Features');
      expect(result[1].sections).toHaveLength(1);
      expect(result[1].sections[0].title).toBe('Features');
    });

    it('should remove entries with no matching sections', () => {
      const result = filterByTypes(mockEntries, ['Documentation']);

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('0.2.0');
      expect(result[0].sections[0].title).toBe('Documentation');
    });

    it('should preserve entries with at least one matching section', () => {
      const result = filterByTypes(mockEntries, ['Features', 'Bug Fixes']);

      expect(result).toHaveLength(2);
      expect(result[0].sections).toHaveLength(2);
      expect(result[1].sections).toHaveLength(1);
    });

    it('should handle multiple selected types', () => {
      const result = filterByTypes(mockEntries, [
        'Features',
        'Documentation',
        'Build System',
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].sections.map((s) => s.title)).toEqual([
        'Features',
        'Documentation',
      ]);
      expect(result[1].sections.map((s) => s.title)).toEqual([
        'Features',
        'Build System',
      ]);
    });

    it('should handle empty entries array', () => {
      const result = filterByTypes([], ['Features']);

      expect(result).toEqual([]);
    });

    it('should maintain entry structure after filtering', () => {
      const result = filterByTypes(mockEntries, ['Features']);

      expect(result[0]).toHaveProperty('version');
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('sections');
      expect(result[0].sections[0]).toHaveProperty('title');
      expect(result[0].sections[0]).toHaveProperty('items');
    });

    it('should handle type that does not exist in any entry', () => {
      const result = filterByTypes(mockEntries, ['Nonexistent Type']);

      expect(result).toEqual([]);
    });
  });
});
