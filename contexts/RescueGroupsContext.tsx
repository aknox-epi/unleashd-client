import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Animal,
  AnimalSearchParams,
  SearchResult,
  RescueGroupsAPIError,
} from '@/services/rescuegroups';

/**
 * Context state for RescueGroups data
 */
interface RescueGroupsContextState {
  /**
   * Current search results
   */
  searchResults: SearchResult<Animal> | null;

  /**
   * Currently selected animal
   */
  selectedAnimal: Animal | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: RescueGroupsAPIError | Error | null;

  /**
   * Warning messages from API
   */
  warnings: string[];

  /**
   * Current search parameters
   */
  searchParams: AnimalSearchParams | null;
}

/**
 * Context actions for RescueGroups operations
 */
interface RescueGroupsContextActions {
  /**
   * Sets search results
   */
  setSearchResults: (results: SearchResult<Animal> | null) => void;

  /**
   * Sets selected animal
   */
  setSelectedAnimal: (animal: Animal | null) => void;

  /**
   * Sets loading state
   */
  setIsLoading: (loading: boolean) => void;

  /**
   * Sets error state
   */
  setError: (error: RescueGroupsAPIError | Error | null) => void;

  /**
   * Sets warning messages
   */
  setWarnings: (warnings: string[]) => void;

  /**
   * Sets search parameters
   */
  setSearchParams: (params: AnimalSearchParams | null) => void;

  /**
   * Clears all state
   */
  clearState: () => void;
}

/**
 * Combined context value
 */
type RescueGroupsContextValue = RescueGroupsContextState &
  RescueGroupsContextActions;

/**
 * Default state values
 */
const defaultState: RescueGroupsContextState = {
  searchResults: null,
  selectedAnimal: null,
  isLoading: false,
  error: null,
  warnings: [],
  searchParams: null,
};

/**
 * Context instance
 */
const RescueGroupsContext = createContext<RescueGroupsContextValue | undefined>(
  undefined
);

/**
 * Provider props
 */
interface RescueGroupsProviderProps {
  children: ReactNode;
}

/**
 * RescueGroups Context Provider
 * Manages global state for RescueGroups API data
 */
export function RescueGroupsProvider({
  children,
}: RescueGroupsProviderProps): React.JSX.Element {
  const [searchResults, setSearchResults] =
    useState<SearchResult<Animal> | null>(defaultState.searchResults);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(
    defaultState.selectedAnimal
  );
  const [isLoading, setIsLoading] = useState<boolean>(defaultState.isLoading);
  const [error, setError] = useState<RescueGroupsAPIError | Error | null>(
    defaultState.error
  );
  const [warnings, setWarnings] = useState<string[]>(defaultState.warnings);
  const [searchParams, setSearchParams] = useState<AnimalSearchParams | null>(
    defaultState.searchParams
  );

  const clearState = useCallback(() => {
    setSearchResults(defaultState.searchResults);
    setSelectedAnimal(defaultState.selectedAnimal);
    setIsLoading(defaultState.isLoading);
    setError(defaultState.error);
    setWarnings(defaultState.warnings);
    setSearchParams(defaultState.searchParams);
  }, []);

  const value: RescueGroupsContextValue = {
    // State
    searchResults,
    selectedAnimal,
    isLoading,
    error,
    warnings,
    searchParams,
    // Actions
    setSearchResults,
    setSelectedAnimal,
    setIsLoading,
    setError,
    setWarnings,
    setSearchParams,
    clearState,
  };

  return (
    <RescueGroupsContext.Provider value={value}>
      {children}
    </RescueGroupsContext.Provider>
  );
}

/**
 * Hook to access RescueGroups context
 * @throws Error if used outside of RescueGroupsProvider
 */
export function useRescueGroupsContext(): RescueGroupsContextValue {
  const context = useContext(RescueGroupsContext);

  if (context === undefined) {
    throw new Error(
      'useRescueGroupsContext must be used within a RescueGroupsProvider'
    );
  }

  return context;
}
