/**
 * TypeScript type definitions for RescueGroups API v2
 * Documentation: https://userguide.rescuegroups.org/display/APIDG/API+Developer+Guide
 */

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
  animalSpecies: string;
  animalBreed: string;
  animalPrimaryBreed?: string;
  animalSecondaryBreed?: string;
  animalSex: string;
  animalGeneralAge: string;
  animalBirthdate?: string;
  animalGeneralSizePotential?: string;
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
  animalAltered?: string;
  animalDeclawed?: string;
  animalHousetrained?: string;
  animalOKWithKids?: string;
  animalOKWithCats?: string;
  animalOKWithDogs?: string;
  animalOKWithAdults?: string;
  animalSpecialNeeds?: string;
  animalSpecialNeedsDescription?: string;
  animalEnergyLevel?: string;
  animalExerciseNeeds?: string;
  animalGroomingNeeds?: string;
  animalVocal?: string;
  animalFence?: string;
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
  species?: string;

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
  sex?: string;

  /**
   * General age category (Baby, Young, Adult, Senior)
   */
  age?: string;

  /**
   * General size (Small, Medium, Large, Extra Large)
   */
  size?: string;

  /**
   * Special needs filter
   */
  specialNeeds?: boolean;

  /**
   * Pagination
   */
  limit?: number;
  offset?: number;

  /**
   * Sort field
   */
  sort?: string;

  /**
   * Sort order
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
 * API error class
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
