import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { rescueGroupsClient } from './client';
import type {
  Animal,
  AnimalSearchParams,
  Filter,
  RescueGroupsResponse,
  SearchResult,
} from './types';

/**
 * Animal fields to request from the API for list/search views
 * Only requesting fields that are displayed in the UI to optimize payload size
 * Reference: https://userguide.rescuegroups.org/display/APIDG/Animals
 */
const ANIMAL_FIELDS = [
  // Core identification
  'animalID',
  'animalName',

  // Basic info displayed in cards
  'animalSpecies',
  'animalBreed',
  'animalSex',
  'animalGeneralAge',

  // Location
  'animalLocationCitystate',
  'animalLocationDistance', // Distance from search location (when location filter is used)

  // Media (images)
  'animalPictures',
  'animalThumbnailUrl',
];

/**
 * Extended animal fields for detail view
 * Includes all list fields plus additional detail information
 */
const ANIMAL_DETAIL_FIELDS = [
  ...ANIMAL_FIELDS,
  // Description
  'animalDescriptionPlain',

  // Physical attributes
  'animalColor',
  'animalGeneralSizePotential',
  'animalPrimaryBreed',
  'animalSecondaryBreed',

  // Health & behavior
  'animalAltered',
  'animalDeclawed',
  'animalHousetrained',

  // Compatibility
  'animalOKWithKids',
  'animalOKWithCats',
  'animalOKWithDogs',
  'animalOKWithAdults',

  // Special needs
  'animalSpecialNeeds',
  'animalSpecialNeedsDescription',

  // Temperament
  'animalEnergyLevel',
  'animalExerciseNeeds',
  'animalGroomingNeeds',
  'animalVocal',
  'animalFence',

  // Adoption info
  'animalAdoptionFee',

  // Media
  'animalVideos',

  // Organization & Contact
  'animalOrgID',
  'animalUrl',

  // Additional details
  'animalBirthdate',
  'animalUpdatedDate',
];

/**
 * Service for animal-related API operations
 */
export class AnimalService {
  /**
   * Searches for animals based on the provided parameters
   * @param params - Search parameters
   * @returns Search results with animals and pagination info
   */
  async searchAnimals(
    params: AnimalSearchParams = {}
  ): Promise<SearchResult<Animal>> {
    const {
      species,
      breed,
      location,
      radius = RESCUEGROUPS_CONFIG.SEARCH_RADIUS.DEFAULT,
      sex,
      age,
      size,
      specialNeeds,
      limit = RESCUEGROUPS_CONFIG.PAGINATION.DEFAULT_LIMIT,
      offset = RESCUEGROUPS_CONFIG.PAGINATION.DEFAULT_START,
      sort = 'animalName',
      order = 'asc',
    } = params;

    // Build filters based on search parameters
    const filters: Filter[] = [];

    if (species) {
      // API expects proper case species names like 'Dog', 'Cat', not lowercase
      filters.push({
        fieldName: 'animalSpecies',
        operation: 'equals',
        criteria: species,
      });
    }

    if (breed) {
      filters.push({
        fieldName: 'animalBreed',
        operation: 'contains',
        criteria: breed,
      });
    }

    if (location) {
      filters.push({
        fieldName: 'animalLocation',
        operation: 'equals',
        criteria: location,
      });

      filters.push({
        fieldName: 'animalLocationDistance',
        operation: 'lessthanorequal',
        criteria: radius,
      });
    }

    if (sex) {
      filters.push({
        fieldName: 'animalSex',
        operation: 'equals',
        criteria: sex,
      });
    }

    if (age) {
      filters.push({
        fieldName: 'animalGeneralAge',
        operation: 'equals',
        criteria: age,
      });
    }

    if (size) {
      filters.push({
        fieldName: 'animalGeneralSizePotential',
        operation: 'equals',
        criteria: size,
      });
    }

    if (specialNeeds !== undefined) {
      filters.push({
        fieldName: 'animalSpecialNeeds',
        operation: 'equals',
        criteria: specialNeeds ? '1' : '0',
      });
    }

    // Always filter for available animals
    filters.push({
      fieldName: 'animalStatus',
      operation: 'equals',
      criteria: 'Available',
    });

    const response = await rescueGroupsClient.request<Animal>({
      objectType: RESCUEGROUPS_CONFIG.OBJECT_TYPES.ANIMALS,
      objectAction: 'publicSearch',
      search: {
        resultStart: offset,
        resultLimit: Math.min(limit, RESCUEGROUPS_CONFIG.PAGINATION.MAX_LIMIT),
        resultSort: sort,
        resultOrder: order,
        calcFoundRows: 'Yes',
        filters,
        fields: ANIMAL_FIELDS,
      },
    });

    return this.parseSearchResponse(response, offset, limit);
  }

  /**
   * Gets a single animal by ID with full detail fields
   * @param animalId - The animal ID
   * @returns The animal object or null if not found
   */
  async getAnimalById(animalId: string): Promise<Animal | null> {
    const response = await rescueGroupsClient.request<Animal>({
      objectType: RESCUEGROUPS_CONFIG.OBJECT_TYPES.ANIMALS,
      objectAction: 'publicSearch',
      search: {
        resultStart: 0,
        resultLimit: 1,
        calcFoundRows: 'No',
        filters: [
          {
            fieldName: 'animalID',
            operation: 'equals',
            criteria: animalId,
          },
        ],
        fields: ANIMAL_DETAIL_FIELDS,
      },
    });

    const animals = this.extractAnimals(response);
    return animals.length > 0 ? animals[0] : null;
  }

  /**
   * Parses the API response into a SearchResult
   */
  private parseSearchResponse(
    response: RescueGroupsResponse<Animal>,
    offset: number,
    limit: number
  ): SearchResult<Animal> {
    const animals = this.extractAnimals(response);
    const total = response.foundRows || 0;
    const warnings = this.extractWarnings(response);

    return {
      data: animals,
      total,
      offset,
      limit,
      hasMore: offset + animals.length < total,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Extracts animals array from API response
   */
  private extractAnimals(response: RescueGroupsResponse<Animal>): Animal[] {
    if (!response.data) {
      return [];
    }

    return Object.values(response.data);
  }

  /**
   * Extracts warning messages from API response
   */
  private extractWarnings(response: RescueGroupsResponse<Animal>): string[] {
    const warnings: string[] = [];

    if (response.status === 'warning' && response.messages?.generalMessages) {
      warnings.push(
        ...response.messages.generalMessages.map((msg) => msg.messageText)
      );
    }

    return warnings;
  }
}

/**
 * Singleton instance of the animal service
 */
export const animalService = new AnimalService();
