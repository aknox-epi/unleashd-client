/**
 * Species preference types for animal search
 */

import type { AnimalSpecies } from '@/services/rescuegroups';

/**
 * User's species preferences
 */
export interface SpeciesPreferences {
  defaultSpecies: AnimalSpecies;
}

/**
 * Stored species data structure (includes version for migrations)
 */
export interface StoredSpeciesData {
  version: number;
  defaultSpecies: AnimalSpecies;
  lastUpdated: number;
}

/**
 * Species preferences context state
 */
export interface SpeciesPreferencesContextState {
  preferences: SpeciesPreferences;
  updatePreferences: (updates: Partial<SpeciesPreferences>) => Promise<void>;
  clearPreferences: () => Promise<void>;
  isLoading: boolean;
}
