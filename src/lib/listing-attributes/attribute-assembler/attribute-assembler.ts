import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { AttributeValue } from '@/core/entities/models/listings/create-listing.dto';
import { collectVisibleAttributeIds } from '../attribute-validator/attribute-validator';
import type {
  AttributeFormValue,
  AttributeValueMap,
  ReferenceMetadataMap,
  ReferenceProposalMap,
} from '../types/attribute-form.types';

/**
 * Never guess a column: the old `default → valueText` branch is what wrote reference
 * ids and years into `valueText`, producing listings whose fields render blank.
 */
export class MissingAttributeTypeError extends Error {
  constructor(attributeId: number, attributeType: string) {
    super(`No value column for attribute ${attributeId} of type "${attributeType}"`);
    this.name = 'MissingAttributeTypeError';
  }
}

export const toAttributeValueInput = (
  attributeId: number,
  value: AttributeFormValue,
  attributeType: string,
): AttributeValue | null => {
  if (value === null || value === undefined) return null;
  const base = { attributeId };

  switch (attributeType) {
    case 'text':
    case 'textarea':
      if (typeof value === 'object' && !Array.isArray(value) && 'en' in value) {
        const tv = value as { en: string | null; ar: string | null };
        return { ...base, valueTextTranslations: { en: tv.en ?? undefined, ar: tv.ar ?? undefined } };
      }
      return { ...base, valueText: String(value) };
    case 'number':
    case 'year':
      return { ...base, valueNumber: typeof value === 'number' ? value : parseFloat(String(value)) };
    case 'boolean':
      return { ...base, valueBoolean: Boolean(value) };
    case 'select':
    case 'color_selection':
    case 'color_picker':
      return { ...base, valueText: String(value) };
    case 'multi_select':
    case 'color_multi_selection':
    case 'range':
    case 'repeating_group':
      return Array.isArray(value) && value.length === 0 ? null : { ...base, valueJson: value };
    case 'date':
      return { ...base, valueDate: String(value) };
    case 'reference':
      return { ...base, referenceItemId: Number(value) };
    default:
      throw new MissingAttributeTypeError(attributeId, attributeType);
  }
};

/**
 * Builds the `attributeValues` payload: hidden attributes stripped, nulls dropped,
 * ids no longer in the schema dropped (a draft can outlive an attribute), proposals
 * appended only where no real value exists. Returns `null` when the schema is empty
 * while values exist — submitting then is what wrote every value into `valueText`.
 */
export const assembleAttributeValues = (
  allAttributes: FormAttributeDto[],
  values: AttributeValueMap,
  referenceMetadata: ReferenceMetadataMap,
  proposals: ReferenceProposalMap,
): AttributeValue[] | null => {
  if (allAttributes.length === 0 && Object.keys(values).length > 0) return null;

  const typeById: Record<number, string> = {};
  for (const a of allAttributes) typeById[a.id] = a.type;

  const visibleIds = collectVisibleAttributeIds(allAttributes, values, referenceMetadata, proposals);

  const out: AttributeValue[] = [];
  try {
    for (const [idStr, value] of Object.entries(values)) {
      const id = Number(idStr);
      if (!visibleIds.has(id)) continue;
      const type = typeById[id];
      if (type == null) continue;
      const input = toAttributeValueInput(id, value, type);
      if (input) out.push(input);
    }
  } catch (error) {
    if (error instanceof MissingAttributeTypeError) return null;
    throw error;
  }

  for (const [idStr, proposal] of Object.entries(proposals)) {
    const id = Number(idStr);
    if (!visibleIds.has(id) || typeById[id] == null) continue;
    if (values[id] != null) continue;
    const name = proposal.name.trim();
    if (name) out.push({ attributeId: id, proposedReferenceName: name });
  }

  return out;
};

export const bodyHasReferenceProposal = (attributeValues: AttributeValue[]): boolean =>
  attributeValues.some((v) => v.proposedReferenceName != null);
