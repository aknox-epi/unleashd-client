import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { rescueGroupsClient } from './client';
import type { Organization, RescueGroupsResponse } from './types';

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
  'orgLocationCitystate',
  'orgAddress',
  'orgCity',
  'orgState',
  'orgPostalcode',
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
  'orgDescription',
];

/**
 * Service for organization-related API operations
 */
export class OrganizationService {
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
}

/**
 * Singleton instance of the organization service
 */
export const organizationService = new OrganizationService();
