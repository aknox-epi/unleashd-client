import {
  RescueGroupsClient,
  rescueGroupsClient,
} from '@/services/rescuegroups/client';
import type { RescueGroupsResponse } from '@/services/rescuegroups/types';
import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';

// Mock the config module
jest.mock('@/constants/RescueGroupsConfig', () => ({
  RESCUEGROUPS_CONFIG: {
    API_ENDPOINT: 'https://api.rescuegroups.org/http/v2.json',
    TIMEOUT: 30000,
    SPECIES: {
      DOG: 'dog',
      CAT: 'cat',
      BIRD: 'bird',
      RABBIT: 'rabbit',
      SMALL_FURRY: 'small&furry',
      HORSE: 'horse',
      REPTILE: 'reptile',
      BARNYARD: 'barnyard',
    },
  },
  getApiKey: jest.fn(() => 'test-api-key'),
  isConfigured: jest.fn(() => true),
}));

describe('RescueGroupsClient', () => {
  let client: RescueGroupsClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    client = new RescueGroupsClient();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    jest.clearAllMocks();

    // Mock console methods to avoid noise in test output
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance with correct configuration', () => {
      expect(client).toBeInstanceOf(RescueGroupsClient);
    });
  });

  describe('request', () => {
    const mockRequest = {
      objectType: 'animals',
      objectAction: 'publicSearch',
      search: {
        resultStart: 0,
        resultLimit: 25,
      },
    };

    it('should make a successful API request', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 1,
        data: {
          '12345': {
            animalID: '12345',
            animalName: 'Buddy',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await client.request(mockRequest);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rescuegroups.org/http/v2.json',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...mockRequest,
            apikey: 'test-api-key',
          }),
          signal: expect.any(AbortSignal),
        }
      );
    });

    it('should include API key in request payload', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 0,
        data: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      await client.request(mockRequest);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.apikey).toBe('test-api-key');
      expect(requestBody.objectType).toBe('animals');
      expect(requestBody.objectAction).toBe('publicSearch');
    });

    it('should throw error when HTTP response is not ok (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'HTTP error: 404 Not Found',
        statusCode: 404,
      });
    });

    it('should throw error when HTTP response is not ok (5xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'HTTP error: 500 Internal Server Error',
        statusCode: 500,
      });
    });

    it('should throw error when API returns error status', async () => {
      const mockErrorResponse: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'error',
        foundRows: 0,
        data: {},
        messages: {
          generalMessages: [
            {
              messageID: '1',
              messageCriticality: 'error',
              messageText: 'Invalid API key',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockErrorResponse,
      });

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'Invalid API key',
      });
    });

    it('should handle multiple error messages in API response', async () => {
      const mockErrorResponse: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'error',
        foundRows: 0,
        data: {},
        messages: {
          generalMessages: [
            {
              messageID: '1',
              messageCriticality: 'error',
              messageText: 'Error 1',
            },
            {
              messageID: '2',
              messageCriticality: 'error',
              messageText: 'Error 2',
            },
          ],
          recordMessages: [
            {
              messageID: '3',
              messageCriticality: 'error',
              messageText: 'Record error',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockErrorResponse,
      });

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'Error 1; Error 2; Record error',
      });
    });

    it('should handle field-specific errors in API response', async () => {
      const mockErrorResponse: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'error',
        foundRows: 0,
        data: {},
        messages: {
          errors: {
            animalSpecies: ['Invalid species'],
            animalBreed: ['Breed not found'],
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockErrorResponse,
      });

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: expect.stringContaining('animalSpecies: Invalid species'),
        errors: {
          animalSpecies: ['Invalid species'],
          animalBreed: ['Breed not found'],
        },
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'Network error: Network failure',
      });
    });

    it('should handle timeout errors', async () => {
      // Mock a timeout by simulating AbortError
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'Request timeout',
        statusCode: 408,
      });
    });

    it('should handle unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('non-error object');

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'Unknown error occurred',
      });
    });

    it('should not re-wrap RescueGroupsAPIError', async () => {
      const apiError = new Error('Custom API error') as Error & {
        name: string;
        statusCode?: number;
      };
      apiError.name = 'RescueGroupsAPIError';
      apiError.statusCode = 400;

      mockFetch.mockRejectedValueOnce(apiError);

      await expect(client.request(mockRequest)).rejects.toEqual(apiError);
    });

    it('should log debug information for successful requests', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 2,
        data: {
          '1': {
            animalID: '1',
            animalSpecies: RESCUEGROUPS_CONFIG.SPECIES.DOG,
          },
          '2': {
            animalID: '2',
            animalSpecies: RESCUEGROUPS_CONFIG.SPECIES.CAT,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      await client.request(mockRequest);

      expect(console.log).toHaveBeenCalledWith(
        '[RescueGroups API] Request:',
        expect.any(String)
      );
      expect(console.log).toHaveBeenCalledWith(
        '[RescueGroups API] Response status:',
        'ok'
      );
      expect(console.log).toHaveBeenCalledWith(
        '[RescueGroups API] Found rows:',
        2
      );
      expect(console.log).toHaveBeenCalledWith(
        '[RescueGroups API] Records returned:',
        2
      );
    });

    it('should log warning messages from API response', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 0,
        data: {},
        messages: {
          generalMessages: [
            {
              messageID: '1',
              messageCriticality: 'warning',
              messageText: 'No results found',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      await client.request(mockRequest);

      expect(console.warn).toHaveBeenCalledWith(
        '[RescueGroups API] Messages:',
        ['No results found']
      );
    });

    it('should handle response with no data', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 0,
        data: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const result = await client.request(mockRequest);

      expect(result).toEqual(mockResponseData);
      expect(result.foundRows).toBe(0);
    });

    it('should handle default error message when API returns no messages', async () => {
      const mockErrorResponse: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'error',
        foundRows: 0,
        data: {},
        messages: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockErrorResponse,
      });

      await expect(client.request(mockRequest)).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'API request failed with no error message',
      });
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton client instance', () => {
      expect(rescueGroupsClient).toBeInstanceOf(RescueGroupsClient);
    });

    it('should reuse the same singleton instance', () => {
      const instance1 = rescueGroupsClient;
      const instance2 = rescueGroupsClient;

      expect(instance1).toBe(instance2);
    });
  });
});
