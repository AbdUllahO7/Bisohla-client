import type {
  ListingInstallmentOption,
  ListingTypeDto,
} from '@/core/entities/models/listing-types/listing-types.dto';
import type {
  AttributeFormValue,
  AttributeValueMap,
  ReferenceProposalMap,
  ReferenceSnapshot,
  ReferenceSnapshotMap,
} from '@/lib/listing-attributes/types/attribute-form.types';
import type { ReferenceCandidate } from '@/lib/listing-attributes/reference-chain/reference-chain';
import type { AdInformationStorageData } from '../../StepFour/storageUtils';

export type WizardMode = 'create' | 'edit';

/** The policy flags the common-fields step needs; captured at type pick / edit hydrate. */
export interface WizardListingType {
  id: number;
  slug: string;
  name: string;
  rentEnabled?: boolean;
  installmentsEnabled?: boolean;
  installmentsMode?: 'free' | 'catalog';
  installmentOptions?: ListingInstallmentOption[];
}

export interface ListingWizardState {
  mode: WizardMode;
  editingListingId: number | null;
  /** Optimistic-lock version from the owner detail; sent back on PUT. */
  version: number | null;
  listingType: WizardListingType | null;
  attributeValues: AttributeValueMap;
  referenceSnapshots: ReferenceSnapshotMap;
  proposals: ReferenceProposalMap;
  /** Uploaded image URLs in display order; index 0 is the primary image. */
  images: string[];
  isUploadingImages: boolean;
  commonFields: AdInformationStorageData | null;
  isDirty: boolean;
  /** Idempotency token for the current create attempt; cleared by any edit. */
  submissionKey: string | null;
  hydrated: boolean;
}

export interface HydratePayload {
  listingType: WizardListingType | null;
  attributeValues: AttributeValueMap;
  referenceSnapshots: ReferenceSnapshotMap;
  proposals: ReferenceProposalMap;
  images: string[];
  commonFields: AdInformationStorageData | null;
  version?: number | null;
}

export type ListingWizardAction =
  | { type: 'setListingType'; listingType: WizardListingType }
  | { type: 'setAttributeValue'; attributeId: number; value: AttributeFormValue; childrenByParentId: Record<number, number[]> }
  | { type: 'setReferenceSnapshot'; attributeId: number; snapshot: ReferenceSnapshot | null }
  | { type: 'setProposal'; attributeId: number; name: string; childrenByParentId: Record<number, number[]> }
  | { type: 'clearProposal'; attributeId: number }
  | {
      type: 'pickReferenceCandidate';
      attributeId: number;
      candidate: ReferenceCandidate;
      parentAttributeId: number | null;
      childrenByParentId: Record<number, number[]>;
    }
  | { type: 'seedBooleanDefaults'; attributeIds: number[] }
  | { type: 'setImages'; images: string[] }
  | { type: 'setUploadingImages'; uploading: boolean }
  | { type: 'setCommonFields'; commonFields: AdInformationStorageData }
  | { type: 'setSubmissionKey'; key: string | null }
  | { type: 'hydrate'; payload: HydratePayload }
  | { type: 'markPristine' }
  | { type: 'reset' };

export const pickListingTypePolicy = (type: ListingTypeDto | WizardListingType): WizardListingType => ({
  id: type.id,
  slug: type.slug,
  name: type.name,
  rentEnabled: type.rentEnabled,
  installmentsEnabled: type.installmentsEnabled,
  installmentsMode: type.installmentsMode,
  installmentOptions: type.installmentOptions,
});
