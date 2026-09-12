import type { ListingWizardState } from './listing-wizard.types';

export const LISTING_DRAFT_KEY = 'bishola:listing-draft:new';

/** Keys the old wizard wrote; cleared once so a stale slug-keyed draft never resurfaces. */
const LEGACY_DRAFT_KEYS = [
  'addProduct_stepOne_selections',
  'addProduct_stepTwo_data',
  'addProduct_stepThree_data',
  'addProduct_stepFour_data',
  'addProduct_stepOne_selections_edit',
  'addProduct_stepTwo_data_edit',
  'addProduct_stepThree_data_edit',
  'addProduct_stepFour_data_edit',
  'edit_car_listing_id',
];

export type ListingDraft = Pick<
  ListingWizardState,
  'listingType' | 'attributeValues' | 'referenceSnapshots' | 'proposals' | 'images' | 'commonFields'
> & { currentStep?: string | null };

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const clearLegacyDraftKeys = (): void => {
  if (!canUseStorage()) return;
  try {
    for (const key of LEGACY_DRAFT_KEYS) window.localStorage.removeItem(key);
  } catch {
    // Storage may be blocked (private mode); a draft is a convenience, not a requirement.
  }
};

export const loadListingDraft = (): ListingDraft | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(LISTING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListingDraft;
    if (parsed.commonFields?.publicationDate) {
      parsed.commonFields.publicationDate = new Date(parsed.commonFields.publicationDate as unknown as string);
    }
    return parsed;
  } catch {
    return null;
  }
};

/** `submissionKey` is deliberately not persisted — a restored draft is a new submission. */
export const saveListingDraft = (state: ListingWizardState, currentStep: string | null): void => {
  if (!canUseStorage()) return;
  try {
    const draft: ListingDraft = {
      listingType: state.listingType,
      attributeValues: state.attributeValues,
      referenceSnapshots: state.referenceSnapshots,
      proposals: state.proposals,
      images: state.images,
      commonFields: state.commonFields,
      currentStep,
    };
    window.localStorage.setItem(LISTING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / privacy-mode failures
  }
};

export const clearListingDraft = (): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(LISTING_DRAFT_KEY);
  } catch {
    // ignore
  }
};

export const hasMeaningfulDraft = (draft: ListingDraft | null): boolean =>
  draft != null &&
  (draft.listingType != null ||
    Object.keys(draft.attributeValues ?? {}).length > 0 ||
    (draft.images?.length ?? 0) > 0 ||
    draft.commonFields != null);
