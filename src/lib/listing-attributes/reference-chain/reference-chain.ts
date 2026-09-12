import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { ProposeReferenceResult } from '@/core/entities/models/listings/reference-proposal.dto';
import type {
  AttributeFormValue,
  AttributeValueMap,
  ReferenceSnapshot,
} from '../types/attribute-form.types';

/** `dependsOnAttributeId` inverted: parent id → ids that cascade off it. */
export const buildChildrenByParentId = (attributes: FormAttributeDto[]): Record<number, number[]> => {
  const map: Record<number, number[]> = {};
  for (const a of attributes) {
    if (a.dependsOnAttributeId != null) (map[a.dependsOnAttributeId] ??= []).push(a.id);
  }
  return map;
};

export const collectDescendantIds = (
  parentAttributeId: number,
  childrenByParentId: Record<number, number[]>,
): number[] => {
  const out: number[] = [];
  const walk = (id: number): void => {
    for (const childId of childrenByParentId[id] ?? []) {
      out.push(childId);
      walk(childId);
    }
  };
  walk(parentAttributeId);
  return out;
};

export interface AttributeEditCascade {
  values: AttributeValueMap;
  /** Descendants invalidated by the edit — their snapshots AND proposals go too. */
  clearedIds: number[];
}

/**
 * A cascading child (model, then trim) is only meaningful under the parent it was
 * picked for; writing the parent alone leaves a Chevrolet model sitting under BMW.
 */
export const buildAttributeEditCascade = (args: {
  attributeId: number;
  value: AttributeFormValue;
  values: AttributeValueMap;
  childrenByParentId: Record<number, number[]>;
}): AttributeEditCascade => {
  const { attributeId, value, values, childrenByParentId } = args;
  const next = { ...values, [attributeId]: value };
  const clearedIds = collectDescendantIds(attributeId, childrenByParentId);
  for (const id of clearedIds) next[id] = null;
  return { values: next, clearedIds };
};

export type ReferenceCandidate = Extract<ProposeReferenceResult, { kind: 'existing' }>;

export interface ReferenceCandidatePick {
  values: AttributeValueMap;
  snapshots: Array<{ attributeId: number; snapshot: ReferenceSnapshot | null }>;
  clearProposalFor: number | null;
  clearedIds: number[];
}

/**
 * A "did you mean…?" candidate may belong to a different parent than the one picked
 * (the fuzzy search widens across parents). Re-bind the parent too, and drop
 * everything scoped to the old parent.
 */
export const buildReferenceCandidatePick = (args: {
  attributeId: number;
  candidate: ReferenceCandidate;
  parentAttributeId: number | null;
  values: AttributeValueMap;
  childrenByParentId: Record<number, number[]>;
}): ReferenceCandidatePick => {
  const { attributeId, candidate, parentAttributeId, values, childrenByParentId } = args;
  const next = { ...values };
  const snapshots: ReferenceCandidatePick['snapshots'] = [];

  const parentItemId = candidate.parentItemId;
  const needsRebind =
    parentAttributeId != null && parentItemId != null && values[parentAttributeId] !== parentItemId;

  const staleRoot = needsRebind && parentAttributeId != null ? parentAttributeId : attributeId;
  const descendants = collectDescendantIds(staleRoot, childrenByParentId);
  for (const id of descendants) {
    next[id] = null;
    snapshots.push({ attributeId: id, snapshot: null });
  }

  if (needsRebind && parentAttributeId != null && parentItemId != null) {
    next[parentAttributeId] = parentItemId;
    snapshots.push({
      attributeId: parentAttributeId,
      snapshot: { id: parentItemId, name: candidate.parentLabel ?? '', metadata: candidate.parentMetadata ?? null },
    });
  }

  next[attributeId] = candidate.id;
  snapshots.push({
    attributeId,
    snapshot: { id: candidate.id, name: candidate.label, metadata: candidate.metadata ?? null },
  });

  return {
    values: next,
    snapshots,
    clearProposalFor: needsRebind ? parentAttributeId : null,
    clearedIds: descendants.filter((id) => id !== attributeId),
  };
};
