import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OrganizationCard } from '../OrganizationCard';
import type { Organization } from '@/services/rescuegroups';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('OrganizationCard', () => {
  const mockOrganization: Organization = {
    orgID: 'org-123',
    orgName: 'Happy Tails Rescue',
    orgType: 'Rescue Group',
    orgAbout: 'We rescue and rehome dogs and cats',
    orgLocationCitystate: 'San Francisco, CA',
    orgCity: 'San Francisco',
    orgState: 'CA',
    orgPhone: '555-0123',
    orgEmail: 'info@happytails.org',
    orgWebsiteUrl: 'https://happytails.org',
    orgDistance: 5.2,
  };

  describe('Rendering', () => {
    it('renders organization name', () => {
      const { getByText } = render(
        <OrganizationCard organization={mockOrganization} />
      );
      expect(getByText('Happy Tails Rescue')).toBeTruthy();
    });

    it('renders organization type', () => {
      const { getByText } = render(
        <OrganizationCard organization={mockOrganization} />
      );
      expect(getByText('Rescue Group')).toBeTruthy();
    });

    it('renders location when orgLocationCitystate is available', () => {
      const { getByText } = render(
        <OrganizationCard organization={mockOrganization} />
      );
      expect(getByText('San Francisco, CA')).toBeTruthy();
    });

    it('renders location from orgCity and orgState when orgLocationCitystate is missing', () => {
      const orgWithoutCitystate = {
        ...mockOrganization,
        orgLocationCitystate: undefined,
      };
      const { getByText } = render(
        <OrganizationCard organization={orgWithoutCitystate} />
      );
      expect(getByText('San Francisco, CA')).toBeTruthy();
    });

    it('does not render location when no location data available', () => {
      const orgWithoutLocation = {
        ...mockOrganization,
        orgLocationCitystate: undefined,
        orgCity: undefined,
        orgState: undefined,
      };
      const { queryByText } = render(
        <OrganizationCard organization={orgWithoutLocation} />
      );
      expect(queryByText(/San Francisco/)).toBeNull();
    });
  });

  describe('Variants', () => {
    it('renders compact variant by default', () => {
      const { queryByText } = render(
        <OrganizationCard organization={mockOrganization} />
      );
      // Compact variant should not show phone/email/website details
      expect(queryByText('555-0123')).toBeNull();
    });

    it('renders detailed variant with contact information', () => {
      const { getByText } = render(
        <OrganizationCard organization={mockOrganization} variant="detailed" />
      );
      expect(getByText('555-0123')).toBeTruthy();
      expect(getByText('info@happytails.org')).toBeTruthy();
      expect(getByText('Website')).toBeTruthy();
    });

    it('renders detailed variant with about text', () => {
      const { getByText } = render(
        <OrganizationCard organization={mockOrganization} variant="detailed" />
      );
      expect(getByText('We rescue and rehome dogs and cats')).toBeTruthy();
    });

    it('does not render about text in compact variant', () => {
      const { queryByText } = render(
        <OrganizationCard organization={mockOrganization} variant="compact" />
      );
      expect(queryByText('We rescue and rehome dogs and cats')).toBeNull();
    });
  });

  describe('Distance Display', () => {
    it('shows distance when showDistance is true', () => {
      const { getByText } = render(
        <OrganizationCard organization={mockOrganization} showDistance={true} />
      );
      expect(getByText('5.2 miles')).toBeTruthy();
    });

    it('does not show distance when showDistance is false', () => {
      const { queryByText } = render(
        <OrganizationCard
          organization={mockOrganization}
          showDistance={false}
        />
      );
      expect(queryByText(/miles/)).toBeNull();
    });

    it('formats distance under 10 miles with 1 decimal', () => {
      const org = { ...mockOrganization, orgDistance: 5.234 };
      const { getByText } = render(
        <OrganizationCard organization={org} showDistance={true} />
      );
      expect(getByText('5.2 miles')).toBeTruthy();
    });

    it('formats distance 10+ miles as whole number', () => {
      const org = { ...mockOrganization, orgDistance: 15.7 };
      const { getByText } = render(
        <OrganizationCard organization={org} showDistance={true} />
      );
      expect(getByText('16 miles')).toBeTruthy();
    });

    it('does not show distance when orgDistance is undefined', () => {
      const org = { ...mockOrganization, orgDistance: undefined };
      const { queryByText } = render(
        <OrganizationCard organization={org} showDistance={true} />
      );
      expect(queryByText(/miles/)).toBeNull();
    });
  });

  describe('Favorite Functionality', () => {
    it('shows favorite button when showFavorite is true', () => {
      const { getByTestId } = render(
        <OrganizationCard organization={mockOrganization} showFavorite={true} />
      );
      expect(getByTestId('favorite-button-org-123')).toBeTruthy();
    });

    it('does not show favorite button when showFavorite is false', () => {
      const { queryByTestId } = render(
        <OrganizationCard
          organization={mockOrganization}
          showFavorite={false}
        />
      );
      expect(queryByTestId('favorite-button-org-123')).toBeNull();
    });

    it('calls onFavoritePress when favorite button is pressed', async () => {
      const onFavoritePress = jest.fn();
      const { getByTestId } = render(
        <OrganizationCard
          organization={mockOrganization}
          showFavorite={true}
          onFavoritePress={onFavoritePress}
        />
      );

      const favoriteButton = getByTestId('favorite-button-org-123');
      await fireEvent.press(favoriteButton);

      expect(onFavoritePress).toHaveBeenCalledWith(mockOrganization);
    });
  });

  describe('Pressable', () => {
    it('is pressable when onPress is provided', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <OrganizationCard organization={mockOrganization} onPress={onPress} />
      );
      expect(getByTestId('organization-card-org-123')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <OrganizationCard organization={mockOrganization} onPress={onPress} />
      );

      const card = getByTestId('organization-card-org-123');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledWith(mockOrganization);
    });

    it('is not wrapped in Pressable when onPress is not provided', () => {
      const { queryByTestId } = render(
        <OrganizationCard organization={mockOrganization} />
      );
      expect(queryByTestId('organization-card-org-123')).toBeNull();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode styles when isDarkMode is true', () => {
      const { getByTestId } = render(
        <OrganizationCard
          organization={mockOrganization}
          isDarkMode={true}
          onPress={jest.fn()}
        />
      );
      const card = getByTestId('organization-card-org-123');
      expect(card).toBeTruthy();
    });

    it('applies light mode styles by default', () => {
      const { getByTestId } = render(
        <OrganizationCard organization={mockOrganization} onPress={jest.fn()} />
      );
      const card = getByTestId('organization-card-org-123');
      expect(card).toBeTruthy();
    });
  });

  describe('Missing Data Handling', () => {
    it('renders without optional fields', () => {
      const minimalOrg: Organization = {
        orgID: 'org-456',
        orgName: 'Minimal Rescue',
      };

      const { getByText } = render(
        <OrganizationCard organization={minimalOrg} />
      );
      expect(getByText('Minimal Rescue')).toBeTruthy();
    });

    it('does not render contact info in detailed variant when not available', () => {
      const orgWithoutContact: Organization = {
        orgID: 'org-789',
        orgName: 'No Contact Rescue',
      };

      const { queryByText } = render(
        <OrganizationCard organization={orgWithoutContact} variant="detailed" />
      );
      expect(queryByText(/555/)).toBeNull();
      expect(queryByText(/@/)).toBeNull();
    });
  });
});
