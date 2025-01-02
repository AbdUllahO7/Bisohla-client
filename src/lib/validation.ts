'use server';

import { initZodConfig } from '@/config/zod.config';
import { ZodTypeAny } from 'zod';

// Initialize Zod configuration (once in the app's entry point)
initZodConfig();

// lib/validation.ts
export const verifyZodFields = async <T extends ZodTypeAny>(
  zodSchema: T,
  fields: Record<string, FormDataEntryValue | null>,
) => {
  const validationFields = zodSchema.safeParse(fields);

  if (!validationFields.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validationFields.error.flatten().fieldErrors,
      fields: fields,
    };
  }

  return {
    success: true,
    data: validationFields.data,
  };
};
