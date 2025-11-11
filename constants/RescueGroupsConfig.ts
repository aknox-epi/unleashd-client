/**
 * RescueGroups API v2 Configuration
 * Documentation: https://userguide.rescuegroups.org/display/APIDG/API+Developer+Guide
 */

import type { AnimalSpecies } from '@/services/rescuegroups/generated-types';

export const RESCUEGROUPS_CONFIG = {
  /**
   * Base API endpoint for RescueGroups API v2
   */
  API_ENDPOINT: 'https://api.rescuegroups.org/http/v2.json',

  /**
   * API key for authentication (public access)
   * Set this in your .env.local file as EXPO_PUBLIC_RESCUEGROUPS_API_KEY
   * Expo automatically inlines EXPO_PUBLIC_* variables at build time
   */
  API_KEY: process.env.EXPO_PUBLIC_RESCUEGROUPS_API_KEY || '',

  /**
   * Default request timeout in milliseconds
   */
  TIMEOUT: 30000,

  /**
   * Default pagination settings
   */
  PAGINATION: {
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
    DEFAULT_START: 0,
  },

  /**
   * Search radius settings (in miles)
   */
  SEARCH_RADIUS: {
    DEFAULT: 25,
    OPTIONS: [10, 25, 50, 100, 250, 500],
  },

  /**
   * Available object types in the API
   */
  OBJECT_TYPES: {
    ANIMALS: 'animals',
    ORGANIZATIONS: 'orgs',
    EVENTS: 'events',
    CONTACTS: 'contacts',
  },

  /**
   * Common species options (user-facing display values)
   */
  SPECIES: {
    DOG: 'Dog' as AnimalSpecies,
    CAT: 'Cat' as AnimalSpecies,
    BIRD: 'Bird' as AnimalSpecies,
    RABBIT: 'Rabbit' as AnimalSpecies,
    SMALL_ANIMAL: 'Small Animal' as AnimalSpecies,
    HORSE: 'Horse' as AnimalSpecies,
    REPTILE: 'Reptile' as AnimalSpecies,
    BARNYARD: 'Barnyard' as AnimalSpecies,
  },
} as const;

/**
 * Validates that the API key is configured
 * @throws Error if API key is not set
 */
export function validateApiKey(): void {
  if (!RESCUEGROUPS_CONFIG.API_KEY) {
    throw new Error(
      'RescueGroups API key is not configured. Please set EXPO_PUBLIC_RESCUEGROUPS_API_KEY in your .env.local file.'
    );
  }
}

/**
 * Gets the API key from the configuration
 * @returns The API key string
 * @throws Error if API key is not set
 */
export function getApiKey(): string {
  validateApiKey();
  return RESCUEGROUPS_CONFIG.API_KEY;
}
