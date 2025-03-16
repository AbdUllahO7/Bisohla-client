import { z, ZodError, ZodSchema, ZodTypeAny } from 'zod';
import { initZodConfig } from '../config/zod.config';
import { ValidationError } from '../entities/errors/validation-error';

// Initialize Zod configuration (once in the app's entry point)
initZodConfig();

// lib/validation.ts
export const verifyZodFields = async <T extends ZodTypeAny>(
  zodSchema: T,
  fields: Record<string, FormDataEntryValue | null>,
): Promise<z.infer<typeof zodSchema>> => {
  const validationResult = await zodSchema.parseAsync(fields);

  if (!validationResult.success) {
    const formattedErrors = await formatZodErrors(validationResult.error);
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
  errors?: Record<string, string>;
}> {
  try {
    const validatedData = await schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = await formatZodErrors(error);

      return {
        success: false,
        errors: formattedErrors,
      };
    }

    throw error;
  }
}

// Helper function to format Zod errors
const formatZodErrors = async (
  error: ZodError,
): Promise<Record<string, string>> => {
  return error.errors.reduce((acc, curr) => {
    const field = curr.path[0].toString();
    acc[field] = curr.message;
    return acc;
  }, {} as Record<string, string>);
};
