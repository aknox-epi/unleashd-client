import React from 'react';
import { render } from '@testing-library/react-native';
import { AnimalCardSkeleton } from '../AnimalCardSkeleton';

describe('AnimalCardSkeleton', () => {
  it('renders skeleton component in light mode', () => {
    const { toJSON } = render(<AnimalCardSkeleton isDarkMode={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders skeleton component in dark mode', () => {
    const { toJSON } = render(<AnimalCardSkeleton isDarkMode={true} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with default props', () => {
    const { toJSON } = render(<AnimalCardSkeleton />);
    expect(toJSON()).toBeTruthy();
  });
});
