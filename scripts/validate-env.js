#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * Validates that required environment variables are set before builds.
 * This script should run as a prebuild step to catch missing configuration early.
 *
 * Usage: node scripts/validate-env.js
 * Exit codes:
 *   0 - All required variables are set
 *   1 - One or more required variables are missing
 */

const requiredVars = ['EXPO_PUBLIC_RESCUEGROUPS_API_KEY'];

const missingVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.error('\n❌ Build failed: Missing required environment variables\n');
  console.error('The following environment variables must be set:\n');

  for (const varName of missingVars) {
    console.error(`  - ${varName}`);
  }

  console.error('\nPlease follow these steps:\n');
  console.error('  1. Copy .env.example to .env.local');
  console.error('  2. Add your RescueGroups API key to .env.local');
  console.error(
    '  3. See docs/RESCUEGROUPS_SETUP.md for detailed setup instructions\n'
  );

  process.exit(1);
}

console.log('✅ Environment validation passed');
