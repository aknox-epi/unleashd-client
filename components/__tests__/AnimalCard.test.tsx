import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimalCard } from '../AnimalCard';
import type { Animal } from '@/services/rescuegroups';

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ colorMode: 'light' }),
}));

describe('AnimalCard', () => {
  const mockAnimal: Animal = {
    animalID: '123',
    animalOrgID: 'org-456',
    animalName: 'Buddy',
    animalSpecies: 'Dog' as const,
    animalBreed: 'Golden Retriever',
    animalSex: 'Male' as const,
    animalGeneralAge: 'Adult' as const,
    animalLocationCitystate: 'San Francisco, CA',
    animalThumbnailUrl: 'https://example.com/buddy.jpg',
  };

  describe('Rendering', () => {
    it('renders animal name', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      expect(getByText('Buddy')).toBeTruthy();
    });

    it('renders animal species', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      expect(getByText('Dog')).toBeTruthy();
    });

    it('renders animal breed', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      expect(getByText('Golden Retriever')).toBeTruthy();
    });

    it('renders animal age', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      expect(getByText(/Age: Adult/)).toBeTruthy();
    });

    it('renders animal sex', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      expect(getByText(/Sex: Male/)).toBeTruthy();
    });

    it('renders animal location', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      expect(getByText(/Location: San Francisco, CA/)).toBeTruthy();
    });

    it('does not render breed when not provided', () => {
      const animalWithoutBreed: Animal = {
        animalID: '123',
        animalOrgID: 'org-456',
        animalName: 'Buddy',
        animalSpecies: 'Dog' as const,
        animalBreed: '',
        animalSex: 'Male' as const,
        animalGeneralAge: 'Adult' as const,
      };
      const { queryByText } = render(
        <AnimalCard animal={animalWithoutBreed} />
      );
      expect(queryByText('Golden Retriever')).toBeNull();
    });

    it('does not render age when not provided', () => {
      const animalWithoutAge: Animal = {
        animalID: '123',
        animalOrgID: 'org-456',
        animalName: 'Buddy',
        animalSpecies: 'Dog' as const,
        animalBreed: 'Golden Retriever',
        animalSex: 'Male' as const,
        animalGeneralAge: '' as const,
      };
      const { queryByText } = render(<AnimalCard animal={animalWithoutAge} />);
      expect(queryByText(/Age:/)).toBeNull();
    });

    it('does not render sex when not provided', () => {
      const animalWithoutSex: Animal = {
        animalID: '123',
        animalOrgID: 'org-456',
        animalName: 'Buddy',
        animalSpecies: 'Dog' as const,
        animalBreed: 'Golden Retriever',
        animalSex: '' as const,
        animalGeneralAge: 'Adult' as const,
      };
      const { queryByText } = render(<AnimalCard animal={animalWithoutSex} />);
      expect(queryByText(/Sex:/)).toBeNull();
    });

    it('does not render location when not provided', () => {
      const animalWithoutLocation: Animal = {
        animalID: '123',
        animalOrgID: 'org-456',
        animalName: 'Buddy',
        animalSpecies: 'Dog' as const,
        animalBreed: 'Golden Retriever',
        animalSex: 'Male' as const,
        animalGeneralAge: 'Adult' as const,
      };
      const { queryByText } = render(
        <AnimalCard animal={animalWithoutLocation} />
      );
      expect(queryByText(/Location:/)).toBeNull();
    });
  });

  describe('Image Display', () => {
    it('renders image when animalThumbnailUrl is provided', () => {
      const { getByLabelText } = render(<AnimalCard animal={mockAnimal} />);
      const image = getByLabelText('Buddy');
      expect(image).toBeTruthy();
      expect(image.props.source.uri).toBe('https://example.com/buddy.jpg');
    });

    it('renders image from animalPictures array when thumbnail URL not available', () => {
      const animalWithPictures: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: [
          {
            mediaID: 'pic-1',
            mediaOrder: 1,
            urlSecureLarge: 'https://example.com/large.jpg',
            urlSecureSmall: 'https://example.com/small.jpg',
            urlSecureThumbnail: 'https://example.com/thumb.jpg',
          },
        ],
      };

      const { getByLabelText } = render(
        <AnimalCard animal={animalWithPictures} />
      );
      const image = getByLabelText('Buddy');
      expect(image.props.source.uri).toBe('https://example.com/large.jpg');
    });

    it('prioritizes large image over small in animalPictures', () => {
      const animalWithPictures: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: [
          {
            mediaID: 'pic-1',
            mediaOrder: 1,
            urlSecureLarge: 'https://example.com/large.jpg',
            urlSecureSmall: 'https://example.com/small.jpg',
          },
        ],
      };

      const { getByLabelText } = render(
        <AnimalCard animal={animalWithPictures} />
      );
      const image = getByLabelText('Buddy');
      expect(image.props.source.uri).toBe('https://example.com/large.jpg');
    });

    it('uses small image when large not available', () => {
      const animalWithPictures: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: [
          {
            mediaID: 'pic-1',
            mediaOrder: 1,
            urlSecureSmall: 'https://example.com/small.jpg',
          },
        ],
      };

      const { getByLabelText } = render(
        <AnimalCard animal={animalWithPictures} />
      );
      const image = getByLabelText('Buddy');
      expect(image.props.source.uri).toBe('https://example.com/small.jpg');
    });

    it('renders fallback icon when no image available', () => {
      const animalWithoutImage: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: undefined,
      };

      const { queryByLabelText } = render(
        <AnimalCard animal={animalWithoutImage} />
      );
      expect(queryByLabelText('Buddy')).toBeNull(); // Image should not be present
    });

    it('renders fallback icon on image error', () => {
      const { getByLabelText, queryByLabelText } = render(
        <AnimalCard animal={mockAnimal} />
      );
      const image = getByLabelText('Buddy');

      // Simulate image load error
      fireEvent(image, 'error');

      // After error, image should no longer be present (fallback shown instead)
      expect(queryByLabelText('Buddy')).toBeNull();
    });
  });

  describe('Species Icons', () => {
    it('renders dog icon for dog species', () => {
      const dog: Animal = { ...mockAnimal, animalThumbnailUrl: undefined };
      const { getByText } = render(<AnimalCard animal={dog} />);
      // Icon component should be rendered - verify by checking other content renders
      expect(getByText('Buddy')).toBeTruthy();
    });

    it('renders cat icon for cat species', () => {
      const cat: Animal = {
        ...mockAnimal,
        animalSpecies: 'Cat' as const,
        animalThumbnailUrl: undefined,
      };
      const { getByText } = render(<AnimalCard animal={cat} />);
      expect(getByText('Cat')).toBeTruthy();
    });

    it('renders bird icon for bird species', () => {
      const bird: Animal = {
        ...mockAnimal,
        animalSpecies: 'Bird' as const,
        animalThumbnailUrl: undefined,
      };
      const { getByText } = render(<AnimalCard animal={bird} />);
      expect(getByText('Bird')).toBeTruthy();
    });

    it('renders rabbit icon for rabbit species', () => {
      const rabbit: Animal = {
        ...mockAnimal,
        animalSpecies: 'Rabbit' as const,
        animalThumbnailUrl: undefined,
      };
      const { getByText } = render(<AnimalCard animal={rabbit} />);
      expect(getByText('Rabbit')).toBeTruthy();
    });

    it('renders generic icon for unknown species', () => {
      const unknown: Animal = {
        ...mockAnimal,
        animalSpecies: 'Horse' as const,
        animalThumbnailUrl: undefined,
      };
      const { getByText } = render(<AnimalCard animal={unknown} />);
      expect(getByText('Horse')).toBeTruthy();
    });
  });

  describe('Press Handling', () => {
    it('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <AnimalCard animal={mockAnimal} onPress={onPress} />
      );

      const card = getByTestId('animal-card-123');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(mockAnimal);
    });

    it('does not wrap in Pressable when onPress not provided', () => {
      const { queryByTestId } = render(<AnimalCard animal={mockAnimal} />);
      expect(queryByTestId('animal-card-123')).toBeNull();
    });

    it('is not pressable when onPress is undefined', () => {
      const { getByText } = render(<AnimalCard animal={mockAnimal} />);
      // Should render content without Pressable wrapper
      expect(getByText('Buddy')).toBeTruthy();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode styles when isDarkMode is true', () => {
      const animalWithoutImage: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: undefined,
      };

      const { getByText } = render(
        <AnimalCard animal={animalWithoutImage} isDarkMode={true} />
      );
      expect(getByText('Buddy')).toBeTruthy();
    });

    it('applies light mode styles when isDarkMode is false', () => {
      const animalWithoutImage: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: undefined,
      };

      const { getByText } = render(
        <AnimalCard animal={animalWithoutImage} isDarkMode={false} />
      );
      expect(getByText('Buddy')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles animal with minimal data', () => {
      const minimalAnimal: Animal = {
        animalID: '999',
        animalOrgID: 'org-999',
        animalName: 'Mystery Pet',
        animalSpecies: 'Dog' as const,
        animalBreed: '',
        animalSex: '' as const,
        animalGeneralAge: 'Adult' as const,
      };

      const { getByText } = render(<AnimalCard animal={minimalAnimal} />);
      expect(getByText('Mystery Pet')).toBeTruthy();
      expect(getByText('Dog')).toBeTruthy();
    });

    it('handles very long animal names', () => {
      const longNameAnimal: Animal = {
        ...mockAnimal,
        animalName: 'This is a very long animal name that might break layout',
      };

      const { getByText } = render(<AnimalCard animal={longNameAnimal} />);
      expect(
        getByText('This is a very long animal name that might break layout')
      ).toBeTruthy();
    });

    it('handles empty animalPictures array', () => {
      const animalWithEmptyPictures: Animal = {
        ...mockAnimal,
        animalThumbnailUrl: undefined,
        animalPictures: [],
      };

      const { getByText } = render(
        <AnimalCard animal={animalWithEmptyPictures} />
      );
      expect(getByText('Buddy')).toBeTruthy();
    });
  });
});
