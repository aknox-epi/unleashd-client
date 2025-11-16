/**
 * Public exports for RescueGroups API service
 */

// Configuration
export { isConfigured } from '@/constants/RescueGroupsConfig';

// Client
export { RescueGroupsClient, rescueGroupsClient } from './client';

// Services
export { AnimalService, animalService } from './animals';
export { OrganizationService, organizationService } from './organizations';

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

// Generated types
export type {
  AnimalSpecies,
  Sex,
  GeneralAge,
  GeneralSizePotential,
} from './generated-types';

export {
  RescueGroupsAPIError,
  isRescueGroupsAPIError,
  ServiceConfigError,
  isServiceConfigError,
  ServiceStatus,
  getErrorMessage,
} from './types';
