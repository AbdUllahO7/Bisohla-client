import type {
  FormAttributeDto,
  FormAttributeOptionDto,
} from '@/core/entities/models/listing-types/listing-types.dto';
import type { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';

export type SupportedLocale = 'en' | 'ar';

export interface FormatLabels {
  yes: string;
  no: string;
}

export type AttributeForFormat = Pick<FormAttributeDto, 'type' | 'isTranslatable'> & {
  options?: FormAttributeOptionDto[] | null;
};

export type StoredValue = Partial<
  Pick<
    GenericAttributeValue,
    'valueText' | 'valueNumber' | 'valueBoolean' | 'valueDate' | 'valueJson' | 'valueTextTranslations' | 'referenceItem'
  >
>;

/** A stored multi-select can carry the same id twice; every React key path must dedupe. */
export const readSelectedOptionIds = (valueJson: unknown): string[] =>
  Array.isArray(valueJson) ? [...new Set((valueJson as unknown[]).map(String))] : [];

export const resolveOptionLabel = (
  options: FormAttributeOptionDto[] | null | undefined,
  optionId: string,
  locale: SupportedLocale,
): string => {
  const opt = options?.find((o) => o.id === optionId);
  if (!opt) return optionId;
  return opt.label?.[locale] || opt.label?.en || optionId;
};

export const resolveOptionColor = (
  options: FormAttributeOptionDto[] | null | undefined,
  optionId: string,
): string | null => options?.find((o) => o.id === optionId)?.color ?? null;

const formatNumber = (n: number, locale: SupportedLocale): string =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(n);

const formatDate = (iso: string, locale: SupportedLocale): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(d);
};

/**
 * One display string per stored value (mirrors mobile `attributeFormat.ts`). Empty
 * string means "nothing to show" so callers can render `—` with one check.
 * Translatable text reads the active locale only — no cross-locale fallback.
 */
export const formatAttributeValue = (
  attribute: AttributeForFormat,
  value: StoredValue | null | undefined,
  locale: SupportedLocale,
  labels: FormatLabels,
): string => {
  if (!value) return '';
  switch (attribute.type) {
    case 'boolean':
      if (value.valueBoolean == null) return '';
      return value.valueBoolean ? labels.yes : labels.no;

    case 'number': {
      if (value.valueNumber == null) return '';
      const n = Number(value.valueNumber);
      return Number.isNaN(n) ? String(value.valueNumber) : formatNumber(n, locale);
    }

    case 'year': {
      if (value.valueNumber == null) return '';
      const n = Number(value.valueNumber);
      return Number.isNaN(n) ? String(value.valueNumber) : String(Math.trunc(n));
    }

    case 'range': {
      const range = value.valueJson as { min?: number; max?: number } | null | undefined;
      if (range && (range.min != null || range.max != null)) {
        const parts: string[] = [];
        if (range.min != null) parts.push(formatNumber(Number(range.min), locale));
        if (range.max != null) parts.push(formatNumber(Number(range.max), locale));
        return parts.join(' – ');
      }
      return '';
    }

    case 'date':
      return value.valueDate ? formatDate(value.valueDate, locale) : '';

    case 'select':
    case 'color_selection':
      return value.valueText ? resolveOptionLabel(attribute.options, value.valueText, locale) : '';

    case 'color_picker':
      return value.valueText ?? '';

    case 'multi_select':
    case 'color_multi_selection': {
      const ids = readSelectedOptionIds(value.valueJson);
      return ids.map((id) => resolveOptionLabel(attribute.options, id, locale)).join(', ');
    }

    case 'reference':
      return value.referenceItem?.name ?? '';

    case 'repeating_group': {
      const items = Array.isArray(value.valueJson) ? value.valueJson : [];
      return items.length > 0 ? `(${items.length})` : '';
    }

    case 'text':
    case 'textarea':
    default: {
      if (attribute.isTranslatable && value.valueTextTranslations) {
        return value.valueTextTranslations[locale] ?? '';
      }
      return value.valueText ?? '';
    }
  }
};

/** Swatch colour for a stored colour value, when the type carries one. */
export const resolveStoredSwatch = (attribute: AttributeForFormat, value: StoredValue | null | undefined): string | null => {
  if (!value) return null;
  if (attribute.type === 'color_picker') return value.valueText ?? null;
  if (attribute.type === 'color_selection' && value.valueText) return resolveOptionColor(attribute.options, value.valueText);
  return null;
};

export interface RepeatingGroupRow {
  index: number;
  title: string;
  cells: { childId: number; label: string; value: string; swatch: string | null }[];
}

/** Rows of a stored `repeating_group`: each item keyed by CHILD SLUG; title = first non-empty cell. */
export const renderRepeatingGroupRows = (
  attribute: Pick<FormAttributeDto, 'childAttributes'>,
  valueJson: unknown,
  locale: SupportedLocale,
  labels: FormatLabels,
): RepeatingGroupRow[] => {
  const items = Array.isArray(valueJson) ? (valueJson as Record<string, unknown>[]) : [];
  const children = (attribute.childAttributes ?? []).filter((c) => c.isActive !== false);

  return items.map((item, index) => {
    const cells = children
      .map((child) => {
        const raw = item[child.slug];
        const stored = rawToStored(child, raw);
        const value = formatAttributeValue(child, stored, locale, labels);
        return { childId: child.id, label: child.name, value, swatch: resolveStoredSwatch(child, stored) };
      })
      .filter((c) => c.value !== '');
    return { index, title: cells[0]?.value ?? '', cells };
  });
};

/** Wrap a raw repeating-group cell into the column shape `formatAttributeValue` reads. */
const rawToStored = (child: Pick<FormAttributeDto, 'type'>, raw: unknown): StoredValue | null => {
  if (raw == null) return null;
  switch (child.type) {
    case 'boolean':
      return { valueBoolean: Boolean(raw) };
    case 'number':
    case 'year':
      return { valueNumber: String(raw) };
    case 'date':
      return { valueDate: String(raw) };
    case 'multi_select':
    case 'color_multi_selection':
    case 'range':
      return { valueJson: raw };
    case 'reference':
      return typeof raw === 'object' ? { referenceItem: raw as GenericAttributeValue['referenceItem'] } : { valueText: String(raw) };
    default:
      return typeof raw === 'object' && !Array.isArray(raw)
        ? { valueTextTranslations: raw as Record<string, string> }
        : { valueText: String(raw) };
  }
};
