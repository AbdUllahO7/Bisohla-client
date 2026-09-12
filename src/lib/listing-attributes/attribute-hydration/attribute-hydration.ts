import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';
import type {
  AttributeValueMap,
  ReferenceProposalMap,
  ReferenceSnapshotMap,
} from '../types/attribute-form.types';

export interface HydratedAttributeState {
  values: AttributeValueMap;
  snapshots: ReferenceSnapshotMap;
  proposals: ReferenceProposalMap;
}

type DetailValue = Partial<GenericAttributeValue> & { attributeId: number };

/**
 * Owner detail → wizard state. Column precedence mirrors mobile's edit hydration;
 * snapshots carry `metadata: null` until `collectParentLookups` resolves them.
 */
export const hydrateFromDetail = (attributeValues: DetailValue[] | null | undefined): HydratedAttributeState => {
  const values: AttributeValueMap = {};
  const snapshots: ReferenceSnapshotMap = {};
  const proposals: ReferenceProposalMap = {};

  for (const av of attributeValues ?? []) {
    const id = av.attributeId;
    if (id == null) continue;

    if (av.refItemProposal?.status === 'pending' && av.refItemProposal.submittedName) {
      proposals[id] = { name: av.refItemProposal.submittedName };
      continue;
    }
    if (av.referenceItemId != null) {
      values[id] = av.referenceItemId;
      snapshots[id] = {
        id: av.referenceItemId,
        name: av.referenceItem?.name ?? String(av.referenceItemId),
        metadata: null,
      };
      continue;
    }
    if (av.valueBoolean != null) {
      values[id] = av.valueBoolean;
      continue;
    }
    if (av.valueNumber != null) {
      const n = parseFloat(String(av.valueNumber));
      if (!Number.isNaN(n)) values[id] = n;
      continue;
    }
    if (av.valueDate != null) {
      values[id] = String(av.valueDate).slice(0, 10);
      continue;
    }
    if (av.valueTextTranslations != null) {
      values[id] = {
        en: av.valueTextTranslations.en ?? null,
        ar: av.valueTextTranslations.ar ?? null,
      };
      continue;
    }
    if (av.valueJson != null) {
      values[id] = av.valueJson;
      continue;
    }
    if (av.valueText != null) values[id] = av.valueText;
  }

  return { values, snapshots, proposals };
};

/** groupId → selected ref item ids of every `conditionallyRequiredWhen` parent. */
export const collectParentLookups = (
  allAttributes: FormAttributeDto[],
  values: AttributeValueMap,
): Record<number, number[]> => {
  const bySlug: Record<string, FormAttributeDto> = {};
  for (const a of allAttributes) bySlug[a.slug] = a;

  const lookups: Record<number, Set<number>> = {};
  for (const attr of allAttributes) {
    const crw = attr.conditionallyRequiredWhen;
    if (crw == null) continue;
    const parent = bySlug[crw.refAttributeSlug];
    if (parent?.referenceGroupId == null) continue;
    const parentValue = values[parent.id];
    if (typeof parentValue !== 'number') continue;
    (lookups[parent.referenceGroupId] ??= new Set()).add(parentValue);
  }

  const out: Record<number, number[]> = {};
  for (const [groupId, ids] of Object.entries(lookups)) out[Number(groupId)] = [...ids];
  return out;
};

/**
 * When a parent lookup failed but the child already holds a value, pretend the flag is
 * on so the child is not hidden → stripped → deleted by the backend's `deleteNotIn`.
 */
export const synthesizeMetadataForUnresolvedParents = (
  allAttributes: FormAttributeDto[],
  values: AttributeValueMap,
  snapshots: ReferenceSnapshotMap,
  failedGroupIds: Set<number>,
): ReferenceSnapshotMap => {
  const bySlug: Record<string, FormAttributeDto> = {};
  for (const a of allAttributes) bySlug[a.slug] = a;

  const next = { ...snapshots };
  for (const attr of allAttributes) {
    const crw = attr.conditionallyRequiredWhen;
    if (crw == null || values[attr.id] == null) continue;
    const parent = bySlug[crw.refAttributeSlug];
    if (parent?.referenceGroupId == null || !failedGroupIds.has(parent.referenceGroupId)) continue;
    const snap = next[parent.id];
    if (snap == null || snap.metadata != null) continue;
    const key = Array.isArray(crw.metadataKey) ? crw.metadataKey[0] : crw.metadataKey;
    next[parent.id] = { ...snap, metadata: { [key]: true } };
  }
  return next;
};
