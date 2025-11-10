#!/usr/bin/env node

/**
 * Script to fetch animal field definitions from RescueGroups API v2
 *
 * This script uses the 'define' action to retrieve metadata about all available
 * animal fields from the RescueGroups API, including field names, types, and
 * valid values.
 *
 * Usage: node scripts/fetch-animal-fields.js
 *
 * Requires: EXPO_PUBLIC_RESCUEGROUPS_API_KEY environment variable
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const API_ENDPOINT = 'https://api.rescuegroups.org/http/v2.json';
const API_KEY = process.env.EXPO_PUBLIC_RESCUEGROUPS_API_KEY;

// Validate API key
if (!API_KEY) {
  console.error(
    '❌ Error: EXPO_PUBLIC_RESCUEGROUPS_API_KEY not found in environment'
  );
  console.error('Please set it in your .env.local file');
  process.exit(1);
}

console.log('🔍 Fetching animal field definitions from RescueGroups API...\n');

/**
 * Fetches field definitions from the API
 */
async function fetchFieldDefinitions() {
  const requestBody = {
    apikey: API_KEY,
    objectType: 'animals',
    objectAction: 'define',
  };

  console.log(
    '📤 Request:',
    JSON.stringify(
      {
        objectType: requestBody.objectType,
        objectAction: requestBody.objectAction,
      },
      null,
      2
    )
  );

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('📥 Response status:', data.status);

    if (data.status === 'error') {
      console.error('❌ API Error:');
      if (data.messages?.generalMessages) {
        data.messages.generalMessages.forEach((msg) => {
          console.error(`  - ${msg.messageText}`);
        });
      }
      throw new Error('API returned error status');
    }

    return data;
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    throw error;
  }
}

/**
 * Parses field definitions into a structured format
 */
function parseFieldDefinitions(apiResponse) {
  const parsed = {
    metadata: {
      fetchedAt: new Date().toISOString(),
      status: apiResponse.status,
      totalFields: 0,
    },
    fieldsByCategory: {},
    fieldsByType: {},
    allFields: {},
  };

  // The define endpoint returns: {data: {publicSearch: {fields: {...}}}}
  // Extract fields from the publicSearch action (used for querying animals)
  let fields = {};

  if (apiResponse.data?.publicSearch?.fields) {
    fields = apiResponse.data.publicSearch.fields;
  } else if (apiResponse.data?.fields) {
    // Fallback: check if fields are directly under data
    fields = apiResponse.data.fields;
  } else {
    console.warn(
      '⚠️  Warning: Could not find fields in expected location (data.publicSearch.fields)'
    );
    console.warn('   Response structure:', Object.keys(apiResponse.data || {}));
  }

  parsed.metadata.totalFields = Object.keys(fields).length;
  parsed.allFields = fields;

  // Categorize fields by name prefix
  Object.entries(fields).forEach(([fieldName, fieldDef]) => {
    // Extract category from field name (e.g., "animal" from "animalName")
    const category = categorizeField(fieldName);

    if (!parsed.fieldsByCategory[category]) {
      parsed.fieldsByCategory[category] = {};
    }
    parsed.fieldsByCategory[category][fieldName] = fieldDef;

    // Categorize by type if available
    const fieldType = fieldDef.type || fieldDef.fieldType || 'unknown';
    if (!parsed.fieldsByType[fieldType]) {
      parsed.fieldsByType[fieldType] = {};
    }
    parsed.fieldsByType[fieldType][fieldName] = fieldDef;
  });

  return parsed;
}

/**
 * Categorizes a field by its prefix or semantic meaning
 */
function categorizeField(fieldName) {
  const name = fieldName.toLowerCase();

  if (name.includes('id')) return 'identification';
  if (name.includes('name') || name.includes('rescue')) return 'identification';
  if (
    name.includes('species') ||
    name.includes('breed') ||
    name.includes('sex') ||
    name.includes('age') ||
    name.includes('size') ||
    name.includes('color') ||
    name.includes('pattern')
  )
    return 'physical';
  if (
    name.includes('ok') ||
    name.includes('energy') ||
    name.includes('exercise') ||
    name.includes('vocal') ||
    name.includes('fence')
  )
    return 'behavior';
  if (
    name.includes('altered') ||
    name.includes('declawed') ||
    name.includes('housetrain') ||
    name.includes('special') ||
    name.includes('groom')
  )
    return 'health';
  if (
    name.includes('location') ||
    name.includes('distance') ||
    name.includes('org') ||
    name.includes('city')
  )
    return 'location';
  if (
    name.includes('picture') ||
    name.includes('video') ||
    name.includes('thumbnail') ||
    name.includes('url') ||
    name.includes('image')
  )
    return 'media';
  if (name.includes('description') || name.includes('distinguish'))
    return 'description';
  if (
    name.includes('status') ||
    name.includes('date') ||
    name.includes('created') ||
    name.includes('updated')
  )
    return 'metadata';
  if (name.includes('fee') || name.includes('adoption')) return 'adoption';

  return 'other';
}

/**
 * Saves data to a JSON file
 */
function saveJson(filename, data) {
  const filepath = path.join(__dirname, '..', 'docs', filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Saved: ${filename}`);
}

/**
 * Generates markdown documentation
 */
function generateDocumentation(parsedData, rawData) {
  const lines = [];

  lines.push('# RescueGroups API - Animal Fields Documentation');
  lines.push('');
  lines.push('> **Auto-generated documentation**');
  lines.push(`> Last updated: ${parsedData.metadata.fetchedAt}`);
  lines.push(`> Total fields available: ${parsedData.metadata.totalFields}`);
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(
    'This document provides comprehensive information about all available animal fields in the RescueGroups API v2.'
  );
  lines.push(
    'The data was retrieved using the `objectAction: "define"` endpoint.'
  );
  lines.push('');

  // Currently used fields
  lines.push('## Currently Used Fields');
  lines.push('');
  lines.push(
    'These fields are currently requested in the `ANIMAL_FIELDS` constant in `services/rescuegroups/animals.ts`:'
  );
  lines.push('');
  const currentFields = [
    'animalID',
    'animalName',
    'animalSpecies',
    'animalBreed',
    'animalSex',
    'animalGeneralAge',
    'animalLocationCitystate',
    'animalPictures',
    'animalThumbnailUrl',
  ];

  currentFields.forEach((field) => {
    const fieldDef = parsedData.allFields[field];
    if (fieldDef) {
      lines.push(`- **${field}**`);
      if (fieldDef.label || fieldDef.description) {
        lines.push(
          `  - ${fieldDef.label || fieldDef.description || 'No description'}`
        );
      }
    } else {
      lines.push(`- **${field}** ⚠️ (Not found in API response)`);
    }
  });
  lines.push('');

  // Fields by category
  lines.push('## All Available Fields by Category');
  lines.push('');

  const sortedCategories = Object.keys(parsedData.fieldsByCategory).sort();
  sortedCategories.forEach((category) => {
    lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    lines.push('');

    const fields = parsedData.fieldsByCategory[category];
    const sortedFields = Object.keys(fields).sort();

    sortedFields.forEach((fieldName) => {
      const fieldDef = fields[fieldName];
      lines.push(`#### \`${fieldName}\``);

      if (fieldDef.label) {
        lines.push(`**Label:** ${fieldDef.label}`);
      }

      if (fieldDef.type || fieldDef.fieldType) {
        lines.push(`**Type:** ${fieldDef.type || fieldDef.fieldType}`);
      }

      if (fieldDef.description) {
        lines.push(`**Description:** ${fieldDef.description}`);
      }

      if (fieldDef.values || fieldDef.options) {
        const values = fieldDef.values || fieldDef.options;
        lines.push(`**Valid values:**`);
        if (Array.isArray(values)) {
          values.forEach((v) => lines.push(`  - ${v}`));
        } else if (typeof values === 'object') {
          Object.entries(values).forEach(([k, v]) => {
            lines.push(`  - \`${k}\`: ${v}`);
          });
        }
      }

      lines.push('');
    });
  });

  // Raw API response info
  lines.push('## Raw API Response Structure');
  lines.push('');
  lines.push('```json');
  lines.push(
    JSON.stringify(rawData, null, 2).split('\n').slice(0, 50).join('\n')
  );
  if (JSON.stringify(rawData, null, 2).split('\n').length > 50) {
    lines.push('... (truncated, see animal-fields-raw.json for full response)');
  }
  lines.push('```');
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  lines.push(
    'Based on the available fields, consider adding these to improve the user experience:'
  );
  lines.push('');
  lines.push('### High Priority');
  lines.push(
    '- `animalDescription` or `animalDescriptionPlain` - Full animal description for detail pages'
  );
  lines.push('- `animalPrimaryBreed` - More specific breed information');
  lines.push('- `animalColor` - Visual characteristic for filtering/display');
  lines.push('- `animalStatus` - Important for filtering available animals');
  lines.push('');
  lines.push('### Medium Priority');
  lines.push(
    '- `animalOKWithKids`, `animalOKWithCats`, `animalOKWithDogs` - Compatibility filters'
  );
  lines.push(
    '- `animalSpecialNeeds` - Important for users seeking special needs pets'
  );
  lines.push('- `animalAdoptionFee` - Useful for budgeting');
  lines.push('- `animalUpdatedDate` - For showing freshness of listings');
  lines.push('');
  lines.push('### Low Priority');
  lines.push(
    '- `animalEnergyLevel`, `animalExerciseNeeds` - Lifestyle matching'
  );
  lines.push('- `animalGroomingNeeds` - Care requirements');
  lines.push('- `animalUrl` - Link to full listing on RescueGroups');
  lines.push('');

  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Fetch field definitions
    const rawData = await fetchFieldDefinitions();
    console.log('');

    // Save raw response
    saveJson('animal-fields-raw.json', rawData);

    // Parse and structure the data
    console.log('');
    console.log('📊 Parsing field definitions...');
    const parsedData = parseFieldDefinitions(rawData);
    console.log(`   Found ${parsedData.metadata.totalFields} fields`);
    console.log(
      `   Categories: ${Object.keys(parsedData.fieldsByCategory).join(', ')}`
    );
    console.log('');

    // Save parsed data
    saveJson('animal-fields-parsed.json', parsedData);

    // Generate markdown documentation
    console.log('📝 Generating documentation...');
    const markdown = generateDocumentation(parsedData, rawData);
    const docPath = path.join(
      __dirname,
      '..',
      'docs',
      'RESCUEGROUPS_ANIMAL_FIELDS.md'
    );
    fs.writeFileSync(docPath, markdown, 'utf8');
    console.log('✅ Saved: RESCUEGROUPS_ANIMAL_FIELDS.md');
    console.log('');

    console.log('✨ Done! Check the docs/ directory for the generated files.');
    console.log('');
    console.log('📁 Generated files:');
    console.log('   - docs/animal-fields-raw.json (raw API response)');
    console.log('   - docs/animal-fields-parsed.json (structured data)');
    console.log(
      '   - docs/RESCUEGROUPS_ANIMAL_FIELDS.md (human-readable docs)'
    );
  } catch (error) {
    console.error('');
    console.error('❌ Failed to fetch field definitions');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
