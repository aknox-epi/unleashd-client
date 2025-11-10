/**
 * Public exports for RescueGroups API service
 */

// Client
export { RescueGroupsClient, rescueGroupsClient } from './client';

// Services
export { AnimalService, animalService } from './animals';

// Types
export type {
  Animal,
  AnimalPicture,
  AnimalVideo,
  AnimalSearchParams,
  Organization,
  Filter,
  FilterOperation,
  RescueGroupsRequest,
  RescueGroupsResponse,
  SearchResult,
} from './types';

export {
  RescueGroupsAPIError,
  isRescueGroupsAPIError,
  getErrorMessage,
} from './types';
