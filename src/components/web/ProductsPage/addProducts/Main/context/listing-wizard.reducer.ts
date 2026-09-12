import {
  buildAttributeEditCascade,
  buildReferenceCandidatePick,
} from '@/lib/listing-attributes/reference-chain/reference-chain';
import type { ListingWizardAction, ListingWizardState, WizardMode } from './listing-wizard.types';

export const createInitialWizardState = (mode: WizardMode, editingListingId: number | null): ListingWizardState => ({
  mode,
  editingListingId,
  version: null,
  listingType: null,
  attributeValues: {},
  referenceSnapshots: {},
  proposals: {},
  images: [],
  isUploadingImages: false,
  commonFields: null,
  isDirty: false,
  submissionKey: null,
  hydrated: mode === 'create',
});

const omit = <T extends Record<number, unknown>>(map: T, ids: number[]): T => {
  if (ids.length === 0) return map;
  const next = { ...map };
  for (const id of ids) delete next[id];
  return next;
};

/** Every user edit invalidates the idempotency token — a changed payload is a new submission. */
const touched = (state: ListingWizardState): ListingWizardState => ({
  ...state,
  isDirty: true,
  submissionKey: null,
});

export const listingWizardReducer = (state: ListingWizardState, action: ListingWizardAction): ListingWizardState => {
  switch (action.type) {
    case 'setListingType': {
      if (state.listingType?.id === action.listingType.id) {
        return touched({ ...state, listingType: action.listingType });
      }
      return touched({
        ...state,
        listingType: action.listingType,
        attributeValues: {},
        referenceSnapshots: {},
        proposals: {},
      });
    }

    case 'setAttributeValue': {
      const cascade = buildAttributeEditCascade({
        attributeId: action.attributeId,
        value: action.value,
        values: state.attributeValues,
        childrenByParentId: action.childrenByParentId,
      });
      const proposals = omit(state.proposals, cascade.clearedIds);
      // A real value and a proposal are mutually exclusive on one attribute.
      if (action.value != null) delete proposals[action.attributeId];
      return touched({
        ...state,
        attributeValues: cascade.values,
        referenceSnapshots: omit(state.referenceSnapshots, cascade.clearedIds),
        proposals,
      });
    }

    case 'setReferenceSnapshot': {
      const proposals = { ...state.proposals };
      if (action.snapshot != null) delete proposals[action.attributeId];
      return {
        ...state,
        referenceSnapshots: { ...state.referenceSnapshots, [action.attributeId]: action.snapshot },
        proposals,
      };
    }

    case 'setProposal': {
      const cascade = buildAttributeEditCascade({
        attributeId: action.attributeId,
        value: null,
        values: state.attributeValues,
        childrenByParentId: action.childrenByParentId,
      });
      const attributeValues = { ...cascade.values };
      delete attributeValues[action.attributeId];
      return touched({
        ...state,
        attributeValues,
        referenceSnapshots: { ...omit(state.referenceSnapshots, cascade.clearedIds), [action.attributeId]: null },
        proposals: { ...omit(state.proposals, cascade.clearedIds), [action.attributeId]: { name: action.name } },
      });
    }

    case 'clearProposal':
      return touched({ ...state, proposals: omit(state.proposals, [action.attributeId]) });

    case 'pickReferenceCandidate': {
      const pick = buildReferenceCandidatePick({
        attributeId: action.attributeId,
        candidate: action.candidate,
        parentAttributeId: action.parentAttributeId,
        values: state.attributeValues,
        childrenByParentId: action.childrenByParentId,
      });
      const referenceSnapshots = { ...state.referenceSnapshots };
      for (const s of pick.snapshots) referenceSnapshots[s.attributeId] = s.snapshot;
      const proposals = omit(state.proposals, [...pick.clearedIds, action.attributeId]);
      if (pick.clearProposalFor != null) delete proposals[pick.clearProposalFor];
      return touched({ ...state, attributeValues: pick.values, referenceSnapshots, proposals });
    }

    case 'seedBooleanDefaults': {
      const missing = action.attributeIds.filter((id) => state.attributeValues[id] == null);
      if (missing.length === 0) return state;
      const attributeValues = { ...state.attributeValues };
      for (const id of missing) attributeValues[id] = false;
      // Seeding is not a user edit: no dirty flip, no token invalidation.
      return { ...state, attributeValues };
    }

    case 'setImages':
      return touched({ ...state, images: action.images });

    case 'setUploadingImages':
      return { ...state, isUploadingImages: action.uploading };

    case 'setCommonFields': {
      if (JSON.stringify(state.commonFields) === JSON.stringify(action.commonFields)) return state;
      return touched({ ...state, commonFields: action.commonFields });
    }

    case 'setSubmissionKey':
      return { ...state, submissionKey: action.key };

    case 'hydrate':
      return {
        ...state,
        listingType: action.payload.listingType,
        attributeValues: action.payload.attributeValues,
        referenceSnapshots: action.payload.referenceSnapshots,
        proposals: action.payload.proposals,
        images: action.payload.images,
        commonFields: action.payload.commonFields,
        version: action.payload.version ?? state.version,
        isDirty: false,
        submissionKey: null,
        hydrated: true,
      };

    case 'markPristine':
      return { ...state, isDirty: false };

    case 'reset':
      return createInitialWizardState(state.mode, state.editingListingId);

    default:
      return state;
  }
};
