# Agent Guidelines for unleashd-client

## Build/Test Commands

- **Start dev**: `bun run start` (or `npm start` for iOS/Android/web)
- **Run tests**: `bun run test` or `jest --watchAll`
- **Run single test**: `jest path/to/test.spec.ts` or `jest -t "test name"`
- **Build**: `bun run build` (exports web platform to dist/)
- **Lint**: `bun run lint` (check for code quality issues)
- **Lint fix**: `bun run lint:fix` (auto-fix linting issues)
- **Format**: `bun run format` (format all code with Prettier)
- **Format check**: `bun run format:check` (check formatting without changes)

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
  - Auto-fixes linting issues and formats code
  - Blocks commits if unfixable linting errors exist
  - Bypass with `git commit --no-verify` (not recommended)

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

## Development Workflow

1. **Pre-commit automation**: ESLint and Prettier run automatically on staged files when you commit
   - Linting errors are auto-fixed when possible
   - Code is automatically formatted to match project style
   - Commit is blocked if unfixable errors exist
2. **Manual checks**: Run `bun run lint:fix` to fix all code quality issues in the project
3. **Manual formatting**: Run `bun run format` to format all files (Prettier runs on commit automatically)
4. **Code quality**: ESLint checks logic, best practices, React rules, TypeScript issues
5. **Formatting**: Prettier ensures consistent code style across all files

## React Native + Expo

- Cross-platform: Native (iOS/Android) and web support
- Import from 'react-native' for primitives (View, Text, Pressable)
- Use platform-specific files: `.web.tsx`, `.tsx` (native)
