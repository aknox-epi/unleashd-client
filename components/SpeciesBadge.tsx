import React from 'react';
import { Badge, BadgeText } from '@/components/ui/badge';

type Species =
  | 'Dog'
  | 'Cat'
  | 'Bird'
  | 'Rabbit'
  | 'Small&Furry'
  | 'Horse'
  | 'Reptile'
  | 'Barnyard'
  | string;

interface SpeciesBadgeProps {
  species: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

/**
 * Maps species to GlueStack color tokens for consistent theming
 * Uses badge action prop which maps to theme colors
 */
const getSpeciesAction = (
  species: Species
): 'info' | 'success' | 'warning' | 'error' | 'muted' => {
  const normalizedSpecies = species.toLowerCase().trim();

  // Color mapping using GlueStack tokens:
  // - info: blue (dogs, aquatic)
  // - success: green (cats, reptiles)
  // - warning: orange (birds, small animals)
  // - error: red (exotic/special care)
  // - muted: gray (unknown/other)

  if (normalizedSpecies.includes('dog')) {
    return 'info'; // Blue
  } else if (normalizedSpecies.includes('cat')) {
    return 'success'; // Green
  } else if (normalizedSpecies.includes('bird')) {
    return 'warning'; // Orange
  } else if (
    normalizedSpecies.includes('rabbit') ||
    normalizedSpecies.includes('small') ||
    normalizedSpecies.includes('furry')
  ) {
    return 'warning'; // Orange
  } else if (
    normalizedSpecies.includes('reptile') ||
    normalizedSpecies.includes('scales')
  ) {
    return 'success'; // Green
  } else if (
    normalizedSpecies.includes('horse') ||
    normalizedSpecies.includes('barnyard') ||
    normalizedSpecies.includes('farm')
  ) {
    return 'warning'; // Orange
  } else {
    return 'muted'; // Gray for unknown
  }
};

/**
 * SpeciesBadge component
 *
 * Displays a badge with species-specific colors pulled from GlueStack theme tokens.
 * Ensures consistent coloring across the app for different animal species.
 *
 * @param species - The animal species (e.g., "Dog", "Cat", "Bird")
 * @param size - Badge size: 'sm', 'md', or 'lg' (default: 'md')
 * @param variant - Badge variant: 'solid' or 'outline' (default: 'solid')
 *
 * @example
 * <SpeciesBadge species="Dog" />
 * <SpeciesBadge species="Cat" size="sm" variant="outline" />
 */
export const SpeciesBadge: React.FC<SpeciesBadgeProps> = ({
  species,
  size = 'md',
  variant = 'solid',
}) => {
  const action = getSpeciesAction(species);

  return (
    <Badge action={action} variant={variant} size={size}>
      <BadgeText>{species}</BadgeText>
    </Badge>
  );
};

SpeciesBadge.displayName = 'SpeciesBadge';
