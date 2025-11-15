# unleashd-client

[![Netlify Status](https://api.netlify.com/api/v1/badges/723a45cd-d0d6-4355-9ae6-5a634ffc37a6/deploy-status)](https://app.netlify.com/projects/unleashd-epi/deploys)

A cross-platform mobile application built with React Native, Expo, and TypeScript. Features a modern UI powered by GlueStack UI and NativeWind (Tailwind CSS for React Native).

## Features

- 📱 **Cross-Platform** - Runs on iOS, Android, and Web
- ⚡ **Expo Router** - File-based routing with typed routes
- 🎨 **Modern UI** - GlueStack UI components with NativeWind/Tailwind styling
- 🔒 **Type-Safe** - Full TypeScript support with strict mode
- ✨ **Code Quality** - ESLint + Prettier with pre-commit hooks
- 🧪 **Testing** - Jest configured with Expo preset
- 📦 **Fast Runtime** - Powered by Bun package manager
- 🔄 **CI/CD** - GitHub Actions workflow for automated testing and builds
- 📝 **Conventional Commits** - Enforced commit message standards
- 🚀 **Automated Releases** - Changelog generation with semantic versioning

## Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **UI Library:** [GlueStack UI](https://gluestack.io/) + [NativeWind](https://www.nativewind.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [Bun](https://bun.sh/)
- **Testing:** [Jest](https://jestjs.io/) + [React Test Renderer](https://reactjs.org/docs/test-renderer.html)
- **Linting:** [ESLint](https://eslint.org/)
- **Formatting:** [Prettier](https://prettier.io/)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- **Versioning:** [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version)

## RescueGroups API Integration

This app integrates with the [RescueGroups.org API](https://userguide.rescuegroups.org/display/APIDG/API+Developers+Guide+Home) to fetch animal data for adoption.

### Environment Setup

1. **Get API Key:** Sign up at [RescueGroups.org](https://rescuegroups.org/) and obtain an API key

2. **Configure Environment:**

   ```bash
   # Copy the example file
   cp .env.example .env

   # Edit .env and add your API key
   EXPO_PUBLIC_RESCUEGROUPS_API_KEY=your_api_key_here
   ```

3. **Validation:** The API key is validated at build time and runtime:
   - **Build-time:** `prebuild` script checks if key is configured
   - **Runtime:** Service gracefully handles missing/invalid keys with user-friendly messages

### Error Handling

The RescueGroups service implements comprehensive error handling with environment-aware messaging:

#### Error Types

- **`ServiceConfigError`**: Configuration issues (missing/invalid API key)
  - Development: Shows technical details and setup instructions
  - Production: Shows user-friendly message to contact support
- **`RescueGroupsAPIError`**: API errors (network, rate limits, validation)
  - Includes status code, error messages, and validation details
  - Automatically parsed from API responses

#### Service Status

The service tracks three states via `ServiceStatus` enum:

- **`CONFIGURED`**: API key valid and service operational
- **`NOT_CONFIGURED`**: No API key provided
- **`ERROR`**: Configuration or connection error

#### Usage Example

```typescript
import {
  useRescueGroupsContext,
  ServiceStatus,
  isServiceConfigError,
} from '@/contexts/RescueGroupsContext';

function MyComponent() {
  const { serviceStatus, checkServiceHealth, error } =
    useRescueGroupsContext();

  // Check service status
  useEffect(() => {
    if (serviceStatus === ServiceStatus.NOT_CONFIGURED) {
      console.warn('RescueGroups API not configured');
    }
  }, [serviceStatus]);

  // Handle errors
  useEffect(() => {
    if (error) {
      if (isServiceConfigError(error)) {
        // Show setup instructions in dev, contact support in prod
        console.error('Configuration error:', error.message);
      } else {
        // Handle API errors
        console.error('API error:', error.message);
      }
    }
  }, [error]);

  // Manual health check (forces fresh status check)
  const handleRefresh = async () => {
    await checkServiceHealth(true);
  };

  return <YourComponent />;
}
```

#### Helper Functions

```typescript
import {
  getErrorMessage,
  isServiceConfigError,
  isRescueGroupsAPIError,
} from '@/services/rescuegroups';

// Get environment-aware error message
const message = getErrorMessage(error);

// Type guards
if (isServiceConfigError(error)) {
  // Handle configuration errors
}
if (isRescueGroupsAPIError(error)) {
  // Handle API errors (status code, validation, etc.)
}
```

### Health Checking

The `RescueGroupsContext` automatically checks service health on mount and caches the status for 60 seconds to reduce API calls:

```typescript
const { serviceStatus, checkServiceHealth } = useRescueGroupsContext();

// Status is automatically checked on mount
// Cached for 60 seconds

// Force fresh check (bypasses cache)
await checkServiceHealth(true);
```

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Bun** (v1.0 or higher) - [Installation guide](https://bun.sh/docs/installation)
- **iOS:** Xcode (for iOS development)
- **Android:** Android Studio + Android SDK (for Android development)
- **Expo CLI** (installed automatically with the project)
- **RescueGroups API Key** (optional but recommended) - [Sign up](https://rescuegroups.org/)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/unleashd-client.git
cd unleashd-client

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run start

# Start on specific platforms
bun run ios       # iOS simulator
bun run android   # Android emulator
bun run web       # Web browser
```

Scan the QR code with Expo Go (Android) or Camera app (iOS) to run on a physical device.

## Available Scripts

### Development

- `bun run start` - Start Expo development server
- `bun run ios` - Start on iOS simulator
- `bun run android` - Start on Android emulator
- `bun run web` - Start in web browser

### Testing

- `bun run test` - Run tests in watch mode
- `jest` - Run tests once
- `jest --coverage` - Run tests with coverage report
- `bun run test:staged` - Run tests for staged files (used by pre-commit hook)

#### Test Automation

Tests run automatically via Git hooks:

- **Pre-commit:** Runs tests on staged test files for fast feedback
- **Pre-push:** Runs full test suite with coverage to ensure quality

Coverage reports are generated in `coverage/` (git-ignored). View by opening `coverage/lcov-report/index.html`.

**Coverage Standards:**

- API integrations: 99%+ coverage required
- Critical services: 95%+ coverage recommended

### Code Quality

- `bun run lint` - Check for linting errors
- `bun run lint:fix` - Auto-fix linting errors
- `bun run format` - Format all files with Prettier
- `bun run format:check` - Check formatting without changes

### Build

- `bun run build` - Export web platform to `dist/` directory
- `bun run build:preview` - Preview web build locally

### Release

Releases use a dedicated release branch workflow:

- `bun run release` - Auto-detect version bump and generate changelog
- `bun run release:major` - Force major version bump (breaking changes)
- `bun run release:minor` - Force minor version bump (new features)
- `bun run release:patch` - Force patch version bump (bug fixes)
- `bun run release:dry` - Preview release without making changes

Release branches merge to `dev` first, then `dev` merges to `main` for production. Always use "Create a merge commit" (not squash merge) to preserve commit history.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed release workflow.

## Project Structure

```
unleashd-client/
├── app/                    # Expo Router pages (file-based routing)
│   ├── tabs/              # Tab navigation
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── components/            # Reusable components
│   └── ui/               # GlueStack UI components
├── assets/               # Images, fonts, icons
├── constants/            # App constants (colors, etc.)
├── .github/              # GitHub workflows and templates
│   ├── workflows/        # CI/CD pipelines
│   └── *.md             # PR templates and guides
├── .husky/              # Git hooks
└── ...config files
```

## Development Workflow

This project uses a **modified GitHub Flow** for development. See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed workflow.

### Branch Structure

- **`main`** - Production code, receives updates from `dev` only
- **`dev`** - Current source of truth, all feature work branches from here
- **Feature branches** - Short-lived branches created from `dev`, merged back to `dev`

### Quick Start

1. **Start from dev:**

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

   Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `chore:` - Maintenance tasks
   - `refactor:` - Code refactoring
   - `test:` - Test additions
   - `style:` - Code formatting
   - `perf:` - Performance improvements

3. **Push and create PR:**

   ```bash
   git push -u origin feature/your-feature-name
   ```

   Then open a Pull Request against `dev` on GitHub.

4. **Review and merge:**
   - Wait for CI checks to pass
   - Get review approval (if required)
   - Merge via GitHub into `dev` using **"Create a merge commit"** (NOT squash merge)
   - Delete the feature branch
   - Pull latest `dev`: `git checkout dev && git pull origin dev`

**Important**: Always use "Create a merge commit" when merging PRs. Squash merging breaks commit history and causes conflicts when syncing branches.

## Git Hooks

This project uses Husky and lint-staged to automate quality checks:

### Pre-commit Hook

Runs automatically on `git commit`:

- **ESLint:** Checks and auto-fixes code quality issues
- **Prettier:** Formats code to project standards
- **Tests:** Runs tests on staged test files (in `__tests__/` directories)
- **commitlint:** Validates commit message format

If there are unfixable errors or failing tests, the commit will be blocked.

### Pre-push Hook

Runs automatically on `git push`:

- **Full test suite:** Runs all tests with coverage reporting
- **Push is blocked** if any tests fail

This ensures only tested, working code reaches the remote repository.

### Bypassing Hooks

To bypass hooks (not recommended):

```bash
git commit --no-verify  # Skip pre-commit
git push --no-verify    # Skip pre-push
```

## CI/CD

GitHub Actions automatically runs on all PRs and pushes to `dev` and `main`:

- **Environment Validation:** Checks if RescueGroups API key is configured
- **Lint & Test:** ESLint, Prettier check, Jest tests
- **Build:** Web export to verify build process
- **Commitlint:** Validates commit messages

See `.github/workflows/ci.yml` for configuration.

### GitHub Secrets

To enable full functionality in CI/CD, configure the following secrets in your repository settings:

- **`EXPO_PUBLIC_RESCUEGROUPS_API_KEY`**: Your RescueGroups API key (optional)
- **`CODECOV_TOKEN`**: Codecov upload token for coverage reports (optional)

The workflow will show a warning if the API key is not configured but will continue with limited functionality.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development workflow (GitHub Flow)
- Branch naming conventions
- Commit message guidelines
- Pull request process
- Release process

## Versioning

This project uses [Semantic Versioning](https://semver.org/) (SemVer):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features (backwards compatible)
- **Patch** (0.0.1): Bug fixes

Versions are managed automatically via conventional commits and `commit-and-tag-version`.

## License

This project is private and proprietary.

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Review existing documentation in `CONTRIBUTING.md` and `AGENTS.md`
- Check CI/CD logs for build failures

---

Built with ❤️ using React Native and Expo
