import type { FormAttributeValidationRules } from '@/core/entities/models/listing-types/listing-types.dto';

export const YEAR_MIN_FALLBACK = 1950;
export const YEAR_MAX_FUTURE_OFFSET = 1;

/** Descending list of selectable years bounded by the admin-configured `validationRules`. */
export const buildYearList = (rules?: FormAttributeValidationRules | null): number[] => {
  const currentYear = new Date().getFullYear();
  const max = rules?.max ?? currentYear + YEAR_MAX_FUTURE_OFFSET;
  const min = rules?.min ?? YEAR_MIN_FALLBACK;
  if (max < min) return [];
  const years: number[] = [];
  for (let y = max; y >= min; y -= 1) years.push(y);
  return years;
};
