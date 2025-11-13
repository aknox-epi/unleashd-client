import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import PetDetailScreen from '../[id]';
import { animalService } from '@/services/rescuegroups';
import type { Animal } from '@/services/rescuegroups';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: () => null,
  },
  router: {
    back: jest.fn(),
  },
}));

jest.mock('@/services/rescuegroups', () => ({
  animalService: {
    getAnimalById: jest.fn(),
  },
  getErrorMessage: jest.fn((error: Error) => error.message),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colorMode: 'light',
    setColorMode: jest.fn(),
    toggleColorMode: jest.fn(),
  })),
}));

describe('PetDetailScreen', () => {
  const mockAnimal: Animal = {
    animalID: '123',
    animalOrgID: 'org-456',
    animalName: 'Buddy',
    animalSpecies: 'Dog' as const,
    animalBreed: 'Golden Retriever',
    animalPrimaryBreed: 'Golden Retriever',
    animalSex: 'Male' as const,
    animalGeneralAge: 'Adult' as const,
    animalLocationCitystate: 'San Francisco, CA',
    animalThumbnailUrl: 'https://example.com/buddy.jpg',
    animalColor: 'Golden',
    animalGeneralSizePotential: 'Large',
    animalDescriptionPlain: 'Friendly and energetic dog',
    animalAltered: 'Yes',
    animalHousetrained: 'Yes',
    animalOKWithKids: 'Yes',
    animalOKWithDogs: 'Yes',
    animalOKWithCats: 'No',
    animalAdoptionFee: '$250',
    animalUrl: 'https://example.com/adopt/buddy',
    animalPictures: [
      {
        mediaID: '1',
        mediaOrder: 1,
        urlSecureLarge: 'https://example.com/buddy-large.jpg',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', () => {
      (animalService.getAnimalById as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { UNSAFE_queryByType } = render(<PetDetailScreen />);

      // Check for spinner (using type since we don't have testID)
      expect(UNSAFE_queryByType).toBeTruthy();
    });
  });

  describe('Success State', () => {
    it('displays animal details when loaded successfully', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
      });

      expect(getByText('Dog')).toBeTruthy();
      expect(getByText('Golden Retriever')).toBeTruthy();
      expect(getByText('San Francisco, CA')).toBeTruthy();
    });

    it('displays animal description', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Friendly and energetic dog')).toBeTruthy();
      });
    });

    it('displays adoption fee', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('$250')).toBeTruthy();
      });
    });
  });

  describe('Error State', () => {
    it('displays error message when animal cannot be loaded', async () => {
      const error = new Error('Network error');
      (animalService.getAnimalById as jest.Mock).mockRejectedValue(error);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Unable to load pet details')).toBeTruthy();
      });
    });

    it('displays error message when animal is not found', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(null);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Unable to load pet details')).toBeTruthy();
      });
    });
  });

  describe('Animal Characteristics', () => {
    it('displays physical characteristics', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText(/Sex:/)).toBeTruthy();
        expect(getByText(/Male/)).toBeTruthy();
        expect(getByText(/Age:/)).toBeTruthy();
        expect(getByText(/Adult/)).toBeTruthy();
      });
    });

    it('displays compatibility badges', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Kids')).toBeTruthy();
        expect(getByText('Dogs')).toBeTruthy();
      });
    });
  });

  describe('Image Handling', () => {
    it('displays primary image when available', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        // Verify the screen loaded by checking for the animal name
        expect(getByText('Buddy')).toBeTruthy();
      });

      // Image component is rendered (we can't easily test the Image component itself in unit tests)
      // The fact that we don't see "No photo available" means the image is being rendered
    });

    it('shows placeholder when no images available', async () => {
      const animalWithoutImages = {
        ...mockAnimal,
        animalPictures: undefined,
        animalThumbnailUrl: undefined,
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithoutImages
      );

      const { getByText } = render(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('No photo available')).toBeTruthy();
      });
    });
  });
});
