import { useCallback, useMemo } from 'react';
import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { readSelectedOptionIds, resolveOptionLabel, type SupportedLocale } from '@/lib/listing-attributes/attribute-format/attribute-format';
import type { AttributeFormValue } from '@/lib/listing-attributes/types/attribute-form.types';
import { buildYearList } from '@/lib/listing-attributes/year-options/year-options';

export interface SelectOptionView {
  value: string;
  label: string;
  color?: string | null;
}

interface Args {
  attribute: FormAttributeDto;
  value: AttributeFormValue | undefined;
  locale: SupportedLocale;
  onChange: (value: AttributeFormValue) => void;
}

/** Per-type value coercion for the generic attribute control (mirrors mobile `useAttributeFormInputLogic`). */
export const useAttributeFieldLogic = ({ attribute, value, locale, onChange }: Args) => {
  const options = useMemo<SelectOptionView[]>(
    () =>
      (attribute.options ?? []).map((opt) => ({
        value: opt.id,
        label: resolveOptionLabel(attribute.options, opt.id, locale),
        color: opt.color ?? null,
      })),
    [attribute.options, locale],
  );

  const yearOptions = useMemo<SelectOptionView[]>(
    () => (attribute.type === 'year' ? buildYearList(attribute.validationRules).map((y) => ({ value: String(y), label: String(y) })) : []),
    [attribute.type, attribute.validationRules],
  );

  const stringValue = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
  const selectedIds = useMemo(() => readSelectedOptionIds(value), [value]);
  const translatable = useMemo<{ en: string | null; ar: string | null }>(
    () =>
      attribute.isTranslatable && value != null && typeof value === 'object' && !Array.isArray(value) && 'en' in value
        ? (value as { en: string | null; ar: string | null })
        : { en: null, ar: null },
    [attribute.isTranslatable, value],
  );
  const range = useMemo<{ min: number | null; max: number | null }>(
    () =>
      value != null && typeof value === 'object' && !Array.isArray(value) && 'min' in value
        ? (value as { min: number | null; max: number | null })
        : { min: null, max: null },
    [value],
  );

  const handleText = useCallback((text: string) => onChange(text === '' ? null : text), [onChange]);

  const handleTranslatable = useCallback(
    (lang: 'en' | 'ar', text: string) => {
      const next = { ...translatable, [lang]: text === '' ? null : text };
      onChange(next.en == null && next.ar == null ? null : next);
    },
    [onChange, translatable],
  );

  const handleNumber = useCallback(
    (raw: string) => {
      if (raw.trim() === '') return onChange(null);
      const n = parseFloat(raw);
      onChange(Number.isNaN(n) ? null : n);
    },
    [onChange],
  );

  const handleYear = useCallback((raw: string) => handleNumber(raw), [handleNumber]);

  /** Re-selecting the active option clears it (mobile chip behaviour). */
  const handleSelect = useCallback(
    (optionId: string) => onChange(optionId === '' || optionId === stringValue ? null : optionId),
    [onChange, stringValue],
  );

  const handleMulti = useCallback(
    (ids: string[]) => {
      const deduped = [...new Set(ids.map(String))];
      onChange(deduped.length === 0 ? null : deduped);
    },
    [onChange],
  );

  const handleToggleOption = useCallback(
    (optionId: string, checked: boolean) =>
      handleMulti(checked ? [...selectedIds, optionId] : selectedIds.filter((id) => id !== optionId)),
    [handleMulti, selectedIds],
  );

  const handleBoolean = useCallback((checked: boolean) => onChange(Boolean(checked)), [onChange]);

  const handleDate = useCallback(
    (date: Date | undefined) => onChange(date ? date.toISOString().slice(0, 10) : null),
    [onChange],
  );

  const handleRange = useCallback(
    (bound: 'min' | 'max', raw: string) => {
      const n = raw.trim() === '' ? null : parseFloat(raw);
      const next = { ...range, [bound]: n == null || Number.isNaN(n) ? null : n };
      onChange(next.min == null && next.max == null ? null : next);
    },
    [onChange, range],
  );

  return {
    options,
    yearOptions,
    stringValue,
    selectedIds,
    translatable,
    range,
    dateValue: typeof value === 'string' && value ? new Date(value) : undefined,
    booleanValue: value === true,
    handleText,
    handleTranslatable,
    handleNumber,
    handleYear,
    handleSelect,
    handleMulti,
    handleToggleOption,
    handleBoolean,
    handleDate,
    handleRange,
  };
};
