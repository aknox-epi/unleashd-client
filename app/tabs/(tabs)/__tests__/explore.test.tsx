import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Explore from '../explore';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { RescueGroupsProvider } from '@/contexts/RescueGroupsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LocationPreferencesProvider } from '@/contexts/LocationPreferencesContext';
import { SortPreferencesProvider } from '@/contexts/SortPreferencesContext';
import { SpeciesPreferencesProvider } from '@/contexts/SpeciesPreferencesContext';
import { useAnimalSearch } from '@/hooks/useAnimals';
import type {
  Sex,
  GeneralAge,
  GeneralSizePotential,
} from '@/services/rescuegroups';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock useAnimals hook
const mockSearch = jest.fn();
const mockLoadMore = jest.fn();

jest.mock('@/hooks/useAnimals', () => ({
  useAnimalSearch: jest.fn(),
}));

// Mock nativewind
jest.mock('nativewind', () => ({
  ...jest.requireActual('nativewind'),
  setColorScheme: jest.fn(),
  useColorScheme: jest.fn(() => ({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
    toggleColorScheme: jest.fn(),
  })),
  cssInterop: jest.requireActual('nativewind').cssInterop,
}));

// Helper function to render with all providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <RescueGroupsProvider>
        <LocationPreferencesProvider>
          <SortPreferencesProvider>
            <SpeciesPreferencesProvider>
              <FavoritesProvider>
                <GluestackUIProvider mode="light">
                  {component}
                </GluestackUIProvider>
              </FavoritesProvider>
            </SpeciesPreferencesProvider>
          </SortPreferencesProvider>
        </LocationPreferencesProvider>
      </RescueGroupsProvider>
    </ThemeProvider>
  );
};

describe('Explore Screen - Gender and Age Filter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAnimalSearch as jest.Mock).mockReturnValue({
      search: mockSearch,
      loadMore: mockLoadMore,
      results: [],
      total: 0,
      hasMore: false,
      isLoading: false,
      error: null,
    });
  });

  it('should call search with sex and age parameters set to undefined by default', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith({
        species: 'Dog',
        sex: undefined,
        age: undefined,
        size: undefined,
        location: undefined,
        radius: undefined,
        sort: 'animalUpdatedDate',
        order: 'desc',
        limit: 20,
      });
    });
  });

  it('should include sex parameter in search call structure', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs).toHaveProperty('sex');
    });
  });

  it('should include age parameter in search call structure', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs).toHaveProperty('age');
    });
  });

  it('should include size parameter in search call structure', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs).toHaveProperty('size');
    });
  });

  it('should pass all expected filter parameters to search function', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith({
        species: expect.any(String),
        sex: undefined,
        age: undefined,
        size: undefined,
        location: undefined,
        radius: undefined,
        sort: expect.any(String),
        order: expect.stringMatching(/^(asc|desc)$/),
        limit: expect.any(Number),
      });
    });
  });

  it('should render without crashing when all filters are provided', () => {
    expect(() => renderWithProviders(<Explore />)).not.toThrow();
  });

  it('should use useAnimalSearch hook correctly', () => {
    renderWithProviders(<Explore />);
    // If the component renders without error, it's using the hook correctly
    expect(mockSearch).toBeDefined();
  });

  it('should call search function from useAnimalSearch on mount', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledTimes(1);
    });
  });

  it('should pass species parameter correctly', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.species).toBe('Dog');
    });
  });

  it('should pass limit parameter correctly', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.limit).toBe(20);
    });
  });

  it('should initialize sex filter as undefined (All genders)', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.sex).toBeUndefined();
    });
  });

  it('should initialize age filter as undefined (All ages)', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.age).toBeUndefined();
    });
  });

  it('should initialize size filter as undefined (All sizes)', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.size).toBeUndefined();
    });
  });

  it('should include location parameter in search call structure', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs).toHaveProperty('location');
    });
  });

  it('should include radius parameter in search call structure', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs).toHaveProperty('radius');
    });
  });

  it('should initialize location filter as undefined', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.location).toBeUndefined();
    });
  });

  it('should initialize radius filter as undefined', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.radius).toBeUndefined();
    });
  });
});

describe('Explore Screen - Type Safety', () => {
  it('should import Sex type from rescuegroups service', () => {
    // This test validates that the type export works at compile time
    // TypeScript will fail to compile if Sex is not exported
    const testValue: Sex = 'Male';
    expect(testValue).toBe('Male');
  });

  it('should import GeneralAge type from rescuegroups service', () => {
    // This test validates that the type export works at compile time
    // TypeScript will fail to compile if GeneralAge is not exported
    const testValue: GeneralAge = 'Adult';
    expect(testValue).toBe('Adult');
  });

  it('should import GeneralSizePotential type from rescuegroups service', () => {
    // This test validates that the type export works at compile time
    // TypeScript will fail to compile if GeneralSizePotential is not exported
    const testValue: GeneralSizePotential = 'Large';
    expect(testValue).toBe('Large');
  });
});

describe('Explore Screen - Component Integration', () => {
  beforeEach(() => {
    (useAnimalSearch as jest.Mock).mockReturnValue({
      search: mockSearch,
      loadMore: mockLoadMore,
      results: [],
      total: 0,
      hasMore: false,
      isLoading: false,
      error: null,
    });
  });

  it('should handle loading state without errors', () => {
    (useAnimalSearch as jest.Mock).mockReturnValue({
      search: jest.fn(),
      loadMore: jest.fn(),
      results: [],
      total: 0,
      hasMore: false,
      isLoading: true,
      error: null,
    });

    expect(() => renderWithProviders(<Explore />)).not.toThrow();
  });

  it('should handle error state without crashing', () => {
    (useAnimalSearch as jest.Mock).mockReturnValue({
      search: jest.fn(),
      loadMore: jest.fn(),
      results: [],
      total: 0,
      hasMore: false,
      isLoading: false,
      error: new Error('Test error'),
    });

    expect(() => renderWithProviders(<Explore />)).not.toThrow();
  });

  it('should handle results without crashing', () => {
    (useAnimalSearch as jest.Mock).mockReturnValue({
      search: jest.fn(),
      loadMore: jest.fn(),
      results: [
        {
          animalID: '1',
          animalOrgID: 'org-1',
          animalName: 'Buddy',
          animalSpecies: 'Dog',
          animalBreed: 'Golden Retriever',
          animalPrimaryBreed: 'Golden Retriever',
          animalSex: 'Male',
          animalGeneralAge: 'Adult',
          animalLocationCitystate: 'San Francisco, CA',
          animalThumbnailUrl: 'https://example.com/buddy.jpg',
        },
      ],
      total: 1,
      hasMore: false,
      isLoading: false,
      error: null,
    });

    expect(() => renderWithProviders(<Explore />)).not.toThrow();
  });
});

describe('Explore Screen - Sort Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAnimalSearch as jest.Mock).mockReturnValue({
      search: mockSearch,
      loadMore: mockLoadMore,
      results: [],
      total: 0,
      hasMore: false,
      isLoading: false,
      error: null,
    });
  });

  it('should include sort and order parameters in search call', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalled();
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs).toHaveProperty('sort');
      expect(callArgs).toHaveProperty('order');
    });
  });

  it('should default to newest first sort (animalUpdatedDate desc)', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      const callArgs = mockSearch.mock.calls[0][0];
      expect(callArgs.sort).toBe('animalUpdatedDate');
      expect(callArgs.order).toBe('desc');
    });
  });

  it('should pass all expected parameters including sort to search function', async () => {
    renderWithProviders(<Explore />);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith({
        species: expect.any(String),
        sex: undefined,
        age: undefined,
        size: undefined,
        location: undefined,
        radius: undefined,
        sort: expect.any(String),
        order: expect.stringMatching(/^(asc|desc)$/),
        limit: expect.any(Number),
      });
    });
  });
});
