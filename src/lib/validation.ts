'use server';

import { initZodConfig } from '@/config/zod.config';
import { ValidationError } from '@/interfaces/errors/validation.error';
import { z, ZodError, ZodTypeAny } from 'zod';

// Initialize Zod configuration (once in the app's entry point)
initZodConfig();

// lib/validation.ts
export const verifyZodFields = async <T extends ZodTypeAny>(
  zodSchema: T,
  fields: Record<string, FormDataEntryValue | null>,
): Promise<{ success: true; data: z.infer<typeof zodSchema> }> => {
  const validationResult = zodSchema.safeParse(fields);

  if (!validationResult.success) {
    const formattedErrors = formatZodErrors(validationResult.error);
    throw new ValidationError(formattedErrors);
  }

  return {
    success: true,
    data: validationResult.data,
  };
};

// Helper function to format Zod errors
const formatZodErrors = (error: ZodError): Record<string, string> => {
  return error.errors.reduce((acc, curr) => {
    const field = curr.path[0].toString();
    acc[field] = curr.message;
    return acc;
  }, {} as Record<string, string>);
};
