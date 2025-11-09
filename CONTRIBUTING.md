# Contributing to unleashd-client

Thank you for your interest in contributing to unleashd-client! This document provides guidelines and workflows for contributing to this project.

## Table of Contents

- [Branching Strategy](#branching-strategy)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Code Quality](#code-quality)
- [Release Process](#release-process)

## Branching Strategy

We use **GitHub Flow** for our development workflow:

- **`main`** - Production-ready code, always deployable
- **Feature branches** - Short-lived branches for new features, fixes, or improvements

### Key Principles

1. **`main` is sacred** - Always keep it stable and deployable
2. **Branch often** - Create a new branch for each feature or fix
3. **Merge fast** - Keep branches short-lived (hours to days, not weeks)
4. **Review everything** - All changes go through pull requests
5. **Delete after merge** - Clean up branches after merging

## Development Workflow

### 1. Start from main

Always start your work from the latest `main`:

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch

Create a descriptively named branch:

```bash
git checkout -b feature/your-feature-name
```

### 3. Make your changes

Develop your feature with frequent, focused commits:

```bash
# Edit files
git add .
git commit -m "feat: add user profile screen"

# More changes
git commit -m "test: add profile screen tests"

# Push your branch
git push -u origin feature/your-feature-name
```

### 4. Open a pull request

- Go to GitHub and create a pull request
- Fill out the PR template with details
- Request reviews from team members
- Wait for CI checks to pass

### 5. Address feedback

Respond to review comments and push additional commits:

```bash
git commit -m "refactor: address review feedback"
git push origin feature/your-feature-name
```

### 6. Merge and clean up

After approval:

1. Merge via GitHub (squash or merge commit)
2. Delete the remote branch (GitHub offers this option)
3. Clean up locally:

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

## Branch Naming

Use descriptive names with prefixes:

### Feature branches

```
feature/add-authentication
feature/dark-mode-toggle
feature/user-profile-screen
```

### Bug fixes

```
fix/login-timeout
fix/navigation-crash
fix/button-alignment
```

### Documentation

```
docs/update-readme
docs/api-documentation
docs/contributing-guide
```

### Refactoring

```
refactor/simplify-auth-flow
refactor/extract-api-client
```

### Chores (dependencies, configs, etc.)

```
chore/update-dependencies
chore/configure-eslint
chore/setup-ci
```

### Tests

```
test/add-auth-tests
test/improve-coverage
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

### Format

```
type(scope?): subject

body?

footer?
```

### Types

- **feat**: New feature for users
- **fix**: Bug fix for users
- **docs**: Documentation changes
- **style**: Code formatting (no logic change)
- **refactor**: Code restructuring (no feat/fix)
- **perf**: Performance improvements
- **test**: Adding/updating tests
- **build**: Build system or dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Other changes (tooling, configs)

### Examples

```bash
git commit -m "feat: add dark mode toggle"
git commit -m "fix: resolve login timeout issue"
git commit -m "docs: update installation instructions"
git commit -m "refactor: simplify button component"
git commit -m "test: add unit tests for auth service"
git commit -m "chore: update expo-router to v4"
```

### Rules

- Type must be lowercase
- Subject cannot be empty
- No period at end of subject
- Use imperative mood ("add" not "added")
- Header max 100 characters

### Pre-commit automation

When you commit, the following happens automatically:

- **ESLint** checks and auto-fixes code quality issues
- **Prettier** formats your code
- **commitlint** validates your commit message format

If there are unfixable errors, the commit will be blocked.

## Pull Requests

### Before opening a PR

- [ ] Code follows project style guidelines (auto-formatted by Prettier)
- [ ] All tests pass: `bun run test`
- [ ] Lint passes: `bun run lint`
- [ ] Build succeeds: `bun run build` (if applicable)
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with `main`

### PR checklist

When opening a PR, ensure:

1. **Title** follows conventional commit format (e.g., `feat: add user authentication`)
2. **Description** explains:
   - What changes were made
   - Why they were made
   - How to test them
3. **Link related issues** (e.g., "Closes #123")
4. **Request reviewers**
5. **Wait for CI checks** to pass

### PR guidelines

- Keep PRs focused and small (easier to review)
- Update documentation if needed
- Add tests for new features
- Respond to review feedback promptly
- Resolve all conversations before merge

### Review process

1. At least one approval required (configure in branch protection)
2. All CI checks must pass
3. No unresolved conversations
4. Branch must be up to date with `main`

## Code Quality

### Linting and Formatting

```bash
# Check for linting issues
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Format all code
bun run format

# Check formatting without changes
bun run format:check
```

### Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
jest --watchAll

# Run a specific test
jest path/to/test.spec.ts

# Run tests with coverage
jest --coverage
```

### Building

```bash
# Start development server
bun run start

# Build for web
bun run build

# iOS
npm run ios

# Android
npm run android
```

## Release Process

Releases are managed using [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) based on conventional commits.

### Creating a release

Only maintainers create releases from `main`:

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Preview the release (recommended)
bun run release:dry

# 3. Create the release
bun run release

# 4. Push with tags
git push --follow-tags origin main
```

### Version bumps

Version is automatically determined by commit types since last release:

- `feat:` commits → **minor** version bump (0.1.0 → 0.2.0)
- `fix:` commits → **patch** version bump (0.1.0 → 0.1.1)
- `BREAKING CHANGE:` footer → **major** version bump (0.1.0 → 1.0.0)

### Manual version bump

If needed, you can force a specific bump:

```bash
bun run release:major  # 1.0.0 → 2.0.0
bun run release:minor  # 1.0.0 → 1.1.0
bun run release:patch  # 1.0.0 → 1.0.1
```

### What happens during release

1. Analyzes commits since last release
2. Determines version bump
3. Updates `CHANGELOG.md`
4. Updates `package.json` version
5. Creates a git commit
6. Creates a git tag
7. You push to remote

## Getting Help

- Check the [README.md](./README.md) for project setup
- Review [AGENTS.md](./AGENTS.md) for AI agent guidelines
- Open an issue for bugs or questions
- Ask in pull request comments for code-specific questions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

Thank you for contributing! 🚀
