/**
 * TypeScript type definitions for RescueGroups API v2
 * Documentation: https://userguide.rescuegroups.org/display/APIDG/API+Developer+Guide
 */

import type {
  AnimalSpecies,
  Sex,
  GeneralAge,
  GeneralSizePotential,
  Altered,
  Declawed,
  Housetrained,
  OKWithKids,
  OKWithCats,
  OKWithDogs,
  OKWithAdults,
  Specialneeds,
  EnergyLevel,
  ExerciseNeeds,
  GroomingNeeds,
  Vocal,
  Fence,
} from './generated-types';

/**
 * Base API request structure
 */
export interface RescueGroupsRequest {
  /**
   * API key for authentication
   */
  apikey: string;

  /**
   * Object type to query (animals, orgs, events, contacts)
   */
  objectType: string;

  /**
   * Action to perform (search, list, publicSearch)
   */
  objectAction: string;

  /**
   * Search criteria and filters
   */
  search?: {
    /**
     * Result set configuration
     */
    resultStart?: number;
    resultLimit?: number;
    resultSort?: string;
    resultOrder?: 'asc' | 'desc';

    /**
     * Calculation mode for filters (AND, OR)
     */
    calcFoundRows?: 'Yes' | 'No';
    filters?: Filter[];
    filterProcessing?: string;

    /**
     * Fields to return in the response
     */
    fields?: string[];
  };

  /**
   * Values to set (for create/update operations)
   */
  values?: Record<string, unknown>[];
}

/**
 * Filter for search queries
 */
export interface Filter {
  /**
   * Field name to filter on
   */
  fieldName: string;

  /**
   * Operation to perform (equals, notequal, lessthan, greaterthan, contains, etc.)
   */
  operation: FilterOperation;

  /**
   * Criteria value
   */
  criteria: string | number | boolean;
}

/**
 * Available filter operations
 */
export type FilterOperation =
  | 'equals'
  | 'notequal'
  | 'lessthan'
  | 'lessthanorequal'
  | 'greaterthan'
  | 'greaterthanorequal'
  | 'contains'
  | 'notcontains'
  | 'blank'
  | 'notblank';

/**
 * Message structure from RescueGroups API
 */
export interface RescueGroupsMessage {
  /**
   * Unique message identifier
   */
  messageID: string;

  /**
   * Severity level of the message
   */
  messageCriticality: 'error' | 'warning' | 'info';

  /**
   * Human-readable message text
   */
  messageText: string;
}

/**
 * Base API response structure
 */
export interface RescueGroupsResponse<T = unknown> {
  /**
   * Status of the request
   */
  status: 'ok' | 'error' | 'warning';

  /**
   * Data returned from the API
   */
  data?: Record<string, T>;

  /**
   * Messages from the API
   */
  messages?: {
    generalMessages?: RescueGroupsMessage[];
    recordMessages?: RescueGroupsMessage[];
    errors?: Record<string, string[]>;
  };

  /**
   * Total number of results found
   */
  foundRows?: number;
}

/**
 * Animal object from RescueGroups API
 */
export interface Animal {
  animalID: string;
  animalOrgID: string;
  animalName: string;
  animalSpecies: AnimalSpecies;
  animalBreed: string;
  animalPrimaryBreed?: string;
  animalSecondaryBreed?: string;
  animalSex: Sex;
  animalGeneralAge: GeneralAge;
  animalBirthdate?: string;
  animalGeneralSizePotential?: GeneralSizePotential;
  animalColor?: string;
  animalPattern?: string;
  animalDescriptionPlain?: string;
  animalDescription?: string;
  animalDistinguishingMarks?: string;
  animalStatusID?: string;
  animalStatus?: string;
  animalLocation?: string;
  animalLocationDistance?: number;
  animalLocationCitystate?: string;
  animalPictures?: AnimalPicture[];
  animalVideos?: AnimalVideo[];
  animalThumbnailUrl?: string;
  animalUpdatedDate?: string;
  animalCreatedDate?: string;
  animalRescueID?: string;
  animalAltered?: Altered;
  animalDeclawed?: Declawed;
  animalHousetrained?: Housetrained;
  animalOKWithKids?: OKWithKids;
  animalOKWithCats?: OKWithCats;
  animalOKWithDogs?: OKWithDogs;
  animalOKWithAdults?: OKWithAdults;
  animalSpecialNeeds?: Specialneeds;
  animalSpecialNeedsDescription?: string;
  animalEnergyLevel?: EnergyLevel;
  animalExerciseNeeds?: ExerciseNeeds;
  animalGroomingNeeds?: GroomingNeeds;
  animalVocal?: Vocal;
  animalFence?: Fence;
  animalAdoptionFee?: string;
  animalUrl?: string;
}

/**
 * Animal picture object
 */
export interface AnimalPicture {
  mediaID: string;
  mediaOrder: number;
  fileSize?: string;
  resolutionX?: string;
  resolutionY?: string;
  filenameThumbnail?: string;
  filenameSmall?: string;
  filenameLarge?: string;
  urlSecureFullsize?: string;
  urlSecureThumbnail?: string;
  urlSecureSmall?: string;
  urlSecureLarge?: string;
}

/**
 * Animal video object
 */
export interface AnimalVideo {
  videoID: string;
  videoUrl: string;
  videoYouTubeVideoID?: string;
}

/**
 * Organization object from RescueGroups API
 */
export interface Organization {
  orgID: string;
  orgName: string;
  orgAddress?: string;
  orgCity?: string;
  orgState?: string;
  orgPostalcode?: string;
  orgCountry?: string;
  orgPhone?: string;
  orgEmail?: string;
  orgWebsiteUrl?: string;
  orgFacebookUrl?: string;
  orgTwitterUrl?: string;
  orgAbout?: string;
  orgDescription?: string;
  orgType?: string;
  orgDistance?: number;
  orgLocationCitystate?: string;
}

/**
 * Search parameters for animal searches
 */
export interface AnimalSearchParams {
  /**
   * Species to search for (Dog, Cat, etc.)
   */
  species?: AnimalSpecies;

  /**
   * Breed to search for
   */
  breed?: string;

  /**
   * Location (postal code) for proximity search
   */
  location?: string;

  /**
   * Search radius in miles
   */
  radius?: number;

  /**
   * Animal sex (Male, Female)
   */
  sex?: Sex;

  /**
   * General age category (Baby, Young, Adult, Senior)
   */
  age?: GeneralAge;

  /**
   * General size (Small, Medium, Large, Extra Large)
   */
  size?: GeneralSizePotential;

  /**
   * Special needs filter
   */
  specialNeeds?: boolean;

  /**
   * Organization ID to filter by specific rescue/shelter
   */
  orgID?: string;

  /**
   * Pagination
   */
  limit?: number;
  offset?: number;

  /**
   * Sort field (API field name)
   * Common options:
   * - 'animalName' - Sort by pet name
   * - 'animalUpdatedDate' - Sort by last updated date (newest/oldest)
   * - 'animalLocationDistance' - Sort by distance (requires location filter)
   */
  sort?: string;

  /**
   * Sort order
   * - 'asc' - Ascending (A-Z, oldest-newest, closest-furthest)
   * - 'desc' - Descending (Z-A, newest-oldest, furthest-closest)
   */
  order?: 'asc' | 'desc';
}

/**
 * Search result with pagination metadata
 */
export interface SearchResult<T> {
  /**
   * Results array
   */
  data: T[];

  /**
   * Total number of results found
   */
  total: number;

  /**
   * Current offset
   */
  offset: number;

  /**
   * Number of results per page
   */
  limit: number;

  /**
   * Whether there are more results
   */
  hasMore: boolean;

  /**
   * Warning messages from API
   */
  warnings?: string[];
}

/**
 * Service status enum
 */
export enum ServiceStatus {
  CONFIGURED = 'configured',
  NOT_CONFIGURED = 'not_configured',
  ERROR = 'error',
}

/**
 * Service configuration error class
 * Thrown when the service is not properly configured (e.g., missing API key)
 */
export class ServiceConfigError extends Error {
  constructor(
    message: string,
    public isDevelopment: boolean
  ) {
    super(message);
    this.name = 'ServiceConfigError';
  }
}

/**
 * API error class
 * Thrown when the API returns an error or request fails
 */
export class RescueGroupsAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'RescueGroupsAPIError';
  }
}

/**
 * Type guard to check if error is a ServiceConfigError
 */
export function isServiceConfigError(
  error: unknown
): error is ServiceConfigError {
  return (
    error instanceof Error &&
    error.name === 'ServiceConfigError' &&
    'isDevelopment' in error
  );
}

/**
 * Type guard to check if error is a RescueGroupsAPIError
 */
export function isRescueGroupsAPIError(
  error: unknown
): error is RescueGroupsAPIError {
  return (
    error instanceof Error &&
    error.name === 'RescueGroupsAPIError' &&
    'statusCode' in error
  );
}

/**
 * Extracts a user-friendly error message from any error type
 * Handles RescueGroupsAPIError with nested field errors
 */
export function getErrorMessage(
  error: Error | RescueGroupsAPIError | null | undefined | unknown
): string {
  if (!error) {
    return 'An error occurred';
  }

  // Handle plain objects (shouldn't happen but being defensive)
  if (typeof error === 'object' && !(error instanceof Error)) {
    return JSON.stringify(error);
  }

  // Check if it's actually an Error instance
  if (!(error instanceof Error)) {
    return String(error);
  }

  // Handle RescueGroupsAPIError with nested field errors
  if (isRescueGroupsAPIError(error)) {
    // If there are field-specific errors, format them
    if (error.errors && Object.keys(error.errors).length > 0) {
      const fieldErrors = Object.entries(error.errors)
        .flatMap(([field, messages]) =>
          messages.map((msg) => `${field}: ${msg}`)
        )
        .join(', ');

      // Combine main message with field errors if both exist
      if (error.message && error.message !== 'API request failed') {
        return `${error.message}. ${fieldErrors}`;
      }
      return fieldErrors;
    }

    // Return status code info if available
    if (error.statusCode && error.message) {
      return `${error.message} (${error.statusCode})`;
    }
  }

  // Standard error message - be extra defensive
  return error.message || error.toString() || 'An error occurred';
}
