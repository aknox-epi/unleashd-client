import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SpeciesBadge } from '../SpeciesBadge';
import '@/components/ui/gluestack-ui-provider';

describe('SpeciesBadge', () => {
  it('renders the species name', () => {
    render(<SpeciesBadge species="Dog" />);
    expect(screen.getByText('Dog')).toBeTruthy();
  });

  it('renders with custom size', () => {
    render(<SpeciesBadge species="Cat" size="sm" />);
    expect(screen.getByText('Cat')).toBeTruthy();
  });

  it('renders with outline variant', () => {
    render(<SpeciesBadge species="Bird" variant="outline" />);
    expect(screen.getByText('Bird')).toBeTruthy();
  });

  it('handles dog species', () => {
    render(<SpeciesBadge species="Dog" />);
    expect(screen.getByText('Dog')).toBeTruthy();
  });

  it('handles cat species', () => {
    render(<SpeciesBadge species="Cat" />);
    expect(screen.getByText('Cat')).toBeTruthy();
  });

  it('handles bird species', () => {
    render(<SpeciesBadge species="Bird" />);
    expect(screen.getByText('Bird')).toBeTruthy();
  });

  it('handles rabbit species', () => {
    render(<SpeciesBadge species="Rabbit" />);
    expect(screen.getByText('Rabbit')).toBeTruthy();
  });

  it('handles small & furry species', () => {
    render(<SpeciesBadge species="Small&Furry" />);
    expect(screen.getByText('Small&Furry')).toBeTruthy();
  });

  it('handles reptile species', () => {
    render(<SpeciesBadge species="Reptile" />);
    expect(screen.getByText('Reptile')).toBeTruthy();
  });

  it('handles horse species', () => {
    render(<SpeciesBadge species="Horse" />);
    expect(screen.getByText('Horse')).toBeTruthy();
  });

  it('handles barnyard species', () => {
    render(<SpeciesBadge species="Barnyard" />);
    expect(screen.getByText('Barnyard')).toBeTruthy();
  });

  it('handles unknown species', () => {
    render(<SpeciesBadge species="Unknown Animal" />);
    expect(screen.getByText('Unknown Animal')).toBeTruthy();
  });

  it('handles case-insensitive species matching', () => {
    render(<SpeciesBadge species="DOG" />);
    expect(screen.getByText('DOG')).toBeTruthy();
  });

  it('handles species with extra whitespace', () => {
    render(<SpeciesBadge species="  Cat  " />);
    expect(screen.getByText('  Cat  ')).toBeTruthy();
  });
});
