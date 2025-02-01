'use server';

import { initZodConfig } from '@/config/zod.config';
import { ValidationError } from '@/interfaces/errors/validation.error';
import { z, ZodError, ZodSchema, ZodTypeAny } from 'zod';

// Initialize Zod configuration (once in the app's entry point)
initZodConfig();

// lib/validation.ts
export const verifyZodFields = async <T extends ZodTypeAny>(
  zodSchema: T,
  fields: Record<string, FormDataEntryValue | null>,
): Promise<z.infer<typeof zodSchema>> => {
  const validationResult = await zodSchema.parseAsync(fields);

  if (!validationResult.success) {
    const formattedErrors = formatZodErrors(validationResult.error);
    throw new ValidationError(formattedErrors);
  }

  return validationResult.data;
};

export async function validateSchema<T extends ZodSchema>(
  schema: T,
  data: Record<string, FormDataEntryValue | null>,
): Promise<{
  success: boolean;
  data?: z.infer<typeof schema>;
  error?: Record<string, string[]>;
}> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string[]> = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });

      return {
        success: false,
        error: formattedErrors,
      };
    }

    throw error;
  }
}

// Helper function to format Zod errors
const formatZodErrors = (error: ZodError): Record<string, string> => {
  return error.errors.reduce((acc, curr) => {
    const field = curr.path[0].toString();
    acc[field] = curr.message;
    return acc;
  }, {} as Record<string, string>);
};
