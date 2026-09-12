import type {
  FormAttributeDto,
  SectionDto,
} from '@/core/entities/models/listing-types/listing-types.dto';
import { computeEffectiveRequired, flattenActiveAttributes } from '../attribute-validator/attribute-validator';
import { isHiddenByConditionalRequirement } from '../conditional-requirement/conditional-requirement';
import type {
  AttributeValueMap,
  AttributeWithDisplay,
  ReferenceMetadataMap,
  ReferenceProposalMap,
  SectionWithDisplay,
} from '../types/attribute-form.types';
import { isAttributeHiddenByDependency } from '../value-dependency/value-dependency';

const hasValue = (v: unknown): boolean => v !== null && v !== undefined && v !== '';

/**
 * conditionallyRequiredWhen → hidden unless the parent's metadata flag is on
 * valueDependency          → hidden when the rule fires
 * dependsOnAttributeId     → visible but disabled until the parent has a value/proposal
 */
export const computeDisplay = (
  attr: FormAttributeDto,
  values: AttributeValueMap,
  allAttributes: FormAttributeDto[],
  referenceMetadata: ReferenceMetadataMap,
  referenceProposals: ReferenceProposalMap = {},
): { hidden: boolean; disabled: boolean } => {
  let hidden = false;
  let disabled = false;

  if (attr.conditionallyRequiredWhen != null) {
    const parentAttr = allAttributes.find((a) => a.slug === attr.conditionallyRequiredWhen!.refAttributeSlug);
    const parentMetadata = parentAttr ? referenceMetadata[parentAttr.id] : null;
    const parentProposed = parentAttr != null && referenceProposals[parentAttr.id] != null;
    if (!parentProposed && isHiddenByConditionalRequirement(attr.conditionallyRequiredWhen, parentMetadata)) {
      hidden = true;
    }
  }

  if (!hidden && isAttributeHiddenByDependency(attr, allAttributes, values)) hidden = true;

  if (!hidden && attr.dependsOnAttributeId != null) {
    const parentHasValue =
      hasValue(values[attr.dependsOnAttributeId]) || referenceProposals[attr.dependsOnAttributeId] != null;
    if (!parentHasValue) disabled = true;
  }

  return { hidden, disabled };
};

export const buildSectionsWithDisplay = (
  sections: SectionDto[],
  values: AttributeValueMap,
  referenceMetadata: ReferenceMetadataMap,
  referenceProposals: ReferenceProposalMap = {},
): SectionWithDisplay[] => {
  const activeSections = sections.filter((s) => s.isActive !== false);
  const allAttributes = flattenActiveAttributes(activeSections);
  const attributeBySlug: Record<string, FormAttributeDto> = {};
  for (const a of allAttributes) attributeBySlug[a.slug] = a;

  return activeSections.map((section) => ({
    ...section,
    attributes: section.attributes
      .filter((a) => a.isActive !== false)
      .map((attr): AttributeWithDisplay => ({
        ...attr,
        ...computeDisplay(attr, values, allAttributes, referenceMetadata, referenceProposals),
        effectiveRequired: computeEffectiveRequired(attr, { attributeBySlug, referenceMetadata, referenceProposals }),
      })),
  }));
};
