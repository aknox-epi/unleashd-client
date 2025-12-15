# Contributing to unleashd-client

Thank you for your interest in contributing to unleashd-client! This guide covers the development workflow, coding standards, and release process for contributors making code changes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Release Process](#release-process)
- [Code Quality](#code-quality)
- [Code of Conduct](#code-of-conduct)
- [Getting Help](#getting-help)

## Prerequisites

Before contributing, ensure you have the development environment set up.

**See [README.md - Prerequisites](./README.md#prerequisites) and [README.md - Getting Started](./README.md#getting-started)** for:

- Node.js, Bun, and other required tools
- Installation instructions
- RescueGroups API key setup
- Running the development server

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

1. **Merge via GitHub** using **"Create a merge commit"**

**Merging a Feature PR:**

For all PRs (features, fixes, docs, releases), use GitHub's **"Create a merge commit"** button. This preserves all commits from your feature branch in the history.

**Important**: Always use "Create a merge commit" when merging PRs. This strategy:

- Preserves full commit history from feature branches
- Ensures your commits are visible in the history for debugging
- Works perfectly with our automated release and tagging workflow
- Maintains consistency across branches

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

**Git hooks run automatically when you commit.** For details on what hooks do and how to bypass them, see [README.md - Git Hooks](./README.md#git-hooks).

**Summary:**

- ESLint checks and auto-fixes code quality issues
- Prettier formats your code automatically
- Tests run on staged test files (in `__tests__/` directories)
- commitlint validates your commit message format

If there are unfixable errors or failing tests, the commit will be blocked.

### Pre-push automation

**Full test suite runs automatically when you push.** For details, see [README.md - Git Hooks](./README.md#git-hooks).

**Summary:**

- Full test suite runs with coverage reporting
- Push is blocked if any tests fail

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

### Merge Strategy

**CRITICAL**: Always use **"Create a merge commit"** when merging PRs to `dev` or `main`.

- ✅ **DO**: Use "Create a merge commit" button on GitHub
- ❌ **DON'T**: Use "Squash and merge" or "Rebase and merge"

**Why?** Merge commits:

- Preserve full commit history from feature branches
- Ensure your commits are visible in history for debugging
- Work perfectly with our automated release and tagging workflow
- Allow git tags to follow commits naturally through branches
- Maintain consistency across branches

## Release Process

Releases are managed using [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) based on conventional commits. The release process uses a dedicated release branch that merges to `dev` first, then `dev` merges to `main` for production deployment.

### Version Bumps

Version is automatically determined by commit types since last release:

- `feat:` commits → **minor** version bump (0.1.0 → 0.2.0)
- `fix:` commits → **patch** version bump (0.1.0 → 0.1.1)
- `BREAKING CHANGE:` footer → **major** version bump (0.1.0 → 1.0.0)

### Creating a Release

```bash
# 1. Create release branch from dev
git checkout dev
git pull origin dev
git checkout -b release/0.x.x  # Or release-0.x.x, naming is flexible

# 2. Preview the release (recommended)
bun run release:dry

# 3. Create the release (updates 3 files automatically)
bun run release        # Auto-detect version bump
# OR force specific bump:
# bun run release:minor   # 0.1.0 → 0.2.0
# bun run release:major   # 0.1.0 → 1.0.0
# bun run release:patch   # 0.1.0 → 0.1.1

# This automatically updates:
# - package.json (version)
# - CHANGELOG.md (release notes)
# - constants/changelog.ts (embedded changelog for What's New feature)

# 4. Push release branch WITH tags
bun run release:push
# Or manually: git push origin release/0.x.x --follow-tags
```

### Merging the Release

#### Step 1: Merge release branch to dev

**On GitHub:**

1. Create PR from release branch to dev
   - **Title**: `chore(release): 0.x.x`
   - **Body**: `Release preparation - updates changelog and version`
2. Wait for CI checks to pass
3. Get approval from team
4. **Use "Create a merge commit"** to merge to `dev`

#### Step 2: Merge dev to main (production release)

**Automated by GitHub Actions:**

1. A GitHub Action automatically creates a PR from `dev` to `main` with:
   - **Title**: `chore: release v0.x.x to production` (auto-populated from package.json)
   - **Body**: `Production release v0.x.x - see CHANGELOG.md for details`
2. Review the auto-created PR for accuracy
3. Wait for CI checks to pass
4. Get approval from team
5. **Use "Create a merge commit"** to merge to `main`

**Note:** The PR creation is automated via `.github/workflows/auto-release-pr.yml`. You only need to review and merge the auto-created PR.

#### Step 3: Sync and clean up

```bash
# Sync local branches
git checkout dev && git pull origin dev
git checkout main && git pull origin main

# Clean up release branch
git branch -d release/0.x.x
git push origin --delete release/0.x.x
```

### What Happens During Release

1. Analyzes commits since last release tag
2. Determines version bump based on commit types
3. Updates `CHANGELOG.md` with grouped changes
4. Updates `package.json` version
5. **Automatically embeds changelog** into `constants/changelog.ts` (for What's New feature)
6. Creates a git commit with all 3 files: `chore(release): x.x.x`
7. Creates a git tag: `vx.x.x`

**Note:** The changelog embedding happens automatically via the `postchangelog` lifecycle hook in `.versionrc.json`. You don't need to manually update `constants/changelog.ts`.

### Manual Version Override

If auto-detection isn't working correctly, force a specific bump:

```bash
bun run release:major  # Force major: 1.0.0 → 2.0.0
bun run release:minor  # Force minor: 1.0.0 → 1.1.0
bun run release:patch  # Force patch: 1.0.0 → 1.0.1
```

### Git Tag Strategy

**Important:** This project uses git tags to mark production releases on the `main` branch.

**How It Works:**

1. When you run `bun run release` on a release branch, a git tag is created locally
2. Push the tag along with the branch using `bun run release:push` (or `git push --follow-tags`)
3. When merging with **"Create a merge commit"**, the tag follows the commit through both `dev` and `main`
4. Tags naturally appear on `main` after the release PR merges through dev

**Why This Approach?**

- ✅ **Simple and standard**: Tags follow commits through merge commits
- ✅ **Semantic correctness**: Tags represent production releases on `main`
- ✅ **No automation needed**: Standard git behavior handles everything
- ✅ **Single source of truth**: Each tag points to exactly one commit
- ✅ **GitHub releases**: Tags on `main` enable proper GitHub release creation

**Important Notes:**

- **Always push with tags**: Use `bun run release:push` or the `--follow-tags` flag
- **Tags follow commits**: With merge commits, tags stay with their commits across branches
- **No manual re-tagging**: Tags automatically appear on `main` after merging

### Troubleshooting Releases

#### Changelog is out of sync

If `constants/changelog.ts` doesn't match `package.json` version:

```bash
# Check if they're in sync
bun run validate:changelog

# If out of sync, the next release will fix it automatically
# Or manually run:
node scripts/embed-changelog.js
git add constants/changelog.ts
git commit -m "chore: sync embedded changelog"
```

#### Forgot to push tags with release branch

If you pushed the release branch without tags:

```bash
# Push tags separately
git push origin --tags

# Or delete the branch and re-push with tags
git push origin --delete release/0.x.x
bun run release:push
```

#### Release command fails with "tag already exists"

If a tag already exists locally or remotely:

```bash
# Delete local tag
git tag -d v0.x.x

# Delete remote tag (careful!)
git push origin :refs/tags/v0.x.x

# Re-run release
bun run release
```

#### Pre-push hook blocks push (missing tags on release branch)

If you try to push a release branch without tags:

```bash
# The pre-push hook will show an error message
# Use the release:push command instead:
bun run release:push

# Or manually add --follow-tags:
git push origin release/0.x.x --follow-tags
```

## Code Quality

### Linting and Formatting

**For available commands, see [README.md - Code Quality](./README.md#code-quality).**

**Commands:**

```bash
bun run lint          # Check for linting errors
bun run lint:fix      # Auto-fix linting errors
bun run format        # Format all files with Prettier
bun run format:check  # Check formatting without changes
```

**Standards:**

- ESLint checks code quality, best practices, React rules, TypeScript issues
- Prettier ensures consistent code style (2-space indents, single quotes, semicolons)
- Both run automatically on commit via pre-commit hooks

### Testing

**For test commands, see [README.md - Testing](./README.md#testing).**

**Commands:**

```bash
bun run test          # Run all tests
jest --watchAll       # Run tests in watch mode
jest path/to/test     # Run a specific test
bun run test:coverage # Run tests with coverage report
bun run test:staged   # Run tests on staged test files only
```

#### Test Coverage Standards

This project maintains high test coverage standards:

- **API Integrations**: 99%+ coverage required (RescueGroups API services)
- **Critical Services**: 95%+ coverage recommended
- **View coverage reports**: After running tests with coverage, open `coverage/lcov-report/index.html` in your browser

#### Automated Testing via Git Hooks

**Tests run automatically via Git hooks.** For details, see [README.md - Git Hooks](./README.md#git-hooks).

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

**For build commands, see [README.md - Build](./README.md#build).**

**Commands:**

```bash
bun run start    # Start development server
bun run build    # Build for web (exports to dist/)
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
```

## Getting Help

- **Project setup and installation**: See [README.md](./README.md)
- **API integration**: See [README.md - RescueGroups API Integration](./README.md#rescuegroups-api-integration)
- **Available scripts and commands**: See [README.md - Available Scripts](./README.md#available-scripts)
- **Git hooks and automation**: See [README.md - Git Hooks](./README.md#git-hooks)
- **CI/CD pipeline**: See [README.md - CI/CD](./README.md#cicd)
- **Bug reports or questions**: Open an issue on GitHub
- **Code-specific questions**: Ask in pull request comments

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

Thank you for contributing! 🚀
