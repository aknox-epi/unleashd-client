const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.expo/**',
      '.next/**',
      'out/**',
      'bun.lock',
      'metro.config.js',
      'babel.config.js',
      'tailwind.config.js',
      'eslint.config.js',
      'expo-env.d.ts',
      'nativewind-env.d.ts',
      'assets/**',
      '.cache/**',
      '*.log',
      '.DS_Store',
      'coverage/**',
      'scripts/**', // Ignore utility scripts
    ],
  },

  // Base config for all JS/TS files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        // React Native globals
        global: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,

      // TypeScript rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports' },
      ],

      // React rules
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React 19
      'react/prop-types': 'off', // Using TypeScript
      'react/display-name': 'warn',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // React Native rules
      ...reactNativePlugin.configs.all.rules,
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'off', // Using className with NativeWind
      'react-native/no-color-literals': 'off', // Using Tailwind colors
      'react-native/no-raw-text': 'off', // Too strict
      'react-native/sort-styles': 'off', // Not applicable with NativeWind

      // Best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',

      // Prettier integration - disables conflicting formatting rules
      ...prettierConfig.rules,
    },
  },

  // Config files override
  {
    files: [
      '*.config.js',
      '*.config.ts',
      'babel.config.js',
      'metro.config.js',
      'commitlint.config.js',
    ],
    languageOptions: {
      parserOptions: {
        project: null, // Disable TypeScript project for config files
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Scripts directory override (Node.js scripts)
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      parserOptions: {
        project: null, // Disable TypeScript project for scripts
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off', // Allow console in scripts
    },
  },

  // Test files override
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
];
