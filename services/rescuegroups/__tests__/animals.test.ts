import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { rescueGroupsClient } from '@/services/rescuegroups/client';
import { AnimalService, animalService } from '@/services/rescuegroups/animals';
import type {
  Animal,
  AnimalSearchParams,
  RescueGroupsResponse,
  SearchResult,
} from '@/services/rescuegroups/types';

// Mock the client
jest.mock('@/services/rescuegroups/client', () => ({
  rescueGroupsClient: {
    request: jest.fn(),
  },
}));

describe('AnimalService', () => {
  let service: AnimalService;
  let mockRequest: jest.MockedFunction<typeof rescueGroupsClient.request>;

  beforeEach(() => {
    service = new AnimalService();
    mockRequest = rescueGroupsClient.request as jest.MockedFunction<
      typeof rescueGroupsClient.request
    >;
    jest.clearAllMocks();
  });

  describe('searchAnimals', () => {
    const mockAnimalData: Record<string, Animal> = {
      '12345': {
        animalID: '12345',
        animalName: 'Buddy',
        animalOrgID: 'org-1',
        animalSpecies: 'Dog',
        animalBreed: 'Labrador Retriever',
        animalSex: 'Male',
        animalGeneralAge: 'Adult',
        animalLocationCitystate: 'Los Angeles, CA',
      },
      '67890': {
        animalID: '67890',
        animalName: 'Whiskers',
        animalOrgID: 'org-2',
        animalSpecies: 'Cat',
        animalBreed: 'Domestic Shorthair',
        animalSex: 'Female',
        animalGeneralAge: 'Young',
        animalLocationCitystate: 'San Francisco, CA',
      },
    };

    it('should search animals with default parameters', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 2,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result: SearchResult<Animal> = await service.searchAnimals();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(RESCUEGROUPS_CONFIG.PAGINATION.DEFAULT_LIMIT);
      expect(result.hasMore).toBe(false);
      expect(result.warnings).toBeUndefined();

      expect(mockRequest).toHaveBeenCalledWith({
        objectType: 'animals',
        objectAction: 'publicSearch',
        search: {
          resultStart: 0,
          resultLimit: 25,
          resultSort: 'animalName',
          resultOrder: 'asc',
          calcFoundRows: 'Yes',
          filters: [
            {
              fieldName: 'animalStatus',
              operation: 'equals',
              criteria: 'Available',
            },
          ],
          filterProcessing: '1',
          fields: expect.any(Array),
        },
      });
    });

    it('should filter by species', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { species: 'Dog' };
      const result = await service.searchAnimals(params);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].animalSpecies).toBe('Dog');

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalSpecies',
        operation: 'equals',
        criteria: 'Dog',
      });
    });

    it('should filter by breed', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { breed: 'Labrador' };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalBreed',
        operation: 'contains',
        criteria: 'Labrador',
      });
    });

    it('should filter by location and radius', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 2,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { location: '90001', radius: 50 };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalLocation',
        operation: 'equals',
        criteria: '90001',
      });
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalLocationDistance',
        operation: 'lessthanorequal',
        criteria: 50,
      });
    });

    it('should use default radius when location is provided without radius', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { location: '90001' };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalLocationDistance',
        operation: 'lessthanorequal',
        criteria: RESCUEGROUPS_CONFIG.SEARCH_RADIUS.DEFAULT,
      });
    });

    it('should filter by sex', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { sex: 'Male' };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalSex',
        operation: 'equals',
        criteria: 'Male',
      });
    });

    it('should filter by age', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { age: 'Adult' };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalGeneralAge',
        operation: 'equals',
        criteria: 'Adult',
      });
    });

    it('should filter by size', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { size: 'Large' };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalGeneralSizePotential',
        operation: 'equals',
        criteria: 'Large',
      });
    });

    it('should filter by special needs (true)', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { specialNeeds: true };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalSpecialNeeds',
        operation: 'equals',
        criteria: '1',
      });
    });

    it('should filter by special needs (false)', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { specialNeeds: false };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalSpecialNeeds',
        operation: 'equals',
        criteria: '0',
      });
    });

    it('should always filter for available animals', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 2,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      await service.searchAnimals({});

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toContainEqual({
        fieldName: 'animalStatus',
        operation: 'equals',
        criteria: 'Available',
      });
    });

    it('should handle pagination parameters', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 100,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { limit: 50, offset: 25 };
      const result = await service.searchAnimals(params);

      expect(result.offset).toBe(25);
      expect(result.limit).toBe(50);
      expect(result.hasMore).toBe(true);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.resultStart).toBe(25);
      expect(callArgs.search?.resultLimit).toBe(50);
    });

    it('should enforce maximum limit', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 200,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = { limit: 200 };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.resultLimit).toBe(
        RESCUEGROUPS_CONFIG.PAGINATION.MAX_LIMIT
      );
    });

    it('should handle sort and order parameters', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 2,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = {
        sort: 'animalGeneralAge',
        order: 'desc',
      };
      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.resultSort).toBe('animalGeneralAge');
      expect(callArgs.search?.resultOrder).toBe('desc');
    });

    it('should handle multiple filters together', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimalData['12345'] },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const params: AnimalSearchParams = {
        species: 'Dog',
        breed: 'Labrador',
        location: '90001',
        radius: 50,
        sex: 'Male',
        age: 'Adult',
        size: 'Large',
        specialNeeds: false,
      };

      await service.searchAnimals(params);

      const callArgs = mockRequest.mock.calls[0][0];
      expect(callArgs.search?.filters).toHaveLength(9); // 8 filters + status
      expect(callArgs.search?.filterProcessing).toBe('1 2 3 4 5 6 7 8 9');
    });

    it('should calculate hasMore correctly when there are more results', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 100,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.searchAnimals({ limit: 25, offset: 0 });

      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(100);
    });

    it('should calculate hasMore correctly when on last page', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 27,
        data: mockAnimalData,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.searchAnimals({ limit: 25, offset: 25 });

      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(27);
    });

    it('should handle empty results', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 0,
        data: {},
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.searchAnimals();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should handle missing data field in response', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 0,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.searchAnimals();

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should extract warnings from API response', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'warning',
        foundRows: 0,
        data: {},
        messages: {
          generalMessages: [
            {
              messageID: '1',
              messageCriticality: 'warning',
              messageText: 'No results found in your area',
            },
            {
              messageID: '2',
              messageCriticality: 'warning',
              messageText: 'Try expanding your search radius',
            },
          ],
        },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.searchAnimals();

      expect(result.warnings).toEqual([
        'No results found in your area',
        'Try expanding your search radius',
      ]);
    });

    it('should not include warnings when status is ok', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 2,
        data: mockAnimalData,
        messages: {
          generalMessages: [
            {
              messageID: '1',
              messageCriticality: 'info',
              messageText: 'Some info message',
            },
          ],
        },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.searchAnimals();

      expect(result.warnings).toBeUndefined();
    });
  });

  describe('getAnimalById', () => {
    it('should fetch animal by ID', async () => {
      const mockAnimal: Animal = {
        animalID: '12345',
        animalName: 'Buddy',
        animalOrgID: 'org-1',
        animalSpecies: 'Dog',
        animalBreed: 'Labrador Retriever',
        animalSex: 'Male',
        animalGeneralAge: 'Adult',
        animalLocationCitystate: 'Los Angeles, CA',
      };

      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 1,
        data: { '12345': mockAnimal },
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.getAnimalById('12345');

      expect(result).toEqual(mockAnimal);
      expect(mockRequest).toHaveBeenCalledWith({
        objectType: 'animals',
        objectAction: 'publicSearch',
        search: {
          resultStart: 0,
          resultLimit: 1,
          calcFoundRows: 'No',
          filters: [
            {
              fieldName: 'animalID',
              operation: 'equals',
              criteria: '12345',
            },
          ],
          fields: expect.any(Array),
        },
      });
    });

    it('should return null when animal is not found', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 0,
        data: {},
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.getAnimalById('99999');

      expect(result).toBeNull();
    });

    it('should return null when data field is missing', async () => {
      const mockResponse: RescueGroupsResponse<Animal> = {
        status: 'ok',
        foundRows: 0,
      };

      mockRequest.mockResolvedValueOnce(mockResponse);

      const result = await service.getAnimalById('99999');

      expect(result).toBeNull();
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton service instance', () => {
      expect(animalService).toBeInstanceOf(AnimalService);
    });

    it('should reuse the same singleton instance', () => {
      const instance1 = animalService;
      const instance2 = animalService;

      expect(instance1).toBe(instance2);
    });
  });
});
