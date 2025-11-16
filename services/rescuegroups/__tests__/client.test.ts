import {
  RescueGroupsClient,
  rescueGroupsClient,
} from '@/services/rescuegroups/client';
import type { RescueGroupsResponse } from '@/services/rescuegroups/types';
import { ServiceStatus } from '@/services/rescuegroups/types';
import { isConfigured } from '@/constants/RescueGroupsConfig';

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

  describe('isConfigured', () => {
    it('should return true when API key is configured', () => {
      expect(client.isConfigured()).toBe(true);
    });
  });

  describe('healthCheck', () => {
    it('should make a minimal API request for health check', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 1,
        data: {
          '12345': {
            animalID: '12345',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      await expect(client.healthCheck()).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.rescuegroups.org/http/v2.json',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"resultLimit":1'),
        })
      );
    });

    it('should throw error when health check fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.healthCheck()).rejects.toMatchObject({
        name: 'RescueGroupsAPIError',
        message: 'HTTP error: 500 Internal Server Error',
      });
    });
  });

  describe('getServiceStatus', () => {
    it('should return NOT_CONFIGURED when API key is missing', async () => {
      (isConfigured as jest.Mock).mockReturnValueOnce(false);

      const status = await client.getServiceStatus();

      expect(status).toBe(ServiceStatus.NOT_CONFIGURED);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return CONFIGURED when health check succeeds', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 1,
        data: {
          '12345': {
            animalID: '12345',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      const status = await client.getServiceStatus();

      expect(status).toBe(ServiceStatus.CONFIGURED);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should return ERROR when health check fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const status = await client.getServiceStatus();

      expect(status).toBe(ServiceStatus.ERROR);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should cache status for 60 seconds', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 1,
        data: {
          '12345': {
            animalID: '12345',
          },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      // First call
      const status1 = await client.getServiceStatus();
      expect(status1).toBe(ServiceStatus.CONFIGURED);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call (should use cache)
      const status2 = await client.getServiceStatus();
      expect(status2).toBe(ServiceStatus.CONFIGURED);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const mockResponseData: RescueGroupsResponse<Record<string, unknown>> = {
        status: 'ok',
        foundRows: 1,
        data: {
          '12345': {
            animalID: '12345',
          },
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      });

      // First call
      const status1 = await client.getServiceStatus();
      expect(status1).toBe(ServiceStatus.CONFIGURED);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with forceRefresh
      const status2 = await client.getServiceStatus(true);
      expect(status2).toBe(ServiceStatus.CONFIGURED);
      expect(mockFetch).toHaveBeenCalledTimes(2); // Additional call made
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
