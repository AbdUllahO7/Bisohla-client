import { useCallback, useMemo } from 'react';
import { useSettings } from '@/providers/settings.provider';
import {
  REFERENCE_PROPOSAL_DEFAULT_ALLOW_CHAINED,
  REFERENCE_PROPOSAL_DEFAULT_ENABLED,
  REFERENCE_PROPOSAL_DEFAULT_MAX_PER_LISTING,
  REFERENCE_PROPOSAL_DEFAULT_MIN_NAME_LENGTH,
  REFERENCE_PROPOSAL_DEFAULT_MAX_NAME_LENGTH,
} from './useReferenceProposalGate.constants';

export interface ProposalGateAttribute {
  id: number;
  type: string;
  slug?: string;
  referenceGroupId?: number | null;
  dependsOnAttributeId?: number | null;
}

export interface UseReferenceProposalGateResult {
  /** Feature kill-switch — false hides every propose affordance. */
  isEnabled: boolean;
  maxPerListing: number;
  allowChained: boolean;
  minNameLength: number;
  maxNameLength: number;
  /**
   * Whether THIS attribute may currently be proposed for. Callers pass the
   * attribute and its parent's resolved reference id (`null` when the parent is
   * unset or itself only proposed).
   */
  canProposeFor: (attr: ProposalGateAttribute, parentReferenceItemId?: number | null) => boolean;
}

/**
 * The single source of truth for deciding reference proposal visibility and gating.
 * Reads `listings_settings.reference_proposals` from settings with fallback defaults.
 */
export const useReferenceProposalGate = (
  currentProposals: Record<number, unknown> = {},
): UseReferenceProposalGateResult => {
  const { getListingsSettings, getReferenceProposalsSettings } = useSettings();
  const config = getReferenceProposalsSettings?.() || getListingsSettings?.()?.reference_proposals;

  const isEnabled = config?.enabled ?? REFERENCE_PROPOSAL_DEFAULT_ENABLED;
  const maxPerListing = config?.max_per_listing ?? REFERENCE_PROPOSAL_DEFAULT_MAX_PER_LISTING;
  const allowChained = config?.allow_chained_proposals ?? REFERENCE_PROPOSAL_DEFAULT_ALLOW_CHAINED;
  const minNameLength = config?.min_name_length ?? REFERENCE_PROPOSAL_DEFAULT_MIN_NAME_LENGTH;
  const maxNameLength = config?.max_name_length ?? REFERENCE_PROPOSAL_DEFAULT_MAX_NAME_LENGTH;

  const proposalCount = useMemo(() => {
    return Object.keys(currentProposals).filter(k => {
      const val = currentProposals[k as unknown as number] as { name?: string } | undefined;
      return typeof val === 'object' ? !!val?.name : !!val;
    }).length;
  }, [currentProposals]);

  const canProposeFor = useCallback(
    (attr: ProposalGateAttribute, parentReferenceItemId: number | null = null): boolean => {
      if (!isEnabled) return false;
      if (attr.type !== 'reference' || attr.referenceGroupId == null) return false;

      // Virtual location fields use enum systems and can never carry proposals
      const slug = (attr.slug || '').toLowerCase();
      if (slug === 'governorate' || slug === 'city' || slug === 'محافظة' || slug === 'مدينة') {
        return false;
      }

      // An attribute that already carries a proposal keeps its affordance (for edit/revise)
      const thisProposal = currentProposals[attr.id] as { name?: string } | undefined;
      const alreadyProposed = typeof thisProposal === 'object' ? !!thisProposal?.name : !!thisProposal;

      if (!alreadyProposed && proposalCount >= maxPerListing) {
        return false;
      }

      // If chained proposals are disabled, a cascading child requires a resolved parent reference item
      if (!allowChained && attr.dependsOnAttributeId != null && parentReferenceItemId == null) {
        return false;
      }

      return true;
    },
    [isEnabled, currentProposals, proposalCount, maxPerListing, allowChained],
  );

  return {
    isEnabled,
    maxPerListing,
    allowChained,
    minNameLength,
    maxNameLength,
    canProposeFor,
  };
};
