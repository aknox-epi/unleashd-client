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

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Bun** (v1.0 or higher) - [Installation guide](https://bun.sh/docs/installation)
- **iOS:** Xcode (for iOS development)
- **Android:** Android Studio + Android SDK (for Android development)
- **Expo CLI** (installed automatically with the project)

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

Releases are created as part of the merge to `dev` branch:

- `bun run release` - Auto-detect version bump and generate changelog
- `bun run release:major` - Force major version bump (breaking changes)
- `bun run release:minor` - Force minor version bump (new features)
- `bun run release:patch` - Force patch version bump (bug fixes)
- `bun run release:dry` - Preview release without making changes

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
   - Create and get release approval
   - Merge via GitHub into `dev`
   - Delete the feature branch
   - Pull latest `dev`: `git checkout dev && git pull origin dev`

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

- **Lint & Test:** ESLint, Prettier check, Jest tests
- **Build:** Web export to verify build process
- **Commitlint:** Validates commit messages

See `.github/workflows/ci.yml` for configuration.

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
