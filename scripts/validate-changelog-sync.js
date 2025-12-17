#!/usr/bin/env node

/**
 * Validate Changelog Sync
 *
 * Ensures that the version in package.json matches the latest version
 * in the embedded changelog (constants/changelog.ts).
 *
 * This catches cases where they might drift out of sync due to:
 * - Manual edits to package.json
 * - Cherry-picks or reverts
 * - Hotfixes that bypass normal release flow
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const changelogTsPath = path.join(__dirname, '../constants/changelog.ts');

try {
  // Read package.json version
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const packageVersion = packageJson.version;

  if (!packageVersion) {
    console.error('❌ Error: Could not read version from package.json');
    process.exit(1);
  }

  // Read embedded changelog content
  const changelogTs = fs.readFileSync(changelogTsPath, 'utf-8');

  // Extract the first version heading from the embedded changelog
  // Format: ## 0.6.0 or ## [0.6.0]
  const versionMatch = changelogTs.match(/##\s+\[?(\d+\.\d+\.\d+)/);

  if (!versionMatch) {
    console.error(
      '❌ Error: Could not parse version from constants/changelog.ts'
    );
    console.error('   The embedded changelog might be empty or malformed.');
    process.exit(1);
  }

  const embeddedVersion = versionMatch[1];

  // Compare versions
  if (packageVersion !== embeddedVersion) {
    console.error('❌ Changelog sync validation failed!');
    console.error('');
    console.error(`   package.json version:  ${packageVersion}`);
    console.error(`   Embedded changelog:    ${embeddedVersion}`);
    console.error('');
    console.error(
      '   The embedded changelog is out of sync with package.json.'
    );
    console.error('   Run: bun run update-changelog');
    console.error('');
    process.exit(1);
  }

  // Success
  console.log('✅ Changelog sync validation passed!');
  console.log(`   Version: ${packageVersion}`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error during validation:', error.message);
  process.exit(1);
}
