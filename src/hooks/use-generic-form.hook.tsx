'use client';

import { useState } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutationResult } from '@tanstack/react-query';
import { ApiResponse } from '@/interfaces/api-response.interface';

// Define the specific server error structure
interface ServerErrorResponse {
  debug?: {
    stack: null | string;
    code: number;
  };
  data?: Record<string, string[]>;
  message: string;
  success: boolean;
}

// Generic error type that works across all forms
export interface FormError {
  type: 'client' | 'server' | 'general';
  message: string;
}

export type FormErrorMap = Record<string, FormError>;

// Generic form hook that can be used with unknown form
export function useGenericForm<TFormValues extends Record<string, unknown>>({
  schema,
  mutationHook,
  onSuccessCallback,
}: {
  schema: ZodSchema;
  mutationHook: (options: {
    onSuccess: (result: ApiResponse) => void;
    onError: (error: Error) => void;
  }) => UseMutationResult<unknown, Error, TFormValues>;
  onSuccessCallback?: (result: ApiResponse) => void;
}) {
  // State to hold all form errors
  const [formErrors, setFormErrors] = useState<FormErrorMap>({});

  // Setup react-hook-form with zod validation
  const formMethods = useForm<TFormValues>({
    resolver: zodResolver(schema),
  });

  // Transform react-hook-form errors to our FormError type
  const transformFormErrors = (
    errors: FieldErrors<TFormValues>,
  ): FormErrorMap => {
    return Object.entries(errors).reduce((acc, [key, error]) => {
      acc[key] = {
        type: 'client',
        message: error?.message?.toString() || 'Invalid input', // Ensure Zod's custom message is used
      };
      return acc;
    }, {} as FormErrorMap);
  };

  // Create mutation
  const mutation = mutationHook({
    onSuccess: (result: ApiResponse) => {
      // Reset errors on successful submission
      setFormErrors({});
      // Call success callback if provided
      onSuccessCallback?.(result);
    },
    onError: (error: Error & { response?: { data?: ServerErrorResponse } }) => {
      const serverError = error.response?.data;
      const errorMap: FormErrorMap = {};

      // Handle server-side validation errors
      if (serverError && !serverError.success) {
        // If specific field errors exist
        if (serverError.data) {
          Object.entries(serverError.data).forEach(([field, messages]) => {
            errorMap[field] = {
              type: 'server',
              message: messages[0] || 'Validation error',
            };
          });
        }

        // Add general error message if no specific field errors
        if (Object.keys(errorMap).length === 0) {
          errorMap['general'] = {
            type: 'general',
            message: serverError.message || 'An error occurred',
          };
        }
      }
      // Fallback for unexpected errors
      else {
        errorMap['general'] = {
          type: 'general',
          message: error.message || 'An unexpected error occurred',
        };
      }

      console.error(error);

      // Set form errors
      setFormErrors(errorMap);
    },
  });

  // Submit handler
  const handleSubmit = formMethods.handleSubmit((data) => {
    // Clear previous errors before submission
    setFormErrors({});
    // Trigger mutation
    mutation.mutate(data);
  });

  // Merge client-side and server-side errors
  const mergedErrors: FormErrorMap = {
    ...transformFormErrors(formMethods.formState.errors),
    ...formErrors,
  };

  return {
    // Spread all react-hook-form methods
    ...formMethods,
    // Override submit handler
    handleSubmit,
    // Merged errors
    errors: mergedErrors,
    // Mutation status
    isSubmitting: formMethods.formState.isSubmitting || mutation.isPending,
    isError: Object.keys(mergedErrors).length > 0,
    // Expose mutation for advanced use cases
    mutation,
  };
}
