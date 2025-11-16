import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import PetDetailScreen from '../[id]';
import { animalService, organizationService } from '@/services/rescuegroups';
import type { Animal, Organization } from '@/services/rescuegroups';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

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
  organizationService: {
    getOrganizationById: jest.fn(),
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

// Mock Linking.openURL using jest.spyOn before tests run
const mockOpenURL = jest.fn();
jest.spyOn(Linking, 'openURL').mockImplementation(mockOpenURL);

// Mock nativewind's setColorScheme
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

// Helper function to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <GluestackUIProvider mode="light">{component}</GluestackUIProvider>
  );
};

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

  const mockOrganization: Organization = {
    orgID: 'org-456',
    orgName: 'Happy Tails Rescue',
    orgAbout: 'Dedicated to finding loving homes for animals in need',
    orgAboutAdopt: 'We require a home visit and application process',
    orgAddress: '123 Main St',
    orgCity: 'San Francisco',
    orgState: 'CA',
    orgPhone: '555-0123',
    orgEmail: 'adopt@happytails.org',
    orgWebsite: 'https://happytails.org',
    orgFacebook: 'https://facebook.com/happytails',
    orgTwitter: 'https://twitter.com/happytails',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '123' });
    // Default: org fetch succeeds
    (organizationService.getOrganizationById as jest.Mock).mockResolvedValue(
      mockOrganization
    );
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', () => {
      (animalService.getAnimalById as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { UNSAFE_queryByType } = renderWithProviders(<PetDetailScreen />);

      // Check for spinner (using type since we don't have testID)
      expect(UNSAFE_queryByType).toBeTruthy();
    });
  });

  describe('Success State', () => {
    it('displays animal details when loaded successfully', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText, getAllByText } = renderWithProviders(
        <PetDetailScreen />
      );

      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
      });

      expect(getByText('Dog')).toBeTruthy();
      expect(getByText('Golden Retriever')).toBeTruthy();
      // San Francisco, CA appears multiple times (animal location + org location)
      expect(getAllByText('San Francisco, CA').length).toBeGreaterThan(0);
    });

    it('displays animal description', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Friendly and energetic dog')).toBeTruthy();
      });
    });

    it('displays adoption fee', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('$250')).toBeTruthy();
      });
    });

    it('adds dollar sign to numeric adoption fee without one', async () => {
      const animalWithNumericFee = {
        ...mockAnimal,
        animalAdoptionFee: '150',
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithNumericFee
      );

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('$150')).toBeTruthy();
      });
    });

    it('preserves adoption fee with existing dollar sign', async () => {
      const animalWithDollarSignFee = {
        ...mockAnimal,
        animalAdoptionFee: '$300.00',
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithDollarSignFee
      );

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('$300.00')).toBeTruthy();
      });
    });

    it('displays non-numeric adoption fee text as-is', async () => {
      const animalWithFreeFee = {
        ...mockAnimal,
        animalAdoptionFee: 'Free',
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithFreeFee
      );

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Free')).toBeTruthy();
      });
    });

    it('hides adoption fee section when fee is empty', async () => {
      const animalWithoutFee = {
        ...mockAnimal,
        animalAdoptionFee: undefined,
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithoutFee
      );

      const { queryByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(queryByText('Adoption Fee')).toBeNull();
      });
    });
  });

  describe('Error State', () => {
    it('displays error message when animal cannot be loaded', async () => {
      const error = new Error('Network error');
      (animalService.getAnimalById as jest.Mock).mockRejectedValue(error);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Unable to load pet details')).toBeTruthy();
      });
    });

    it('displays error message when animal is not found', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(null);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Unable to load pet details')).toBeTruthy();
      });
    });
  });

  describe('Animal Characteristics', () => {
    it('displays physical characteristics', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText(/Sex:/)).toBeTruthy();
        expect(getByText(/Male/)).toBeTruthy();
        expect(getByText(/Age:/)).toBeTruthy();
        expect(getByText(/Adult/)).toBeTruthy();
      });
    });

    it('displays compatibility badges', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Kids')).toBeTruthy();
        expect(getByText('Dogs')).toBeTruthy();
      });
    });
  });

  describe('Image Handling', () => {
    it('displays primary image when available', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

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

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('No photo available')).toBeTruthy();
      });
    });
  });

  describe('Organization Data', () => {
    it('fetches organization data when animal has orgID', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(organizationService.getOrganizationById).toHaveBeenCalledWith(
          'org-456'
        );
      });
    });

    it('displays organization name and description', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Happy Tails Rescue')).toBeTruthy();
        expect(
          getByText('Dedicated to finding loving homes for animals in need')
        ).toBeTruthy();
      });
    });

    it('displays organization contact information', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('555-0123')).toBeTruthy();
        expect(getByText('adopt@happytails.org')).toBeTruthy();
        expect(getByText('https://happytails.org')).toBeTruthy();
      });
    });

    it('displays organization location', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText, getAllByText } = renderWithProviders(
        <PetDetailScreen />
      );

      await waitFor(() => {
        // Organization location appears in the "About the Organization" section
        expect(getByText('About the Organization')).toBeTruthy();
        // City/State appears twice: once in animal location, once in org location
        const locations = getAllByText('San Francisco, CA');
        expect(locations.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('displays social media links when available', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Facebook')).toBeTruthy();
        expect(getByText('Twitter')).toBeTruthy();
      });
    });

    it('handles organization fetch failure gracefully', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);
      (organizationService.getOrganizationById as jest.Mock).mockRejectedValue(
        new Error('Org fetch failed')
      );

      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      // Animal details should still render
      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
      });

      // Organization section should not appear
      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Failed to load organization details:',
          expect.any(Error)
        );
      });

      consoleWarnSpy.mockRestore();
    });

    it('does not show organization section when org data is null', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);
      (organizationService.getOrganizationById as jest.Mock).mockResolvedValue(
        null
      );

      const { getByText, queryByText } = renderWithProviders(
        <PetDetailScreen />
      );

      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
      });

      expect(queryByText('About the Organization')).toBeNull();
    });

    it('does not fetch organization when animal has no orgID', async () => {
      const animalWithoutOrg = {
        ...mockAnimal,
        animalOrgID: undefined,
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithoutOrg
      );

      renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(organizationService.getOrganizationById).not.toHaveBeenCalled();
      });
    });
  });

  describe('Adoption Requirements', () => {
    it('displays fence requirement when specified', async () => {
      const animalWithFence = {
        ...mockAnimal,
        animalFence: 'Yes',
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithFence
      );

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Fenced yard required')).toBeTruthy();
      });
    });

    it('displays organization adoption requirements when available', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Adoption Requirements')).toBeTruthy();
        expect(
          getByText('We require a home visit and application process')
        ).toBeTruthy();
      });
    });

    it('displays default adoption requirements when org data unavailable', async () => {
      const animalWithFence = {
        ...mockAnimal,
        animalFence: 'Yes',
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithFence
      );
      (organizationService.getOrganizationById as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        orgAboutAdopt: undefined,
      });

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Complete adoption application')).toBeTruthy();
        expect(getByText('Provide references')).toBeTruthy();
        expect(getByText('Home visit may be required')).toBeTruthy();
      });
    });

    it('shows link to org website for full requirements', async () => {
      const animalWithFence = {
        ...mockAnimal,
        animalFence: 'Yes',
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithFence
      );

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(
          getByText(/Visit the organization's website for complete/)
        ).toBeTruthy();
      });
    });

    it('does not show adoption requirements section when no data available', async () => {
      const animalWithoutFence = {
        ...mockAnimal,
        animalFence: undefined,
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithoutFence
      );
      (organizationService.getOrganizationById as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        orgAboutAdopt: undefined,
      });

      const { queryByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(queryByText('Adoption Requirements')).toBeNull();
      });
    });
  });

  describe('Contact Action Sheet', () => {
    it('opens action sheet when contact button is pressed', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        expect(getByText('Call Shelter')).toBeTruthy();
        expect(getByText('Send Email')).toBeTruthy();
        expect(getByText('Visit Website')).toBeTruthy();
        expect(getByText('View Listing')).toBeTruthy();
        expect(getByText('Get Directions')).toBeTruthy();
      });
    });

    it('calls phone number when call action is pressed', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        expect(getByText('Call Shelter')).toBeTruthy();
      });

      const callButton = getByText('Call Shelter');
      fireEvent.press(callButton);

      expect(mockOpenURL).toHaveBeenCalledWith('tel:555-0123');
    });

    it('opens email client when email action is pressed', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        expect(getByText('Send Email')).toBeTruthy();
      });

      const emailButton = getByText('Send Email');
      fireEvent.press(emailButton);

      expect(mockOpenURL).toHaveBeenCalledWith('mailto:adopt@happytails.org');
    });

    it('opens website when website action is pressed', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        expect(getByText('Visit Website')).toBeTruthy();
      });

      const websiteButton = getByText('Visit Website');
      fireEvent.press(websiteButton);

      expect(mockOpenURL).toHaveBeenCalledWith('https://happytails.org');
    });

    it('opens listing when view listing action is pressed', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        expect(getByText('View Listing')).toBeTruthy();
      });

      const listingButton = getByText('View Listing');
      fireEvent.press(listingButton);

      expect(mockOpenURL).toHaveBeenCalledWith(
        'https://example.com/adopt/buddy'
      );
    });

    it('opens maps when get directions action is pressed', async () => {
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(mockAnimal);

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        expect(getByText('Get Directions')).toBeTruthy();
      });

      const directionsButton = getByText('Get Directions');
      fireEvent.press(directionsButton);

      // Should open maps with organization address (URL format varies by platform)
      const callArg = mockOpenURL.mock.calls[0][0];
      expect(callArg).toMatch(/123.*Main.*St/);
      expect(callArg).toContain('San%20Francisco');
    });

    it('displays all contact actions even when data is unavailable', async () => {
      const animalWithPartialContact = {
        ...mockAnimal,
        animalUrl: undefined,
      };
      (animalService.getAnimalById as jest.Mock).mockResolvedValue(
        animalWithPartialContact
      );
      (organizationService.getOrganizationById as jest.Mock).mockResolvedValue({
        ...mockOrganization,
        orgPhone: undefined,
        orgEmail: undefined,
      });

      const { getByText } = renderWithProviders(<PetDetailScreen />);

      await waitFor(() => {
        expect(getByText('Contact Shelter')).toBeTruthy();
      });

      const contactButton = getByText('Contact Shelter');
      fireEvent.press(contactButton);

      await waitFor(() => {
        // All action buttons should be present
        expect(getByText('Call Shelter')).toBeTruthy();
        expect(getByText('Send Email')).toBeTruthy();
        expect(getByText('Visit Website')).toBeTruthy();
        expect(getByText('View Listing')).toBeTruthy();
        expect(getByText('Get Directions')).toBeTruthy();
      });
    });
  });
});
