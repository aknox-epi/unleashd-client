module.exports = {
  extends: ['@commitlint/config-conventional'],
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
