# Testing Guide

## Overview

This project uses Jest with React Native Testing Library for testing. All tests are located in `__tests__` directories alongside the code they test.

## Running Tests

### Available Commands

```bash
# Run all tests once (recommended for quick checks)
bun run test

# Run tests in watch mode (for active development)
bun run test:watch

# Run tests with coverage report
bun run test:coverage

# Run tests in CI mode (used by GitHub Actions)
bun run test:ci

# Run tests for staged files only (used by git hooks)
bun run test:staged
```

### ⚠️ Important: Don't Use `bun test`

**DO NOT use `bun test` directly** - it uses Bun's native test runner which is incompatible with React Native projects.

❌ **Wrong:**

```bash
bun test  # Uses Bun's test runner - will fail
```

✅ **Correct:**

```bash
bun run test       # Uses Jest via package.json script
npx jest           # Uses Jest directly
```

## Test Structure

### Test Files

- Test files use `.test.ts` or `.test.tsx` extensions
- Located in `__tests__` directories next to source files
- Use descriptive test names that explain what behavior is being tested

### Example Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  it('should do something specific', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

## Common Testing Patterns

### Testing Components

Use `@testing-library/react-native` for component testing:

```typescript
import { render, waitFor } from '@testing-library/react-native';

it('should render correctly', () => {
  const { getByText } = render(<MyComponent />);
  expect(getByText('Hello')).toBeTruthy();
});
```

### Testing with Providers

Use the helper pattern to wrap components with required providers:

```typescript
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <OtherProvider>
        {component}
      </OtherProvider>
    </ThemeProvider>
  );
};

it('should work with providers', () => {
  renderWithProviders(<MyComponent />);
  // assertions...
});
```

### Mocking Dependencies

```typescript
// Mock a module
jest.mock('@/hooks/useAnimals', () => ({
  useAnimalSearch: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

## Test Configuration

### Jest Setup (`jest-setup.ts`)

The project includes custom Jest setup that:

1. **Suppresses cosmetic warnings** - Filters out expected `act()` warnings from:
   - React Native Animated components (Skeleton pulse animations)
   - Async context operations (ThemeProvider AsyncStorage calls)
   - AnimatedHeight error boundary warnings

2. **Configures test environment** - Sets up:
   - React Native Testing Library matchers
   - Mock environment variables
   - Global `__DEV__` flag

### Why Tests Use `--forceExit`

Some test scripts include the `--forceExit` flag. This is necessary because:

- React Native's Animated API creates timers that persist after tests complete
- These timers prevent Jest from exiting cleanly
- `--forceExit` forces Jest to exit after all tests pass
- This is **expected behavior** for React Native projects with animations

The message `"Force exiting Jest"` is **normal and not an error**.

## Test Coverage

### Viewing Coverage

```bash
# Generate coverage report
bun run test:coverage

# Coverage report is saved to coverage/ directory
# Open coverage/lcov-report/index.html in browser for detailed report
```

### Coverage Requirements

Coverage is tracked for:

- All TypeScript/TSX files in `app/`, `components/`, `contexts/`, `hooks/`, `services/`, and `utils/`
- Excludes: config files, type definitions, test files, generated code

Current coverage thresholds (enforced in CI):

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Troubleshooting

### Tests Hang or Don't Exit

**Symptom:** Tests pass but Jest doesn't exit cleanly.

**Solution:** This is expected due to animation timers. The `--forceExit` flag handles this automatically in CI scripts. For local development, you can:

- Use `Ctrl+C` to exit watch mode
- Use `bun run test` (not watch mode) which exits after completion

### "Unhandled error between tests"

**Symptom:** Error about `Unexpected typeof` in `react-native/index.js`.

**Cause:** You're using `bun test` instead of `bun run test`.

**Solution:** Always use `bun run test` or other npm scripts, never `bun test` directly.

### Act() Warnings

**Symptom:** Warnings about updates not wrapped in `act()`.

**Status:** These are already suppressed in `jest-setup.ts` if they're from expected sources (animations, async context operations). If you see new act() warnings, they may indicate a real issue that needs fixing.

### Snapshot Mismatches

**Symptom:** Snapshot tests fail after intentional UI changes.

**Solution:** Update snapshots with:

```bash
npx jest --updateSnapshot
# or in watch mode, press 'u'
```

## Git Hooks

### Pre-commit Hook

Automatically runs:

- ESLint on staged files (auto-fixes when possible)
- Prettier on staged files (auto-formats)
- Tests on staged test files (`test:staged`)

To bypass (not recommended):

```bash
git commit --no-verify
```

### Pre-push Hook

Automatically runs:

- Full test suite with coverage before allowing push
- Blocks push if tests fail or coverage drops

To bypass (not recommended):

```bash
git push --no-verify
```

## Best Practices

1. **Write descriptive test names** - Test names should explain the expected behavior
2. **Test behavior, not implementation** - Focus on what the component does, not how
3. **Keep tests isolated** - Each test should be independent and not rely on others
4. **Use beforeEach for setup** - Reset mocks and state between tests
5. **Mock external dependencies** - Mock APIs, AsyncStorage, navigation, etc.
6. **Test edge cases** - Don't just test the happy path
7. **Maintain high coverage** - Aim for >70% coverage on all metrics

## Writing New Tests

When adding new features, always add corresponding tests:

1. **Unit tests** for utilities and services
2. **Integration tests** for contexts and hooks
3. **Component tests** for UI components
4. **End-to-end tests** for complete user flows

Example test file structure:

```typescript
import { render, waitFor } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  describe('Initialization', () => {
    it('should render with default props', () => {
      // Test initial render
    });
  });

  describe('User Interactions', () => {
    it('should handle button press', () => {
      // Test user interactions
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      // Test error handling
    });
  });
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about/#priority)
- [Jest Expo Preset](https://docs.expo.dev/develop/unit-testing/)
