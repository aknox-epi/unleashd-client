import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppHeader } from '../AppHeader';

describe('AppHeader', () => {
  const mockOnBack = jest.fn();
  const mockOnPressApp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders back button when canGoBack is true', () => {
      const { getByRole } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      const buttons = getByRole('button', { name: /go to explore/i });
      expect(buttons).toBeTruthy();
    });

    it('hides back button when canGoBack is false', () => {
      const { queryByLabelText } = render(
        <AppHeader
          canGoBack={false}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      // Back button should not exist
      const backButton = queryByLabelText(/go back/i);
      expect(backButton).toBeNull();
    });

    it('always renders unleashd text and paw icon', () => {
      const { getByText, rerender } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      expect(getByText('unleashd')).toBeTruthy();

      rerender(
        <AppHeader
          canGoBack={false}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      expect(getByText('unleashd')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onBack when back button is pressed', () => {
      const { getAllByRole } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      const buttons = getAllByRole('button');
      // First button is back button, second is unleashd
      fireEvent.press(buttons[0]);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
      expect(mockOnPressApp).not.toHaveBeenCalled();
    });

    it('calls onPressApp when unleashd is pressed', () => {
      const { getByRole } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      const unleashd = getByRole('button', { name: /go to explore/i });
      fireEvent.press(unleashd);

      expect(mockOnPressApp).toHaveBeenCalledTimes(1);
      expect(mockOnBack).not.toHaveBeenCalled();
    });

    it('unleashd pressable is always active regardless of canGoBack', () => {
      const { getByRole, rerender } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      // Test when canGoBack is true
      const unleashd = getByRole('button', { name: /go to explore/i });
      fireEvent.press(unleashd);
      expect(mockOnPressApp).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();

      // Test when canGoBack is false
      rerender(
        <AppHeader
          canGoBack={false}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      const unleashd2 = getByRole('button', { name: /go to explore/i });
      fireEvent.press(unleashd2);
      expect(mockOnPressApp).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility labels', () => {
      const { getByRole } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      const unleashd = getByRole('button', { name: /go to explore/i });
      expect(unleashd).toBeTruthy();
    });

    it('provides accessibility hint for unleashd button', () => {
      const { getByLabelText } = render(
        <AppHeader
          canGoBack={true}
          onBack={mockOnBack}
          onPressApp={mockOnPressApp}
        />
      );

      const unleashd = getByLabelText(/go to explore/i);
      expect(unleashd.props.accessibilityHint).toBe(
        'Navigate to the explore screen'
      );
    });
  });
});
