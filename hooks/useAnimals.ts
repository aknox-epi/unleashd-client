import { useCallback, useEffect, useRef } from 'react';
import { animalService } from '@/services/rescuegroups';
import type { Animal, AnimalSearchParams } from '@/services/rescuegroups';
import { useRescueGroupsContext } from '@/contexts/RescueGroupsContext';

/**
 * Hook for searching animals
 * Manages search state and provides search functionality
 */
export function useAnimalSearch() {
  const {
    searchResults,
    isLoading,
    error,
    searchParams,
    setSearchResults,
    setIsLoading,
    setError,
    setWarnings,
    setSearchParams,
  } = useRescueGroupsContext();

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Searches for animals with the provided parameters
   */
  const search = useCallback(
    async (params: AnimalSearchParams): Promise<void> => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      setWarnings([]);
      setSearchParams(params);

      try {
        const results = await animalService.searchAnimals(params);
        setSearchResults(results);
        setWarnings(results.warnings || []);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          setSearchResults(null);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [setIsLoading, setError, setWarnings, setSearchParams, setSearchResults]
  );

  /**
   * Loads more results (pagination)
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (
      !searchParams ||
      !searchResults ||
      !searchResults.hasMore ||
      isLoading
    ) {
      return;
    }

    const nextOffset = searchResults.offset + searchResults.limit;
    const nextParams: AnimalSearchParams = {
      ...searchParams,
      offset: nextOffset,
    };

    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const results = await animalService.searchAnimals(nextParams);

      // Append new results to existing ones
      setSearchResults({
        ...results,
        data: [...searchResults.data, ...results.data],
        offset: nextOffset,
      });
      setSearchParams(nextParams);
      setWarnings(results.warnings || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    searchParams,
    searchResults,
    isLoading,
    setIsLoading,
    setError,
    setWarnings,
    setSearchResults,
    setSearchParams,
  ]);

  /**
   * Clears search results and resets state
   */
  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSearchResults(null);
    setSearchParams(null);
    setError(null);
    setWarnings([]);
  }, [setSearchResults, setSearchParams, setError, setWarnings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    search,
    loadMore,
    clear,
    results: searchResults?.data || [],
    total: searchResults?.total || 0,
    hasMore: searchResults?.hasMore || false,
    isLoading,
    error,
    searchParams,
  };
}

/**
 * Hook for fetching a single animal by ID
 */
export function useAnimal(animalId: string | null) {
  const {
    selectedAnimal,
    isLoading,
    error,
    setSelectedAnimal,
    setIsLoading,
    setError,
  } = useRescueGroupsContext();

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetches animal by ID
   */
  const fetchAnimal = useCallback(
    async (id: string): Promise<void> => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const animal = await animalService.getAnimalById(id);
        setSelectedAnimal(animal);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
          setSelectedAnimal(null);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [setIsLoading, setError, setSelectedAnimal]
  );

  /**
   * Clears selected animal
   */
  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelectedAnimal(null);
    setError(null);
  }, [setSelectedAnimal, setError]);

  // Auto-fetch when animalId changes
  useEffect(() => {
    if (animalId) {
      fetchAnimal(animalId);
    } else {
      clear();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [animalId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    animal: selectedAnimal,
    isLoading,
    error,
    fetchAnimal,
    clear,
  };
}

/**
 * Result type for useAnimalList hook
 */
interface UseAnimalListResult {
  animals: Animal[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  search: (params: AnimalSearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
}

/**
 * Simplified hook for animal list with common operations
 * Combines search functionality with convenience methods
 */
export function useAnimalList(
  initialParams?: AnimalSearchParams
): UseAnimalListResult {
  const {
    search,
    loadMore,
    clear,
    results,
    total,
    hasMore,
    isLoading,
    error,
    searchParams,
  } = useAnimalSearch();

  /**
   * Refreshes current search
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (searchParams) {
      await search({ ...searchParams, offset: 0 });
    }
  }, [search, searchParams]);

  // Auto-search with initial params on mount
  useEffect(() => {
    if (initialParams) {
      search(initialParams);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    animals: results,
    total,
    hasMore,
    isLoading,
    error,
    search,
    loadMore,
    refresh,
    clear,
  };
}
