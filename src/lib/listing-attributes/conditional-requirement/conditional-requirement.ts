import type {
  ConditionallyRequiredWhen,
  FormAttributeDto,
} from '@/core/entities/models/listing-types/listing-types.dto';
import type { ReferenceMetadataMap } from '../types/attribute-form.types';

/**
 * Frozen contract (mirrors bishola-app-v2 `conditionalRequirement.ts`):
 *   parent unselected            → HIDDEN
 *   parent selected, flag off    → HIDDEN
 *   parent selected, flag on     → VISIBLE + required
 * A `conditionallyRequiredWhen` child is never "visible + optional" — except when the
 * parent is only a pending proposal (metadata unknown), which callers handle themselves.
 */
export const isConditionallyRequiredSatisfied = (
  crw: ConditionallyRequiredWhen | null | undefined,
  parentMetadata: Record<string, unknown> | null | undefined,
): boolean => {
  if (crw == null || parentMetadata == null) return false;
  const keys = Array.isArray(crw.metadataKey) ? crw.metadataKey : [crw.metadataKey];
  return keys.some((k) => parentMetadata[k] === true);
};

export const isHiddenByConditionalRequirement = (
  crw: ConditionallyRequiredWhen | null | undefined,
  parentMetadata: Record<string, unknown> | null | undefined,
): boolean => crw != null && !isConditionallyRequiredSatisfied(crw, parentMetadata);

export const collectConditionallyHiddenSlugs = (
  attributes: FormAttributeDto[],
  metadataByParentId: ReferenceMetadataMap,
): Set<string> => {
  const bySlug: Record<string, FormAttributeDto> = {};
  for (const a of attributes) bySlug[a.slug] = a;

  const hidden = new Set<string>();
  for (const attr of attributes) {
    const crw = attr.conditionallyRequiredWhen;
    if (crw == null) continue;
    const parent = bySlug[crw.refAttributeSlug];
    const parentMetadata = parent ? metadataByParentId[parent.id] : null;
    if (isHiddenByConditionalRequirement(crw, parentMetadata)) hidden.add(attr.slug);
  }
  return hidden;
};
