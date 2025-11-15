import React, { useEffect, useRef } from 'react';
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast';
import { isProduction } from '@/utils/env';
import { getErrorMessage } from '@/services/rescuegroups';
import type { RescueGroupsAPIError } from '@/services/rescuegroups';

/**
 * Custom hook to show toast notifications for errors and warnings in production
 * In development, banners are shown instead (handled in the component)
 */
export function useWarningToast(
  warnings: string[],
  error: RescueGroupsAPIError | Error | null
): void {
  const toast = useToast();
  const prevWarningsRef = useRef<string[]>([]);
  const prevErrorRef = useRef<RescueGroupsAPIError | Error | null>(null);

  useEffect(() => {
    // Only show toasts in production
    if (!isProduction()) {
      return;
    }

    // Show error toast if error changed
    if (error && error !== prevErrorRef.current) {
      const errorMessage = getErrorMessage(error);
      toast.show({
        placement: 'top',
        duration: 5000,
        render: ({ id }) => (
          <Toast nativeID={id} action="error" variant="solid">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{errorMessage}</ToastDescription>
          </Toast>
        ),
      });
      prevErrorRef.current = error;
    }

    // Show warning toast if warnings changed and have items
    if (
      warnings.length > 0 &&
      JSON.stringify(warnings) !== JSON.stringify(prevWarningsRef.current)
    ) {
      const warningMessage =
        warnings.length === 1
          ? warnings[0]
          : `${warnings.length} warnings: ${warnings[0]}${warnings.length > 1 ? '...' : ''}`;

      toast.show({
        placement: 'top',
        duration: 5000,
        render: ({ id }) => (
          <Toast nativeID={id} action="warning" variant="solid">
            <ToastTitle>API Warning</ToastTitle>
            <ToastDescription>{warningMessage}</ToastDescription>
          </Toast>
        ),
      });
      prevWarningsRef.current = warnings;
    }

    // Clear previous error if it's now null
    if (!error && prevErrorRef.current) {
      prevErrorRef.current = null;
    }

    // Clear previous warnings if empty
    if (warnings.length === 0 && prevWarningsRef.current.length > 0) {
      prevWarningsRef.current = [];
    }
  }, [warnings, error, toast]);
}
