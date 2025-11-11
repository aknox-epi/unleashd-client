import {
  RESCUEGROUPS_CONFIG,
  getApiKey,
  isConfigured,
} from '@/constants/RescueGroupsConfig';
import { ServiceConfigError, ServiceStatus } from './types';
import type {
  RescueGroupsRequest,
  RescueGroupsResponse,
  RescueGroupsAPIError,
} from './types';

/**
 * Base client for RescueGroups API v2
 * Handles HTTP requests, authentication, and error handling
 */
export class RescueGroupsClient {
  private readonly apiEndpoint: string;
  private readonly timeout: number;
  private statusCache: {
    status: ServiceStatus;
    lastChecked: number;
    ttl: number;
  } = {
    status: ServiceStatus.NOT_CONFIGURED,
    lastChecked: 0,
    ttl: 60000, // Cache for 60 seconds
  };

  constructor() {
    this.apiEndpoint = RESCUEGROUPS_CONFIG.API_ENDPOINT;
    this.timeout = RESCUEGROUPS_CONFIG.TIMEOUT;
  }

  /**
   * Checks if the service is properly configured
   * @returns true if API key is set, false otherwise
   */
  isConfigured(): boolean {
    return isConfigured();
  }

  /**
   * Gets the current service status with caching
   * @param forceRefresh - If true, bypasses cache and performs fresh check
   * @returns The current service status
   */
  async getServiceStatus(forceRefresh = false): Promise<ServiceStatus> {
    // Return cached status if still valid
    const now = Date.now();
    if (
      !forceRefresh &&
      this.statusCache.lastChecked > 0 &&
      now - this.statusCache.lastChecked < this.statusCache.ttl
    ) {
      return this.statusCache.status;
    }

    // Check configuration
    if (!this.isConfigured()) {
      this.statusCache = {
        status: ServiceStatus.NOT_CONFIGURED,
        lastChecked: now,
        ttl: this.statusCache.ttl,
      };
      return ServiceStatus.NOT_CONFIGURED;
    }

    // Perform health check
    try {
      await this.healthCheck();
      this.statusCache = {
        status: ServiceStatus.CONFIGURED,
        lastChecked: now,
        ttl: this.statusCache.ttl,
      };
      return ServiceStatus.CONFIGURED;
    } catch {
      this.statusCache = {
        status: ServiceStatus.ERROR,
        lastChecked: now,
        ttl: this.statusCache.ttl,
      };
      return ServiceStatus.ERROR;
    }
  }

  /**
   * Performs a health check by making a minimal API request
   * @throws ServiceConfigError if not configured
   * @throws RescueGroupsAPIError if health check fails
   */
  async healthCheck(): Promise<void> {
    // Minimal request to verify API connectivity
    await this.request({
      objectType: 'animals',
      objectAction: 'publicSearch',
      search: {
        resultStart: 0,
        resultLimit: 1,
        resultSort: 'animalID',
        resultOrder: 'asc',
        filters: [],
        fields: ['animalID'],
      },
    });
  }

  /**
   * Makes a request to the RescueGroups API
   * @param request - The request payload
   * @returns The API response
   * @throws ServiceConfigError if API key is not configured
   * @throws RescueGroupsAPIError if the request fails
   */
  async request<T>(
    request: Omit<RescueGroupsRequest, 'apikey'>
  ): Promise<RescueGroupsResponse<T>> {
    // Check configuration before making request
    let apiKey: string;
    try {
      apiKey = getApiKey();
    } catch (error) {
      // Re-throw ServiceConfigError as-is
      if (error instanceof ServiceConfigError) {
        throw error;
      }
      // Wrap any other errors
      throw new ServiceConfigError(
        error instanceof Error ? error.message : 'Configuration error',
        process.env.NODE_ENV === 'development'
      );
    }

    const payload: RescueGroupsRequest = {
      ...request,
      apikey: apiKey,
    };

    // Debug logging
    console.log(
      '[RescueGroups API] Request:',
      JSON.stringify(
        {
          objectType: payload.objectType,
          objectAction: payload.objectAction,
          search: payload.search,
        },
        null,
        2
      )
    );

    try {
      const controller = new AbortController();
      const timeoutId = global.setTimeout(
        () => controller.abort(),
        this.timeout
      );

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      global.clearTimeout(timeoutId);

      if (!response.ok) {
        throw this.createError(
          `HTTP error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = (await response.json()) as RescueGroupsResponse<T>;

      // Debug logging
      console.log('[RescueGroups API] Response status:', data.status);
      console.log('[RescueGroups API] Found rows:', data.foundRows);

      // Log warnings/messages
      if (data.messages?.generalMessages) {
        console.warn(
          '[RescueGroups API] Messages:',
          data.messages.generalMessages.map((m) => m.messageText)
        );
      }

      if (data.data) {
        const records = Object.values(data.data);
        console.log('[RescueGroups API] Records returned:', records.length);
        if (records.length > 0) {
          const firstRecord = records[0] as Record<string, unknown>;
          if ('animalSpecies' in firstRecord) {
            const species = records.map(
              (r) => (r as Record<string, unknown>).animalSpecies
            );
            console.log('[RescueGroups API] Species in results:', [
              ...new Set(species),
            ]);
          }
        }
      }

      if (data.status === 'error') {
        const errorMessages = this.extractErrorMessages(data);
        throw this.createError(
          errorMessages.join('; '),
          undefined,
          data.messages?.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createError('Request timeout', 408);
        }
        if (error.name === 'RescueGroupsAPIError') {
          throw error;
        }
        throw this.createError(`Network error: ${error.message}`);
      }
      throw this.createError('Unknown error occurred');
    }
  }

  /**
   * Extracts error messages from API response
   */
  private extractErrorMessages(
    response: RescueGroupsResponse<unknown>
  ): string[] {
    const messages: string[] = [];

    if (response.messages?.generalMessages) {
      // Extract messageText from each message object
      messages.push(
        ...response.messages.generalMessages.map((msg) => msg.messageText)
      );
    }

    if (response.messages?.recordMessages) {
      // Extract messageText from record-specific messages
      messages.push(
        ...response.messages.recordMessages.map((msg) => msg.messageText)
      );
    }

    if (response.messages?.errors) {
      Object.entries(response.messages.errors).forEach(([field, errors]) => {
        errors.forEach((error) => {
          messages.push(`${field}: ${error}`);
        });
      });
    }

    return messages.length > 0
      ? messages
      : ['API request failed with no error message'];
  }

  /**
   * Creates a RescueGroupsAPIError
   */
  private createError(
    message: string,
    statusCode?: number,
    errors?: Record<string, string[]>
  ): RescueGroupsAPIError {
    const error = new Error(message) as RescueGroupsAPIError;
    error.name = 'RescueGroupsAPIError';
    error.statusCode = statusCode;
    error.errors = errors;
    return error;
  }
}

/**
 * Singleton instance of the RescueGroups API client
 */
export const rescueGroupsClient = new RescueGroupsClient();
