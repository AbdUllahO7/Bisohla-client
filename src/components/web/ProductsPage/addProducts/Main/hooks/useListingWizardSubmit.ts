import { useCallback, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/providers/settings.provider';
import { useProfileContext } from '@/providers/profile.provider';
import type { ApiResponse } from '@/core/entities/api/success.response';
import type { AttributeValue, CreateListingDto, UpdateListingDto } from '@/core/entities/models/listings/create-listing.dto';
import type { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { ListingType } from '@/core/entities/enums/cars.enums';
import { normalizeAddress, normalizeCity, normalizeGovernorate } from '@/core/entities/enums/syria.enums';
import {
  createListing,
  getSubmissionStatus,
  updateListing,
} from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { createUserAddress } from '@/core/infrastructure-adapters/actions/users/saved-address.actions';
import { updateProfile } from '@/core/infrastructure-adapters/actions/users/user-profile.actions';
import { assemblePhone } from '@/core/lib/phone/phone.util';
import { assembleAttributeValues, bodyHasReferenceProposal } from '@/lib/listing-attributes/attribute-assembler/attribute-assembler';
import { useListingWizard } from '../context/listing-wizard.context';
import { clearListingDraft } from '../context/listing-draft.storage';
import type { AdInformationStorageData } from '../../StepFour/storageUtils';
import { useWizardAttributeForm } from './useWizardAttributeForm';

/** In-screen recovery budget for an ambiguous create before we hand it to the seller. */
const RECOVERY_BUDGET_MS = 45_000;
const CONFIRM_BACKOFF_BASE_MS = 1_000;
const CONFIRM_BACKOFF_CAP_MS = 6_000;

export type SubmitPhase = 'idle' | 'submitting' | 'confirming';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const mintKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * A timeout, dropped connection, 503 or 409 (a sibling request holds the same
 * idempotency token) means the outcome is UNKNOWN — the server may have committed.
 * Never report one of these as a failure; ask the server instead.
 */
const isAmbiguousCreateFailure = (res: ApiResponse<unknown> | null): boolean => {
  if (res == null) return true;
  if (res.status === 409 || res.status === 503) return true;
  return res.status === 500 && res.path == null && res.timestamp == null;
};

const trimmedOrNull = (v: string | null | undefined): string | null => {
  const t = v?.trim();
  return t ? t : null;
};

interface SubmitDeps {
  onStepValidityFailed: (message: string) => void;
}

export const useListingWizardSubmit = ({ onStepValidityFailed }: SubmitDeps) => {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const tListing = useTranslations('listing');
  const tAttr = useTranslations('attributeForm');
  const { getListingsSettings } = useSettings();
  const { refetch: refetchProfile } = useProfileContext();
  const { state, dispatch, schema } = useListingWizard();
  const form = useWizardAttributeForm();

  const [phase, setPhase] = useState<SubmitPhase>('idle');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const submittingRef = useRef(false);

  const handleTryAgain = useCallback(() => {
    setShowErrorDialog(false);
    setErrorMessage('');
  }, []);

  const fail = useCallback(
    (message: string) => {
      setErrorMessage(message);
      setShowErrorDialog(true);
      toast({ variant: 'destructive', title: tListing('wizard.submit_error_title'), description: message });
    },
    [toast, tListing],
  );

  const buildDto = useCallback(
    (attributeValues: AttributeValue[], cf: AdInformationStorageData): CreateListingDto => {
      const offerType = cf.listingType || ListingType.FOR_SALE;
      const isForSale = offerType === ListingType.FOR_SALE;
      const rentType = offerType === ListingType.FOR_RENT ? cf.rentType ?? null : null;
      const price = cf.price ? Number(String(cf.price).replace(/[^0-9.]/g, '')) : null;
      const contactNumber = cf.contactNumber
        ? cf.contactNumber.startsWith('+')
          ? cf.contactNumber
          : assemblePhone(cf.countryDialCode || '+963', cf.contactNumber) || null
        : null;

      const rawGov = cf.governorate;
      const governorate = normalizeGovernorate(rawGov) || rawGov || null;
      const city = normalizeCity(cf.city, governorate || undefined) || cf.city || null;
      const address = trimmedOrNull(normalizeAddress(cf.address) || cf.address);

      const publishedAt = cf.publicationDate instanceof Date && !Number.isNaN(cf.publicationDate.getTime())
        ? cf.publicationDate.toISOString()
        : new Date().toISOString();

      const title = (cf.title ?? '').trim();
      const description = trimmedOrNull(cf.description);

      const installmentsEnabled = state.listingType?.installmentsEnabled !== false;
      const installments =
        installmentsEnabled && isForSale
          ? {
              installmentsAvailable: cf.installmentsAvailable === true,
              installmentPlans: (cf.installmentsAvailable === true ? cf.installmentPlans ?? [] : []).map((p, index) => {
                const en = trimmedOrNull(p.noteTranslations?.en);
                const ar = trimmedOrNull(p.noteTranslations?.ar);
                return {
                  months: Number(p.months),
                  downPayment: Number(p.downPayment || 0),
                  monthlyAmount: Number(p.monthlyAmount || 0),
                  noteTranslations: en == null && ar == null ? null : { en, ar },
                  displayOrder: index,
                };
              }),
            }
          : {};

      return {
        listingTypeId: state.listingType!.id,
        listingOfferType: offerType,
        ...(rentType ? { rentType } : {}),
        ...installments,
        ...(price != null && !Number.isNaN(price) ? { price } : {}),
        currency: cf.currency || 'USD',
        ...(governorate ? { governorate } : {}),
        ...(city ? { city } : {}),
        ...(address ? { address } : {}),
        ...(cf.latitude != null ? { latitude: Number(cf.latitude) } : {}),
        ...(cf.longitude != null ? { longitude: Number(cf.longitude) } : {}),
        showOnMap: true,
        ...(cf.condition ? { condition: cf.condition } : {}),
        ...(contactNumber ? { contactNumber } : {}),
        publicationStatus: cf.saveStatus || 'published',
        publishedAt,
        // Only the locale the seller wrote in; the other locale falls back to the base column.
        translations: { [locale]: { title, description, story: null } },
        attributeValues,
        images: state.images,
        primaryImageIndex: 0,
      } as CreateListingDto;
    },
    [locale, state.images, state.listingType],
  );

  /** Post-success side effects: profile phone (awaited) → saved address (fire-and-forget) → cache. */
  const runAfterSuccess = useCallback(
    async (cf: AdInformationStorageData, dto: CreateListingDto, listingId: number | null) => {
      if (cf.saveAsProfileNumber && dto.contactNumber) {
        const res = await updateProfile({ phone: dto.contactNumber } as Parameters<typeof updateProfile>[0]);
        if (res.success) refetchProfile();
        else toast({ variant: 'destructive', title: tListing('wizard.save_phone_failed') });
      }

      if (cf.saveAsSavedAddress && cf.savedAddressLabel?.trim() && dto.governorate && dto.city) {
        void createUserAddress({
          label: cf.savedAddressLabel.trim().slice(0, 100),
          governorate: dto.governorate,
          city: dto.city,
          address: dto.address ? dto.address.slice(0, 500) : undefined,
          latitude: dto.latitude ?? undefined,
          longitude: dto.longitude ?? undefined,
        })
          .then((res) => {
            if (res?.success) queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
            else toast({ variant: 'destructive', title: tListing('wizard.saved_address.save_failed_toast'), description: res?.message });
          })
          .catch(() => toast({ variant: 'destructive', title: tListing('wizard.saved_address.save_failed_toast') }));
      }

      await queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      if (listingId != null) await queryClient.invalidateQueries({ queryKey: ['my-listing-by-id', listingId] });
    },
    [queryClient, refetchProfile, toast, tListing],
  );

  const finishAndLeave = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, className: 'bg-green-600 text-white w-[330px] border-green-700 fixed bottom-4 right-4 z-[999]' });
      if (state.mode === 'create') clearListingDraft();
      dispatch({ type: 'markPristine' });
      router.push('/userProfile/Products');
      setTimeout(() => router.refresh(), 100);
    },
    [dispatch, router, state.mode, toast],
  );

  /** Create with idempotency + confirm-on-ambiguity; resolves to the listing, `null` (unresolved) or throws a real rejection. */
  const createWithRecovery = useCallback(
    async (dto: CreateListingDto): Promise<{ outcome: 'created'; listing: ListingDto | null } | { outcome: 'failed'; res: ApiResponse<ListingDto> } | { outcome: 'unresolved' }> => {
      const key = state.submissionKey ?? mintKey();
      dispatch({ type: 'setSubmissionKey', key });

      const attempt = async (): Promise<ApiResponse<ListingDto> | null> => {
        try {
          return await createListing(dto, key);
        } catch {
          return null;
        }
      };

      setPhase('submitting');
      let res = await attempt();
      if (res?.success) return { outcome: 'created', listing: res.data ?? null };
      if (!isAmbiguousCreateFailure(res)) return { outcome: 'failed', res: res! };

      setPhase('confirming');
      let mayResend = true;
      let confirmAttempt = 0;
      const deadline = Date.now() + RECOVERY_BUDGET_MS;

      while (Date.now() < deadline) {
        if (confirmAttempt > 0) await sleep(Math.min(CONFIRM_BACKOFF_BASE_MS * 2 ** (confirmAttempt - 1), CONFIRM_BACKOFF_CAP_MS));
        confirmAttempt += 1;

        let status: Awaited<ReturnType<typeof getSubmissionStatus>> | null = null;
        try {
          status = await getSubmissionStatus(key);
        } catch {
          status = null;
        }
        if (!status?.success || !status.data) continue;

        if (status.data.status === 'completed') return { outcome: 'created', listing: status.data.listing };
        if (status.data.status === 'in_progress') continue;
        if (status.data.status === 'unavailable') return { outcome: 'unresolved' };

        // not_found: the create never reached the server — one re-send, same token.
        if (!mayResend) return { outcome: 'unresolved' };
        mayResend = false;
        setPhase('submitting');
        res = await attempt();
        if (res?.success) return { outcome: 'created', listing: res.data ?? null };
        if (!isAmbiguousCreateFailure(res)) return { outcome: 'failed', res: res! };
        setPhase('confirming');
      }
      return { outcome: 'unresolved' };
    },
    [dispatch, state.submissionKey],
  );

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const cf = state.commonFields;
      if (!schema || !state.listingType) return onStepValidityFailed(tListing('wizard.schema_not_loaded'));
      if (state.isUploadingImages) return onStepValidityFailed(tListing('wizard.images_uploading'));

      const minImages = getListingsSettings()?.images?.min_images_per_listing ?? 5;
      if (state.images.length < minImages) return onStepValidityFailed(tListing('wizard.images_min', { count: minImages }));

      const missing = Object.keys(form.errors)
        .map((id) => form.allAttributes.find((a) => a.id === Number(id))?.name)
        .filter((n): n is string => Boolean(n));
      if (missing.length > 0) return onStepValidityFailed(tAttr('errors.missing_list', { fields: missing.join('، ') }));

      if (!cf || !cf.title?.trim()) return onStepValidityFailed(tListing('wizard.common_fields_incomplete'));

      const attributeValues = assembleAttributeValues(form.allAttributes, form.attributeValues, form.referenceMetadata, form.proposals);
      if (attributeValues == null) return fail(tListing('errors.submit_failed'));

      const dto = buildDto(attributeValues, cf);
      const hasProposal = bodyHasReferenceProposal(attributeValues);

      if (state.mode === 'edit' && state.editingListingId != null) {
        setPhase('submitting');
        const res = await updateListing(state.editingListingId, {
          ...(dto as UpdateListingDto),
          ...(state.version != null ? { version: state.version } : {}),
        } as UpdateListingDto);
        if (!res.success) {
          if (res.status === 409) return fail(tListing('errors.conflict'));
          if (res.status === 422 && hasProposal) return fail(tListing('errors.reference_proposal_generic'));
          return fail(res.message || tListing('errors.submit_failed'));
        }
        await runAfterSuccess(cf, dto, state.editingListingId);
        return finishAndLeave(tListing('wizard.updated_title'));
      }

      const result = await createWithRecovery(dto);
      if (result.outcome === 'failed') {
        const { res } = result;
        if (res.status === 422 && hasProposal) return fail(tListing('errors.reference_proposal_generic'));
        return fail(res.message || tListing('errors.submit_failed'));
      }
      if (result.outcome === 'unresolved') {
        toast({ title: tListing('wizard.submit_unconfirmed_title'), description: tListing('wizard.submit_unconfirmed') });
        return;
      }
      await runAfterSuccess(cf, dto, result.listing?.id ?? null);
      dispatch({ type: 'reset' });
      finishAndLeave(tListing('wizard.created_title'));
    } catch (error) {
      fail(error instanceof Error ? error.message : tListing('errors.submit_failed'));
    } finally {
      setPhase('idle');
      submittingRef.current = false;
    }
  }, [
    buildDto,
    createWithRecovery,
    dispatch,
    fail,
    finishAndLeave,
    form,
    getListingsSettings,
    onStepValidityFailed,
    runAfterSuccess,
    schema,
    state,
    tAttr,
    tListing,
    toast,
  ]);

  return {
    submit,
    isSubmitting: phase !== 'idle',
    phase,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    handleTryAgain,
  };
};
