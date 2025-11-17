import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { rescueGroupsClient } from '@/services/rescuegroups/client';
import {
  OrganizationService,
  organizationService,
} from '@/services/rescuegroups/organizations';
import type {
  Organization,
  RescueGroupsResponse,
} from '@/services/rescuegroups/types';

// Mock the client
jest.mock('@/services/rescuegroups/client', () => ({
  rescueGroupsClient: {
    request: jest.fn(),
  },
}));

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockRequest: jest.MockedFunction<typeof rescueGroupsClient.request>;

  beforeEach(() => {
    service = new OrganizationService();
    mockRequest = rescueGroupsClient.request as jest.MockedFunction<
      typeof rescueGroupsClient.request
    >;
    jest.clearAllMocks();
  });

  describe('getOrganizationById', () => {
    const mockOrganization: Organization = {
      orgID: 'org-123',
      orgName: 'Happy Paws Rescue',
      orgType: 'Rescue',
      orgLocationCitystate: 'Los Angeles, CA',
      orgAddress: '123 Main Street',
      orgCity: 'Los Angeles',
      orgState: 'CA',
      orgPostalcode: '90001',
      orgCountry: 'US',
      orgPhone: '555-0123',
      orgEmail: 'contact@happypaws.org',
      orgWebsiteUrl: 'https://happypaws.org',
      orgFacebookUrl: 'https://facebook.com/happypaws',
      orgTwitterUrl: 'https://twitter.com/happypaws',
      orgAbout: 'Dedicated to finding homes for rescue animals',
      orgDescription: 'We are a nonprofit rescue organization...',
    };

    it('should fetch organization by ID successfully', async () => {
      const mockResponse: RescueGroupsResponse<Organization> = {
        status: 'ok',
        data: {
          'org-123': mockOrganization,
        },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.getOrganizationById('org-123');

      expect(result).toEqual(mockOrganization);
      expect(mockRequest).toHaveBeenCalledWith({
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
              criteria: 'org-123',
            },
          ],
          fields: expect.any(Array),
        },
      });
    });

    it('should return null when organization not found', async () => {
      const mockResponse: RescueGroupsResponse<Organization> = {
        status: 'ok',
        data: {},
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.getOrganizationById('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when data is undefined', async () => {
      const mockResponse: RescueGroupsResponse<Organization> = {
        status: 'ok',
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.getOrganizationById('org-123');

      expect(result).toBeNull();
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Network error');
      mockRequest.mockRejectedValueOnce(error);

      await expect(service.getOrganizationById('org-123')).rejects.toThrow(
        'Network error'
      );
    });

    it('should request the correct organization fields', async () => {
      const mockResponse: RescueGroupsResponse<Organization> = {
        status: 'ok',
        data: { 'org-123': mockOrganization },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      await service.getOrganizationById('org-123');

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.fields).toEqual(
        expect.arrayContaining([
          'orgID',
          'orgName',
          'orgType',
          'orgLocationCitystate',
          'orgAddress',
          'orgCity',
          'orgState',
          'orgPostalcode',
          'orgCountry',
          'orgPhone',
          'orgEmail',
          'orgWebsiteUrl',
          'orgFacebookUrl',
          'orgTwitterUrl',
          'orgAbout',
          'orgDescription',
        ])
      );
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(organizationService).toBeInstanceOf(OrganizationService);
    });

    it('should use the same singleton instance', () => {
      expect(organizationService).toBe(organizationService);
    });
  });
});
