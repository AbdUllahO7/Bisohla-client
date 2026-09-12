import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import {
  isConditionallyRequiredSatisfied,
  isHiddenByConditionalRequirement,
} from '../conditional-requirement/conditional-requirement';
import type {
  AttributeErrorMap,
  AttributeFormValue,
  AttributeValueMap,
  ReferenceMetadataMap,
  ReferenceProposalMap,
} from '../types/attribute-form.types';
import { isAttributeHiddenByDependency } from '../value-dependency/value-dependency';

export const ATTRIBUTE_ERROR_KEYS = {
  required: 'errors.required',
  minLength: 'errors.min_length',
  maxLength: 'errors.max_length',
  regex: 'errors.regex',
  min: 'errors.min',
  max: 'errors.max',
  repeatingChildRequired: 'errors.repeating_child_required',
} as const;

export const hasAttributeValue = (
  attr: Pick<FormAttributeDto, 'type' | 'isTranslatable'>,
  value: AttributeFormValue | undefined,
  hasProposal = false,
): boolean => {
  if (attr.type === 'reference' && hasProposal) return true;
  if (value === null || value === undefined) return false;

  switch (attr.type) {
    case 'text':
    case 'textarea': {
      if (attr.isTranslatable) {
        if (typeof value !== 'object' || Array.isArray(value)) return false;
        const tv = value as { en: string | null; ar: string | null };
        return (tv.en != null && tv.en !== '') || (tv.ar != null && tv.ar !== '');
      }
      return typeof value === 'string' && value.trim().length > 0;
    }
    case 'number':
    case 'year':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'select':
    case 'color_selection':
    case 'color_picker':
      return typeof value === 'string' && value.length > 0;
    case 'multi_select':
    case 'color_multi_selection':
      return Array.isArray(value) && value.length > 0;
    case 'date':
      return typeof value === 'string' && value.length > 0;
    case 'reference':
      return typeof value === 'number' && value > 0;
    case 'range': {
      if (typeof value !== 'object' || Array.isArray(value)) return false;
      const r = value as { min: number | null; max: number | null };
      return r.min != null || r.max != null;
    }
    case 'repeating_group':
      return Array.isArray(value) && value.length > 0;
    default:
      return value !== '';
  }
};

/** Untouched booleans mean "no" — seed them for validation only, never persist the copy. */
export const withBooleanDefaults = (
  attributes: Pick<FormAttributeDto, 'id' | 'type'>[],
  values: AttributeValueMap,
): AttributeValueMap => {
  const next = { ...values };
  for (const attr of attributes) {
    if (attr.type === 'boolean' && next[attr.id] == null) next[attr.id] = false;
  }
  return next;
};

export const validateAttribute = (
  attr: FormAttributeDto,
  value: AttributeFormValue | undefined,
  effectiveRequired: boolean,
  hasProposal = false,
): string | null => {
  if (effectiveRequired && !hasAttributeValue(attr, value, hasProposal)) {
    return ATTRIBUTE_ERROR_KEYS.required;
  }
  if (!hasAttributeValue(attr, value, hasProposal)) return null;
  if (hasProposal) return null;

  const rules = attr.validationRules;
  if (rules == null) return null;

  switch (attr.type) {
    case 'text':
    case 'textarea': {
      const text = attr.isTranslatable
        ? Object.values(value as { en: string | null; ar: string | null })
            .filter((v): v is string => v != null && v !== '')
            .join('')
        : String(value);
      if (rules.minLength != null && text.length < rules.minLength) return ATTRIBUTE_ERROR_KEYS.minLength;
      if (rules.maxLength != null && text.length > rules.maxLength) return ATTRIBUTE_ERROR_KEYS.maxLength;
      if (rules.regex != null) {
        try {
          if (!new RegExp(rules.regex).test(text)) return ATTRIBUTE_ERROR_KEYS.regex;
        } catch {
          // A malformed admin regex must not block the seller.
        }
      }
      return null;
    }
    case 'number':
    case 'year': {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (Number.isNaN(num)) return ATTRIBUTE_ERROR_KEYS.required;
      if (attr.type === 'year' && !Number.isInteger(num)) return ATTRIBUTE_ERROR_KEYS.min;
      if (rules.min != null && num < rules.min) return ATTRIBUTE_ERROR_KEYS.min;
      if (rules.max != null && num > rules.max) return ATTRIBUTE_ERROR_KEYS.max;
      return null;
    }
    default:
      return null;
  }
};

export interface ValidateContext {
  attributeBySlug: Record<string, FormAttributeDto>;
  referenceMetadata: ReferenceMetadataMap;
  referenceProposals: ReferenceProposalMap;
}

export const computeEffectiveRequired = (attr: FormAttributeDto, ctx: ValidateContext): boolean => {
  if (attr.isRequired) return true;
  if (attr.conditionallyRequiredWhen == null) return false;
  const parent = ctx.attributeBySlug[attr.conditionallyRequiredWhen.refAttributeSlug];
  if (parent == null) return false;
  return isConditionallyRequiredSatisfied(attr.conditionallyRequiredWhen, ctx.referenceMetadata[parent.id]);
};

export const flattenActiveAttributes = (sections: { attributes: FormAttributeDto[] }[]): FormAttributeDto[] =>
  sections.flatMap((s) => s.attributes).filter((a) => a.isActive !== false);

/** Ids of attributes the seller can currently see; the complement is stripped from the payload. */
export const collectVisibleAttributeIds = (
  allAttrs: FormAttributeDto[],
  values: AttributeValueMap,
  referenceMetadata: ReferenceMetadataMap,
  referenceProposals: ReferenceProposalMap,
): Set<number> => {
  const attributeBySlug: Record<string, FormAttributeDto> = {};
  for (const a of allAttrs) attributeBySlug[a.slug] = a;

  const visible = new Set<number>();
  for (const attr of allAttrs) {
    if (attr.conditionallyRequiredWhen != null) {
      const parent = attributeBySlug[attr.conditionallyRequiredWhen.refAttributeSlug];
      const parentMetadata = parent ? referenceMetadata[parent.id] : null;
      // A proposed parent has unknown metadata: keep the child visible + optional.
      const parentProposed = parent != null && referenceProposals[parent.id] != null;
      if (!parentProposed && isHiddenByConditionalRequirement(attr.conditionallyRequiredWhen, parentMetadata)) {
        continue;
      }
    }
    if (isAttributeHiddenByDependency(attr, allAttrs, values)) continue;
    visible.add(attr.id);
  }
  return visible;
};

/**
 * Visibility is always computed over the WHOLE form (a parent may live on another
 * step); `reportOnlyAttrIds` merely narrows which errors are returned.
 */
export const validateAttributeMap = (
  sections: { attributes: FormAttributeDto[] }[],
  values: AttributeValueMap,
  referenceMetadata: ReferenceMetadataMap,
  referenceProposals: ReferenceProposalMap,
  options: { reportOnlyAttrIds?: Set<number> } = {},
): AttributeErrorMap => {
  const errors: AttributeErrorMap = {};
  const allAttrs = flattenActiveAttributes(sections);
  const attributeBySlug: Record<string, FormAttributeDto> = {};
  for (const a of allAttrs) attributeBySlug[a.slug] = a;

  const visibleIds = collectVisibleAttributeIds(allAttrs, values, referenceMetadata, referenceProposals);
  const ctx: ValidateContext = { attributeBySlug, referenceMetadata, referenceProposals };

  for (const attr of allAttrs) {
    if (!visibleIds.has(attr.id)) continue;
    if (options.reportOnlyAttrIds && !options.reportOnlyAttrIds.has(attr.id)) continue;

    const err = validateAttribute(
      attr,
      values[attr.id],
      computeEffectiveRequired(attr, ctx),
      referenceProposals[attr.id] != null,
    );
    if (err != null) {
      errors[attr.id] = err;
      continue;
    }

    if (attr.type === 'repeating_group') {
      const items = (values[attr.id] as Record<string, AttributeFormValue>[] | undefined) ?? [];
      const children = (attr.childAttributes ?? []).filter((c) => c.isActive !== false);
      for (const item of items) {
        const missing = children.find((child) => child.isRequired && !hasAttributeValue(child, item[child.slug]));
        if (missing) {
          errors[attr.id] = ATTRIBUTE_ERROR_KEYS.repeatingChildRequired;
          break;
        }
      }
    }
  }

  return errors;
};
