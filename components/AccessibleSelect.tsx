import type React from 'react';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';

/**
 * AccessibleSelect - A wrapper around GlueStack's Select component
 * that removes the backdrop to prevent aria-hidden focus warnings.
 *
 * The backdrop is purely decorative and removing it doesn't affect
 * functionality - the Select dropdown still works perfectly without it.
 *
 * This fixes the browser warning:
 * "Blocked aria-hidden on an element because its descendant retained focus"
 */

type AccessibleSelectProps = React.ComponentProps<typeof Select>;
type AccessibleSelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;
type AccessibleSelectInputProps = React.ComponentProps<typeof SelectInput>;
type AccessibleSelectPortalProps = React.ComponentProps<typeof SelectPortal>;
type AccessibleSelectContentProps = React.ComponentProps<typeof SelectContent>;
type AccessibleSelectDragIndicatorWrapperProps = React.ComponentProps<
  typeof SelectDragIndicatorWrapper
>;
type AccessibleSelectDragIndicatorProps = React.ComponentProps<
  typeof SelectDragIndicator
>;
type AccessibleSelectItemProps = React.ComponentProps<typeof SelectItem>;

const AccessibleSelect = Select;
const AccessibleSelectTrigger = SelectTrigger;
const AccessibleSelectInput = SelectInput;
const AccessibleSelectPortal = SelectPortal;
const AccessibleSelectContent = SelectContent;
const AccessibleSelectDragIndicatorWrapper = SelectDragIndicatorWrapper;
const AccessibleSelectDragIndicator = SelectDragIndicator;
const AccessibleSelectItem = SelectItem;

export {
  AccessibleSelect,
  AccessibleSelectTrigger,
  AccessibleSelectInput,
  AccessibleSelectPortal,
  AccessibleSelectContent,
  AccessibleSelectDragIndicatorWrapper,
  AccessibleSelectDragIndicator,
  AccessibleSelectItem,
};

export type {
  AccessibleSelectProps,
  AccessibleSelectTriggerProps,
  AccessibleSelectInputProps,
  AccessibleSelectPortalProps,
  AccessibleSelectContentProps,
  AccessibleSelectDragIndicatorWrapperProps,
  AccessibleSelectDragIndicatorProps,
  AccessibleSelectItemProps,
};
