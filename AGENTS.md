# Agent Guidelines for unleashd-client

## Branching Strategy

This project uses a modified **GitHub Flow** for development:

- **`main`** - Production code, receives updates from `dev` only
- **`dev`** - Current source of truth, all feature work branches from here
- **Feature branches** - Short-lived branches created from `dev`, merged back to `dev`

### Key Principles

1. **`main` is sacred** - Always keep it stable and deployable
2. **`dev` is the working branch** - All features branch from `dev` and merge to `dev`
3. **Branch often** - Create a new branch for each feature or fix
4. **Merge fast** - Keep branches short-lived (hours to days, not weeks)
5. **Review everything** - All changes go through pull requests
6. **Delete after merge** - Clean up branches after merging

### Branch Naming

Use descriptive names with prefixes:

- `feature/add-authentication` - New features
- `fix/login-timeout` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/simplify-auth-flow` - Code refactoring
- `chore/update-dependencies` - Maintenance tasks
- `test/add-auth-tests` - Test additions

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed workflow.

## Commit Workflow

**⚠️ CRITICAL: AGENTS MUST NEVER EXECUTE `git commit` COMMANDS ⚠️**

**This applies to ALL operational modes (Build, Plan, etc.). No exceptions.**

### Proper Commit Workflow

When changes are ready to be committed, agents must follow this exact workflow:

1. **Stage files**: Agent stages relevant files with `git add`
2. **Suggest commit message**: Agent provides a commit message following Conventional Commits format
3. **STOP**: Agent MUST NOT run `git commit` - wait for user to commit manually
4. **User commits**: User runs `git commit` with their chosen message
5. **Continue**: After user confirms commit, agent may continue with next tasks

### Why Agents Don't Commit

- **User control**: User maintains full control over commit history
- **GPG signing**: Many users require GPG-signed commits (requires interactive passphrase)
- **Review opportunity**: User can review staged changes before committing
- **Flexibility**: User can modify the suggested commit message if needed

### What Agents Should Do

✅ Run `git add <files>` to stage changes
✅ Run `git status` to show what will be committed
✅ Run `git diff --cached` to show staged changes
✅ Suggest a properly formatted commit message
✅ Inform user that files are staged and ready to commit

### What Agents Must NEVER Do

❌ Run `git commit` in any form
❌ Run `git commit -m "message"`
❌ Run `git commit --no-verify`
❌ Run `git commit --amend`
❌ Attempt to work around commit restrictions

**Important:** Feature branches should be created from `dev` and pull requests should target `dev`, not `main`.

**Important:** Feature branches should be created from `dev` and pull requests should target `dev`, not `main`.

## Build/Test Commands

- **Start dev**: `bun run start` (or `npm start` for iOS/Android/web)
- **Run tests**: `bun run test` (runs all tests once)
- **Run tests in watch mode**: `bun run test:watch` (for active development)
- **Run single test**: `jest path/to/test.spec.ts` or `jest -t "test name"`
- **Run tests with coverage**: `bun run test:coverage` (generates coverage report in `coverage/`)
- **Run staged tests**: `bun run test:staged` (runs tests on staged test files only)
- **Build**: `bun run build` (exports web platform to dist/)
- **Lint**: `bun run lint` (check for code quality issues)
- **Lint fix**: `bun run lint:fix` (auto-fix linting issues)
- **Format**: `bun run format` (format all code with Prettier)
- **Format check**: `bun run format:check` (check formatting without changes)
- **Release**: `bun run release` (generate changelog and bump version)
- **Release dry run**: `bun run release:dry` (preview release without changes)

**⚠️ Important:** Never use `bun test` directly - it uses Bun's native test runner which is incompatible with React Native. Always use `bun run test` or other npm scripts. See [TESTING.md](./TESTING.md) for detailed testing documentation.

**Note:** Tests run automatically via Git hooks:

- Pre-commit: Runs `test:staged` on staged test files
- Pre-push: Runs `test:coverage` on full test suite before push

## Project Structure

- **Expo Router** app with file-based routing in `app/`
- **UI components** in `components/ui/` using GlueStack UI + NativeWind (Tailwind)
- **TypeScript strict mode** enabled
- **Path aliases**: Use `@/*` for project root imports
- **ESLint + Prettier**: ESLint for code quality, Prettier for formatting
  - ESLint configured with React Native, TypeScript, and React 19 rules
  - Prettier handles all code formatting (indentation, quotes, semicolons, etc.)
  - Formatting rules in ESLint are disabled to avoid conflicts
- **Pre-commit hooks**: Husky + lint-staged configured
  - Automatically runs ESLint and Prettier on staged files before commit
  - Runs tests on staged test files (if committing `.test.ts` files)
  - Auto-fixes linting issues and formats code
  - Blocks commits if unfixable linting errors exist or tests fail
  - Bypass with `git commit --no-verify` (not recommended)
- **Pre-push hooks**: Husky configured
  - Runs full test suite with coverage before push
  - Blocks push if any tests fail or coverage drops
  - Bypass with `git push --no-verify` (not recommended)
- **Commit message validation**: commitlint enforces Conventional Commits standard
  - Runs automatically via commit-msg hook
  - Blocks commits with invalid message format
  - Ensures consistent commit history and enables automated changelog generation

## Code Style

- **Imports**: Use `@/` path alias (e.g., `@/components/ui/button`), React imports at top
- **Formatting**: Handled automatically by Prettier
  - 2-space indentation
  - Single quotes for strings
  - Semicolons required
  - ES5 trailing commas
  - 80-character print width
- **Types**: Explicit TypeScript types required (strict mode), use `React.ComponentPropsWithoutRef<>` for component props
- **Naming**: PascalCase for components/types, camelCase for functions/variables, kebab-case for files in app/ routes
- **Components**: Use `React.forwardRef` for UI components, `displayName` required for exported components
- **Styling**: Use className with Tailwind classes via NativeWind, `tva()` for component variants
- **Error handling**: No specific convention found - use standard try/catch

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

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
- **revert**: Revert a previous commit

### Examples

- `feat: add dark mode toggle`
- `fix(auth): resolve login timeout`
- `docs: update API documentation`
- `refactor(ui): simplify button component`
- `test: add unit tests for auth service`

### Rules

- Type must be lowercase
- Subject cannot be empty
- No period at end of subject
- Header max 100 characters
- Use imperative mood ("add" not "added")

### Pull Request Titles

**CRITICAL:** PR titles MUST follow Conventional Commits format because they become merge commit messages.

✅ **Valid PR titles:**

- `feat: add dark mode toggle`
- `fix(auth): resolve login timeout`
- `docs: update API documentation`
- `refactor(ui): simplify button component`

❌ **Invalid PR titles:**

- `Feature/add dark mode` (branch name format)
- `Fix authentication bug` (missing type prefix)
- `Updated docs` (wrong tense, missing type)

**Automated validation:**

- PR title validation runs automatically on all pull requests
- Merge will be blocked if PR title doesn't follow the format
- The PR template includes format examples and guidance

### Merge Strategy

**CRITICAL**: All PRs must use **"Squash and merge"** strategy on GitHub.

**Why Squash and Merge?**

1. ✅ **PR title becomes commit message** - Validated by PR Title Check
2. ✅ **Clean linear history** - One commit per PR/feature
3. ✅ **Prevents branch divergence** - No complex merge commit conflicts
4. ✅ **Perfect changelog** - Each commit represents one logical change
5. ✅ **Automated validation** - What you validate is what you get

**Merge Strategy by Branch:**

| From → To           | Strategy         | PR Title Format                       |
| ------------------- | ---------------- | ------------------------------------- |
| `feature/*` → `dev` | Squash and merge | `feat: description`                   |
| `fix/*` → `dev`     | Squash and merge | `fix: description`                    |
| `release/*` → `dev` | Squash and merge | `chore(release): x.x.x`               |
| `dev` → `main`      | Squash and merge | `chore: release vx.x.x to production` |

**Never use:**

- ❌ Create a merge commit (causes branch divergence)
- ❌ Rebase and merge (rewrites history)

## Changelog Generation

This project uses [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) to automatically generate changelogs and manage versions based on Conventional Commits.

### How It Works

- Analyzes commit messages since the last release
- Determines version bump based on commit types:
  - `feat:` → **minor** version bump (0.1.0 → 0.2.0)
  - `fix:` → **patch** version bump (0.1.0 → 0.1.1)
  - `BREAKING CHANGE:` → **major** version bump (0.1.0 → 1.0.0)
- Generates/updates `CHANGELOG.md` with grouped changes
- Updates `package.json` version
- Creates a git commit and tag

### Release Commands

- `bun run release` - Auto-detect version bump and generate changelog
- `bun run release:major` - Force major version bump (breaking changes)
- `bun run release:minor` - Force minor version bump (new features)
- `bun run release:patch` - Force patch version bump (bug fixes)
- `bun run release:first` - Create initial release (v0.1.0 or v1.0.0)
- `bun run release:dry` - Preview changes without modifying files

### Release Workflow

Releases are created using a dedicated release branch that merges to `dev` first, then `dev` merges to `main` for production.

**CRITICAL**: Always use **"Squash and merge"** when merging PRs. This ensures clean linear history and prevents branch divergence.

1. **Create release branch from dev**:

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b release/0.x.x
   ```

2. **Preview release** (recommended first step):

   ```bash
   bun run release:dry
   ```

3. **Generate release**:

   ```bash
   bun run release        # Auto-detect version bump
   # OR force specific bump:
   # bun run release:minor
   # bun run release:major
   # bun run release:patch
   ```

4. **Review changes**:
   - Check `CHANGELOG.md` for accuracy
   - Verify version bump in `package.json`
   - Review the git commit and tag

5. **Push release branch with tags**:

   ```bash
   git push --follow-tags origin release/0.x.x
   ```

6. **Create PR from release branch to dev on GitHub**:
   - **Title**: `chore(release): 0.x.x`
   - **Body**: `Release preparation - updates changelog and version`
   - Wait for CI checks to pass
   - Get approval from reviewers

7. **Merge release PR to dev using "Squash and merge"**

8. **Create PR from dev to main on GitHub**:
   - **Title**: `chore: release v0.x.x to production`
   - **Body**: `Production release v0.x.x - see CHANGELOG.md for details`
   - Wait for CI checks to pass
   - Get approval from reviewers

9. **Merge dev to main using "Squash and merge"**

   ```bash
   gh pr create --base main --head dev \
     --title "Release v0.x.x" \
     --body "Production release v0.x.x - see CHANGELOG.md"
   ```

10. **Get approval and merge to main using "Create a merge commit"** (NOT squash merge!)

11. **Sync local branches and clean up**:
12. **Create PR from release branch to dev on GitHub**:
    - **Title**: `chore(release): 0.x.x`
    - **Body**: `Release preparation - updates changelog and version`
    - Wait for CI checks to pass
    - Get approval from reviewers

13. **Merge release PR to dev using "Squash and merge"**

14. **Create PR from dev to main on GitHub**:
    - **Title**: `chore: release v0.x.x to production`
    - **Body**: `Production release v0.x.x - see CHANGELOG.md for details`
    - Wait for CI checks to pass
    - Get approval from reviewers

15. **Merge dev to main using "Squash and merge"**

16. **Sync local branches and clean up**:

    ```bash
    git checkout dev && git pull origin dev
    git checkout main && git pull origin main
    git branch -d release/0.x.x
    git push origin --delete release/0.x.x
    ```

### What Appears in CHANGELOG

Commits are grouped by type in the changelog:

- **Features** (`feat:`) - Always visible
- **Bug Fixes** (`fix:`) - Always visible
- **Performance Improvements** (`perf:`) - Always visible
- **Documentation** (`docs:`) - Visible
- **Build System** (`build:`) - Visible
- **Reverts** (`revert:`) - Always visible
- **Hidden types**: `style:`, `refactor:`, `test:`, `ci:`, `chore:`

### Configuration

Release behavior is configured in `.versionrc.json`:

- Defines which commit types appear in changelog
- Customizes section headings
- Sets changelog header format

### Best Practices

- **Always run dry run first**: Preview changes before committing
- **Don't edit CHANGELOG manually**: Regenerate if needed
- **Use semantic commits consistently**: Ensures accurate version bumps
- **Review before pushing**: Check changelog and version are correct
- **Push with tags**: Use `git push --follow-tags` to include version tags
- **Always use "Squash and merge"**: Ensures clean history and prevents branch divergence

## Development Workflow

1. **Start from dev**: Always create feature branches from the latest `dev` branch
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```
2. **Pre-commit automation**: ESLint and Prettier run automatically on staged files when you commit
   - Linting errors are auto-fixed when possible
   - Code is automatically formatted to match project style
   - Commit is blocked if unfixable errors exist
3. **Commit message validation**: commitlint validates commit messages automatically
   - Enforces Conventional Commits format (type: subject)
   - Blocks commits with invalid message format
   - Use proper type prefix (feat, fix, docs, chore, etc.)
4. **Pull requests**: Open PRs against `dev` branch, not `main`
5. **Merge strategy**: Always use "Squash and merge" on GitHub
6. **Manual checks**: Run `bun run lint:fix` to fix all code quality issues in the project
7. **Manual formatting**: Run `bun run format` to format all files (Prettier runs on commit automatically)
8. **Code quality**: ESLint checks logic, best practices, React rules, TypeScript issues
9. **Formatting**: Prettier ensures consistent code style across all files

## React Native + Expo

- Cross-platform: Native (iOS/Android) and web support
- Import from 'react-native' for primitives (View, Text, Pressable)
- Use platform-specific files: `.web.tsx`, `.tsx` (native)
