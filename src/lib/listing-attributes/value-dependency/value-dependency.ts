import type {
  FormAttributeDto,
  ValueDependencyShape,
} from '@/core/entities/models/listing-types/listing-types.dto';
import type { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';
import type { AttributeFormValue, AttributeValueMap } from '../types/attribute-form.types';

/**
 * Frozen evaluator duplicated verbatim across backend, admin, mobile and here.
 * TRUE means the dependent attribute is hidden (value stripped, required skipped).
 */
export const evaluateValueDependency = (
  rule: ValueDependencyShape,
  refValue: string | string[] | null | undefined,
): boolean => {
  const refVals = refValue == null ? [] : Array.isArray(refValue) ? refValue : [refValue];
  const ruleVals = Array.isArray(rule.value) ? rule.value : [rule.value];
  switch (rule.op) {
    case 'eq':
      return refVals.some((v) => ruleVals.includes(v));
    case 'neq':
      return refVals.length > 0 && !refVals.some((v) => ruleVals.includes(v));
    case 'in':
      return refVals.some((v) => ruleVals.includes(v));
    case 'nin':
      return refVals.length > 0 && refVals.every((v) => !ruleVals.includes(v));
    default:
      return false;
  }
};

export const normalizeValueForDependency = (
  attr: Pick<FormAttributeDto, 'type'>,
  value: AttributeFormValue | undefined,
): string | string[] | null => {
  if (value == null) return null;
  switch (attr.type) {
    case 'select':
    case 'color_selection':
      return typeof value === 'string' && value !== '' ? value : null;
    case 'reference':
      return typeof value === 'number' ? String(value) : null;
    case 'multi_select':
    case 'color_multi_selection':
      return Array.isArray(value) ? (value as string[]) : null;
    case 'boolean':
      return typeof value === 'boolean' ? (value ? 'true' : 'false') : null;
    default:
      return null;
  }
};

/** Detail-page variant: reads the stored columns instead of a form value. */
export const detailValueToNormalized = (
  attr: Pick<FormAttributeDto, 'type'>,
  detail: Pick<GenericAttributeValue, 'valueText' | 'valueBoolean' | 'valueJson' | 'referenceItemId'> | null | undefined,
): string | string[] | null => {
  if (detail == null) return null;
  switch (attr.type) {
    case 'select':
    case 'color_selection':
      return detail.valueText != null && detail.valueText !== '' ? detail.valueText : null;
    case 'reference':
      return detail.referenceItemId != null ? String(detail.referenceItemId) : null;
    case 'multi_select':
    case 'color_multi_selection':
      return Array.isArray(detail.valueJson) ? (detail.valueJson as string[]) : null;
    case 'boolean':
      return detail.valueBoolean == null ? null : detail.valueBoolean ? 'true' : 'false';
    default:
      return null;
  }
};

/** `allAttrs` MUST span every section — the rule may reference another step. */
export const isAttributeHiddenByDependency = (
  attr: Pick<FormAttributeDto, 'valueDependency'>,
  allAttrs: FormAttributeDto[],
  valuesById: AttributeValueMap,
): boolean => {
  const rule = attr.valueDependency;
  if (rule == null) return false;
  const refAttr = allAttrs.find((a) => a.slug === rule.refAttributeSlug);
  if (refAttr == null) return false;
  return evaluateValueDependency(rule, normalizeValueForDependency(refAttr, valuesById[refAttr.id]));
};
