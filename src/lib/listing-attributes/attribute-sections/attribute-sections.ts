import type { FormAttributeDto, SectionDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';
import {
  formatAttributeValue,
  readSelectedOptionIds,
  renderRepeatingGroupRows,
  resolveOptionColor,
  resolveOptionLabel,
  resolveStoredSwatch,
  type FormatLabels,
  type RepeatingGroupRow,
  type SupportedLocale,
} from '../attribute-format/attribute-format';
import { isHiddenByConditionalRequirement } from '../conditional-requirement/conditional-requirement';
import type { ReferenceMetadataMap } from '../types/attribute-form.types';
import { detailValueToNormalized, evaluateValueDependency } from '../value-dependency/value-dependency';

export interface SimpleDisplayRow {
  kind: 'simple';
  attributeId: number;
  slug: string;
  type: string;
  label: string;
  hint: string | null;
  iconUrl: string | null;
  value: string;
  swatch: string | null;
  isPendingProposal: boolean;
}

export interface ChipsDisplayRow {
  kind: 'chips';
  attributeId: number;
  slug: string;
  type: string;
  label: string;
  iconUrl: string | null;
  chips: { id: string; label: string; color: string | null }[];
}

export interface RepeatingDisplayRow {
  kind: 'repeating';
  attributeId: number;
  slug: string;
  type: string;
  label: string;
  attribute: FormAttributeDto;
  /** Raw stored items, keyed by child slug — what a preset viewer (damage blueprint) reads. */
  items: Record<string, unknown>[];
  rows: RepeatingGroupRow[];
}

export type DisplayRow = SimpleDisplayRow | ChipsDisplayRow | RepeatingDisplayRow;

export interface DisplaySection {
  id: number;
  name: string;
  rows: DisplayRow[];
}

const CHIP_TYPES = new Set(['multi_select', 'color_multi_selection']);

/**
 * Schema-driven read model for the listing details page (mirrors mobile's
 * `useAttributeTableLogic`): attributes in schema order, hidden by `valueDependency`
 * and `conditionallyRequiredWhen` (the latter only once the parent resolved),
 * unfilled simple attributes kept as `—`, empty chips/repeating rows and empty
 * sections dropped.
 */
export const buildListingAttributeSections = (args: {
  sections: SectionDto[];
  attributeValues: GenericAttributeValue[];
  /** parent attribute id → resolved ref-item metadata; absent id = unresolved (don't hide). */
  parentMetadataById: ReferenceMetadataMap;
  locale: SupportedLocale;
  labels: FormatLabels;
}): DisplaySection[] => {
  const { sections, attributeValues, parentMetadataById, locale, labels } = args;
  if (attributeValues.length === 0) return [];

  const activeSections = sections.filter((s) => s.isActive !== false);
  const allAttrs = activeSections.flatMap((s) => s.attributes).filter((a) => a.isActive !== false);
  const bySlug: Record<string, FormAttributeDto> = {};
  for (const a of allAttrs) bySlug[a.slug] = a;
  const valueByAttrId = new Map(attributeValues.map((av) => [av.attributeId, av]));

  const isHidden = (attr: FormAttributeDto): boolean => {
    if (attr.valueDependency) {
      const ref = bySlug[attr.valueDependency.refAttributeSlug];
      if (ref && evaluateValueDependency(attr.valueDependency, detailValueToNormalized(ref, valueByAttrId.get(ref.id)))) return true;
    }
    if (attr.conditionallyRequiredWhen) {
      const parent = bySlug[attr.conditionallyRequiredWhen.refAttributeSlug];
      if (parent && parent.id in parentMetadataById) {
        return isHiddenByConditionalRequirement(attr.conditionallyRequiredWhen, parentMetadataById[parent.id]);
      }
    }
    return false;
  };

  return activeSections
    .map((section): DisplaySection => {
      const rows: DisplayRow[] = [];
      for (const attr of section.attributes.filter((a) => a.isActive !== false).sort((a, b) => a.order - b.order)) {
        if (isHidden(attr)) continue;
        const stored = valueByAttrId.get(attr.id) ?? null;
        const base = { attributeId: attr.id, slug: attr.slug, type: attr.type, label: attr.name, iconUrl: attr.iconUrl ?? null };

        if (attr.type === 'repeating_group') {
          const items = Array.isArray(stored?.valueJson) ? (stored!.valueJson as Record<string, unknown>[]) : [];
          if (items.length === 0) continue;
          rows.push({ kind: 'repeating', ...base, attribute: attr, items, rows: renderRepeatingGroupRows(attr, items, locale, labels) });
          continue;
        }

        if (CHIP_TYPES.has(attr.type)) {
          const ids = readSelectedOptionIds(stored?.valueJson);
          if (ids.length === 0) continue;
          rows.push({
            kind: 'chips',
            ...base,
            chips: ids.map((id) => ({ id, label: resolveOptionLabel(attr.options, id, locale), color: resolveOptionColor(attr.options, id) })),
          });
          continue;
        }

        const pending = stored?.refItemProposal?.status === 'pending';
        const value = pending ? stored?.refItemProposal?.submittedName ?? '' : formatAttributeValue(attr, stored, locale, labels);
        rows.push({
          kind: 'simple',
          ...base,
          hint: attr.hint ?? null,
          value,
          swatch: resolveStoredSwatch(attr, stored),
          isPendingProposal: pending,
        });
      }
      return { id: section.id, name: section.name, rows };
    })
    .filter((s) => s.rows.length > 0);
};

/** One desktop row of the quick-specs strip (`xl:grid-cols-5` in AttributeGrid). */
export const QUICK_SPECS_LIMIT = 5;

/**
 * Lifts the first `limit` FILLED simple rows of the first section into the strip above the
 * images; everything else (incl. the remainder of that section, order kept) stays in the cards.
 */
export const splitQuickSpecs = (
  sections: DisplaySection[],
  limit = QUICK_SPECS_LIMIT,
): { quickSpecs: SimpleDisplayRow[]; sections: DisplaySection[] } => {
  const [first, ...rest] = sections;
  if (!first) return { quickSpecs: [], sections: [] };

  const quickSpecs: SimpleDisplayRow[] = [];
  const remaining: DisplayRow[] = [];
  for (const row of first.rows) {
    if (row.kind === 'simple' && row.value && quickSpecs.length < limit) quickSpecs.push(row);
    else remaining.push(row);
  }
  return {
    quickSpecs,
    sections: remaining.length > 0 ? [{ ...first, rows: remaining }, ...rest] : rest,
  };
};
