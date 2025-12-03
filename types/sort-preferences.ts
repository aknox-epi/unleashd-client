/**
 * Sort preference types for animal search results
 */

/**
 * Available sort options for animal search
 */
export enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  DISTANCE_NEAR = 'distance_near',
  DISTANCE_FAR = 'distance_far',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

/**
 * User-facing labels for sort options
 */
export const SORT_LABELS: Record<SortOption, string> = {
  [SortOption.NEWEST]: 'Newest First',
  [SortOption.OLDEST]: 'Oldest First',
  [SortOption.DISTANCE_NEAR]: 'Closest First',
  [SortOption.DISTANCE_FAR]: 'Furthest First',
  [SortOption.NAME_ASC]: 'Name (A-Z)',
  [SortOption.NAME_DESC]: 'Name (Z-A)',
};

/**
 * Maps sort options to API field names and order
 */
export interface SortFieldMapping {
  field: string;
  order: 'asc' | 'desc';
}

export const SORT_FIELD_MAPPING: Record<SortOption, SortFieldMapping> = {
  [SortOption.NEWEST]: { field: 'animalUpdatedDate', order: 'desc' },
  [SortOption.OLDEST]: { field: 'animalUpdatedDate', order: 'asc' },
  [SortOption.DISTANCE_NEAR]: { field: 'animalLocationDistance', order: 'asc' },
  [SortOption.DISTANCE_FAR]: { field: 'animalLocationDistance', order: 'desc' },
  [SortOption.NAME_ASC]: { field: 'animalName', order: 'asc' },
  [SortOption.NAME_DESC]: { field: 'animalName', order: 'desc' },
};

/**
 * Sort options that require location filter to be active
 */
export const LOCATION_DEPENDENT_SORTS: SortOption[] = [
  SortOption.DISTANCE_NEAR,
  SortOption.DISTANCE_FAR,
];

/**
 * User's sort preferences
 */
export interface SortPreferences {
  selectedSort: SortOption;
}

/**
 * Stored sort data structure (includes version for migrations)
 */
export interface StoredSortData {
  version: number;
  selectedSort: SortOption;
  lastUpdated: number;
}

/**
 * Sort preferences context state
 */
export interface SortPreferencesContextState {
  preferences: SortPreferences;
  updatePreferences: (updates: Partial<SortPreferences>) => Promise<void>;
  clearPreferences: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Helper to check if a sort option requires location
 */
export function requiresLocation(sortOption: SortOption): boolean {
  return LOCATION_DEPENDENT_SORTS.includes(sortOption);
}

/**
 * Helper to get sort field and order for API
 */
export function getSortFieldMapping(sortOption: SortOption): SortFieldMapping {
  return SORT_FIELD_MAPPING[sortOption];
}

/**
 * Helper to get sort option from label (for reverse lookup)
 */
export function getSortOptionFromLabel(label: string): SortOption | undefined {
  return Object.entries(SORT_LABELS).find(
    ([, sortLabel]) => sortLabel === label
  )?.[0] as SortOption | undefined;
}
