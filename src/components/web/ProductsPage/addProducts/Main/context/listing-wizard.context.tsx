'use client';

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useLocale } from 'next-intl';
import { getInjection } from '@/di/container';
import type { ListingTypeFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { useLocaleQuery } from '@/core/infrastructure-adapters/use-actions/common/use-locale-query';
import { commonFieldsStore } from './common-fields.store';
import { clearLegacyDraftKeys, hasMeaningfulDraft, loadListingDraft, saveListingDraft } from './listing-draft.storage';
import { createInitialWizardState, listingWizardReducer } from './listing-wizard.reducer';
import type { HydratePayload, ListingWizardAction, ListingWizardState, WizardMode } from './listing-wizard.types';

const DRAFT_DEBOUNCE_MS = 500;

interface ListingWizardContextValue {
  state: ListingWizardState;
  dispatch: React.Dispatch<ListingWizardAction>;
  schema: ListingTypeFormSchemaDto | null;
  isSchemaLoading: boolean;
  isSchemaError: boolean;
  refetchSchema: () => void;
  /** True when a create draft was restored on mount. */
  draftRestored: boolean;
  /** The step the draft was on, so the shell can reopen it. */
  draftStep: string | null;
  setCurrentStepForDraft: (step: string | null) => void;
}

const ListingWizardContext = createContext<ListingWizardContextValue | null>(null);

interface ListingWizardProviderProps {
  mode: WizardMode;
  listingId?: number | null;
  /** Edit mode: fully hydrated state; the provider dispatches it once. */
  initialHydration?: HydratePayload | null;
  children: React.ReactNode;
}

export const ListingWizardProvider: React.FC<ListingWizardProviderProps> = ({
  mode,
  listingId = null,
  initialHydration = null,
  children,
}) => {
  const locale = useLocale();
  const [state, dispatch] = useReducer(listingWizardReducer, undefined, () => {
    const base = createInitialWizardState(mode, listingId);
    if (mode === 'edit' && initialHydration) {
      return listingWizardReducer(base, { type: 'hydrate', payload: initialHydration });
    }
    return base;
  });

  const draftRestoredRef = useRef(false);
  const draftStepRef = useRef<string | null>(null);
  const currentStepRef = useRef<string | null>(null);
  const [, forceRender] = useReducer((n: number) => n + 1, 0);

  // Create mode: restore the single draft once, then keep autosaving it.
  useEffect(() => {
    commonFieldsStore.setMode(mode);
    if (mode !== 'create') return;
    clearLegacyDraftKeys();
    const draft = loadListingDraft();
    if (hasMeaningfulDraft(draft) && draft) {
      draftRestoredRef.current = true;
      draftStepRef.current = draft.currentStep ?? null;
      dispatch({
        type: 'hydrate',
        payload: {
          listingType: draft.listingType,
          attributeValues: draft.attributeValues ?? {},
          referenceSnapshots: draft.referenceSnapshots ?? {},
          proposals: draft.proposals ?? {},
          images: draft.images ?? [],
          commonFields: draft.commonFields ?? null,
        },
      });
      forceRender();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed the common-fields bridge from wizard state (hydrate / draft), and mirror the step's edits back.
  useEffect(() => {
    commonFieldsStore.setPolicy(state.listingType);
  }, [state.listingType]);

  useEffect(() => {
    if (state.commonFields && commonFieldsStore.get() !== state.commonFields) {
      commonFieldsStore.set(state.commonFields);
    }
  }, [state.commonFields]);

  useEffect(() => {
    return commonFieldsStore.subscribe(() => {
      const next = commonFieldsStore.get();
      if (next) dispatch({ type: 'setCommonFields', commonFields: next });
    });
  }, []);

  useEffect(() => () => commonFieldsStore.reset(), []);

  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (mode !== 'create' || !state.isDirty) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => saveListingDraft(state, currentStepRef.current), DRAFT_DEBOUNCE_MS);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [mode, state]);

  // The schema lives at wizard level so it cannot be evicted mid-wizard.
  const listingTypeId = state.listingType?.id ?? null;
  const schemaQuery = useLocaleQuery({
    queryKey: ['listing-type-form-schema', listingTypeId],
    queryFn: async () => {
      const controller = getInjection('IListingTypesRepoController');
      const res = await controller.getFormSchema(listingTypeId!);
      if (!res.success || !res.data) throw new Error(res.message || 'schema_not_loaded');
      return { ...res.data, listingTypeId: listingTypeId! };
    },
    enabled: listingTypeId != null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  const value = useMemo<ListingWizardContextValue>(
    () => ({
      state,
      dispatch,
      schema: schemaQuery.data ?? null,
      isSchemaLoading: listingTypeId != null && schemaQuery.isPending,
      isSchemaError: schemaQuery.isError,
      refetchSchema: () => void schemaQuery.refetch(),
      draftRestored: draftRestoredRef.current,
      draftStep: draftStepRef.current,
      setCurrentStepForDraft: (step) => {
        currentStepRef.current = step;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, schemaQuery.data, schemaQuery.isPending, schemaQuery.isError, listingTypeId, locale],
  );

  return <ListingWizardContext.Provider value={value}>{children}</ListingWizardContext.Provider>;
};

export const useListingWizard = (): ListingWizardContextValue => {
  const ctx = useContext(ListingWizardContext);
  if (!ctx) throw new Error('useListingWizard must be used inside <ListingWizardProvider>');
  return ctx;
};
