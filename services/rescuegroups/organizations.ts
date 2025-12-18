import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { rescueGroupsClient } from './client';
import type {
  Organization,
  RescueGroupsResponse,
  Animal,
  SearchResult,
} from './types';

/**
 * Organization fields to request from the API
 * Reference: https://userguide.rescuegroups.org/display/APIDG/Organizations
 */
const ORGANIZATION_FIELDS = [
  // Core identification
  'orgID',
  'orgName',
  'orgType',

  // Location
  'orgLocationCityState',
  'orgAddress',
  'orgCity',
  'orgState',
  'orgPostalCode',
  'orgCountry',

  // Contact information
  'orgPhone',
  'orgEmail',
  'orgWebsiteUrl',

  // Social media
  'orgFacebookUrl',
  'orgTwitterUrl',

  // Description
  'orgAbout',
];

/**
 * Service for organization-related API operations
 */
export class OrganizationService {
  /**
   * Searches for organizations with pagination
   * @param limit - Maximum number of organizations to return (default: 100)
   * @param offset - Starting offset for pagination (default: 0)
   * @returns SearchResult with organizations
   */
  async searchOrganizations(
    limit: number = 100,
    offset: number = 0
  ): Promise<SearchResult<Organization>> {
    const response = await rescueGroupsClient.request<Organization>({
      objectType: RESCUEGROUPS_CONFIG.OBJECT_TYPES.ORGANIZATIONS,
      objectAction: 'publicSearch',
      search: {
        resultStart: offset,
        resultLimit: limit,
        resultSort: 'orgName',
        resultOrder: 'asc',
        calcFoundRows: 'Yes',
        fields: ORGANIZATION_FIELDS,
      },
    });

    const organizations = this.extractOrganizations(response);
    const total = response.foundRows || organizations.length;

    return {
      data: organizations,
      total,
      offset,
      limit,
      hasMore: offset + organizations.length < total,
    };
  }

  /**
   * Gets a single organization by ID
   * @param orgId - The organization ID
   * @returns The organization object or null if not found
   */
  async getOrganizationById(orgId: string): Promise<Organization | null> {
    const response = await rescueGroupsClient.request<Organization>({
      objectType: RESCUEGROUPS_CONFIG.OBJECT_TYPES.ORGANIZATIONS,
      objectAction: 'publicSearch',
      search: {
        resultStart: 0,
        resultLimit: 1,
        calcFoundRows: 'No',
        filters: [
          {
            fieldName: 'orgID',
            operation: 'equals',
            criteria: orgId,
          },
        ],
        fields: ORGANIZATION_FIELDS,
      },
    });

    const organizations = this.extractOrganizations(response);
    return organizations.length > 0 ? organizations[0] : null;
  }

  /**
   * Gets animals belonging to a specific organization
   * @param orgId - The organization ID
   * @param limit - Maximum number of animals to return (default: 20)
   * @param offset - Starting offset for pagination (default: 0)
   * @returns SearchResult with animals from the organization
   */
  async getAnimalsByOrgId(
    orgId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult<Animal>> {
    const response = await rescueGroupsClient.request<Animal>({
      objectType: RESCUEGROUPS_CONFIG.OBJECT_TYPES.ANIMALS,
      objectAction: 'publicSearch',
      search: {
        resultStart: offset,
        resultLimit: limit,
        calcFoundRows: 'Yes',
        filters: [
          {
            fieldName: 'animalOrgID',
            operation: 'equals',
            criteria: orgId,
          },
          {
            fieldName: 'animalStatus',
            operation: 'equals',
            criteria: 'Available',
          },
        ],
        fields: [
          // Core fields
          'animalID',
          'animalName',
          'animalSpecies',
          'animalBreed',
          'animalGeneralAge',
          'animalSex',
          'animalGeneralSizePotential',
          'animalColor',
          'animalCitystate',
          'animalLocationDistance',
          'animalOrgID',
          // Pictures
          'animalPictures',
        ],
      },
    });

    const animals = this.extractAnimals(response);
    const total = response.foundRows || animals.length;

    return {
      data: animals,
      total,
      offset,
      limit,
      hasMore: offset + animals.length < total,
    };
  }

  /**
   * Extracts organizations array from API response
   */
  private extractOrganizations(
    response: RescueGroupsResponse<Organization>
  ): Organization[] {
    if (!response.data) {
      return [];
    }

    return Object.values(response.data);
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
}

/**
 * Singleton instance of the organization service
 */
export const organizationService = new OrganizationService();
