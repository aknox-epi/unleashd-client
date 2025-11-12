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

We use a modified **GitHub Flow** for our development workflow:

- **`main`** - Production-ready code, always deployable
- ** `dev` ** - Used as a staging area for main given current deployment limits with Netlify
- **Feature branches** - Short-lived branches for new features, fixes, or improvements

### Key Principles

1. **`main` is sacred** - Always keep it stable and deployable
2. **`dev`** - Current source of truth, all feature work should branch of dev and merge to dev
3. **Branch often** - Create a new branch for each feature or fix
4. **Merge fast** - Keep branches short-lived (hours to days, not weeks)
5. **Review everything** - All changes go through pull requests
6. **Delete after merge** - Clean up branches after merging

## Development Workflow

### 1. Start from dev

Always start your work from the latest `dev`:

```bash
git checkout dev
git pull origin dev
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

- Go to GitHub and create a pull request against `dev`
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

After initial approval:

#### Release Process

Releases are managed using [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) based on conventional commits.

##### Creating a release

```bash
# 1. Squash commits for your feature branch
git rebase -i dev

# 2. Preview the release (recommended)
bun run release:dry

# 3. Create the release
bun run release

# 4. Push with tags
git push --follow-tags origin dev
```

###### Version bumps

Version is automatically determined by commit types since last release:

- `feat:` commits → **minor** version bump (0.1.0 → 0.2.0)
- `fix:` commits → **patch** version bump (0.1.0 → 0.1.1)
- `BREAKING CHANGE:` footer → **major** version bump (0.1.0 → 1.0.0)

###### Manual version bump

If needed, you can force a specific bump:

```bash
bun run release:major  # 1.0.0 → 2.0.0
bun run release:minor  # 1.0.0 → 1.1.0
bun run release:patch  # 1.0.0 → 1.0.1
```

###### What happens during release

1. Analyzes commits since last release
2. Determines version bump
3. Updates `CHANGELOG.md`
4. Updates `package.json` version
5. Creates a git commit
6. Creates a git tag
7. You push to remote

#### Lastly

1. Get last approval
2. Merge via GitHub
3. Delete the remote branch (GitHub offers this option)
4. Clean up locally:

```bash
git checkout dev
git pull origin dev
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
- **Tests** run on staged test files (in `__tests__/` directories)
- **commitlint** validates your commit message format

If there are unfixable errors or failing tests, the commit will be blocked.

### Pre-push automation

When you push to remote, the following happens automatically:

- **Full test suite** runs with coverage reporting
- **Push is blocked** if any tests fail

This ensures only tested, working code reaches the remote repository.

#### Bypassing Hooks

You can bypass hooks with `--no-verify` (not recommended):

```bash
git commit --no-verify  # Skip pre-commit hooks
git push --no-verify    # Skip pre-push hooks
```

## Pull Requests

### Before opening a PR

- [ ] Code follows project style guidelines (auto-formatted by Prettier)
- [ ] All tests pass: `bun run test`
- [ ] Lint passes: `bun run lint`
- [ ] Build succeeds: `bun run build` (if applicable)
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with `dev`

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
4. Branch must be up to date with `dev`

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

# Run tests on staged test files only
bun run test:staged
```

#### Test Coverage Standards

This project maintains high test coverage standards:

- **API Integrations**: 99%+ coverage required (RescueGroups API services)
- **Critical Services**: 95%+ coverage recommended
- **View coverage reports**: After running tests with coverage, open `coverage/lcov-report/index.html` in your browser

#### Automated Testing via Git Hooks

Tests are automatically enforced through Git hooks:

**Pre-commit Hook**: Runs tests on staged test files only

- Uses `test:staged` script via lint-staged
- Only runs if you're committing test files (e.g., `.test.ts`)
- Faster feedback loop - only tests what you're committing
- Auto-runs when you `git commit`

**Pre-push Hook**: Runs full test suite with coverage

- Uses `test:coverage` script
- Runs **all** tests before pushing to remote
- Blocks push if tests fail or coverage drops
- Auto-runs when you `git push`

These hooks ensure code quality and prevent broken tests from entering the codebase.

#### Writing Tests

When adding new functionality:

1. **Write tests first** (TDD approach recommended)
2. **Test file naming**: Match source file with `.test.ts` suffix
   - Source: `services/animals.ts`
   - Tests: `services/__tests__/animals.test.ts`
3. **Coverage targets**: Aim for 95%+ on new code
4. **Test behavior, not implementation**: Focus on what the code does, not how
5. **Use descriptive test names**: `it('should return empty array when no animals found')`
6. **Mock external dependencies**: Use Jest mocks for API calls, third-party libraries

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
