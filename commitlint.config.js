module.exports = {
  extends: ['@commitlint/config-conventional'],
  defaultIgnores: true,
  ignores: [
    (commit) => {
      // Extract first line (header) from commit message
      const header = commit.split('\n')[0];

      // Ignore GitHub PR merge commits with branch name format (legacy PRs)
      // Examples: "Feature/add-feature (#123)", "Fix/bug-fix (#456)", "Settings Page (#4)"
      if (
        /^(Feature|Fix|Docs|Feat|Chore|Settings)[\s/].+\(#\d+\)$/.test(header)
      ) {
        return true;
      }

      // Ignore GitHub's "Merge pull request #N" commits
      if (/^Merge pull request #\d+/.test(header)) {
        return true;
      }

      // Note: "Merge branch" commits are already ignored by defaultIgnores: true

      return false;
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, no logic change)
        'refactor', // Code refactoring (no feat/fix)
        'perf', // Performance improvements
        'test', // Adding/updating tests
        'build', // Build system/dependencies
        'ci', // CI/CD changes
        'chore', // Other changes (no src/test changes)
        'revert', // Revert previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0], // Allow any case for subject
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
