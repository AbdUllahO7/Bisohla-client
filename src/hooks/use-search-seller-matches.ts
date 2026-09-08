'use client';

import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/providers/settings.provider';
import { getSellers } from '@/core/infrastructure-adapters/actions/visitors/public-profile.actions';
import { parseIdSearchTerm } from '@/core/lib/parse-id-search-term';
import { TopSellerSummaryDto } from '@/core/entities/models/public-profile/top-seller.dto';

/**
 * Hook for speculative seller lookup matching the committed search term.
 *
 * Requirements from 07-search-enhancements.md:
 * 1. listings_settings.search.seller_suggestions_enabled (fallback true)
 * 2. searchTerm.trim().length >= listings_settings.search.seller_suggestions_min_term_length (fallback 2)
 * 3. parseIdSearchTerm(term) == null — a bare listing ID is never a seller lookup
 * 4. Silent on error — never surface error states or delay listing results.
 */
export const useSearchSellerMatches = (searchTerm?: string | null) => {
  const { settings } = useSettings();
  const searchSettings = settings.listings_settings?.search;

  const isEnabled = searchSettings?.seller_suggestions_enabled !== false;
  const minTermLength = searchSettings?.seller_suggestions_min_term_length ?? 2;
  const count = searchSettings?.seller_suggestions_count ?? 3;

  const trimmed = searchTerm ? searchTerm.trim() : '';
  const isIdTerm = parseIdSearchTerm(trimmed) !== null;
  const shouldFetch = isEnabled && trimmed.length >= minTermLength && !isIdTerm;

  return useQuery<TopSellerSummaryDto[]>({
    queryKey: ['seller-matches', trimmed, count],
    queryFn: async () => {
      try {
        const res = await getSellers(1, count, trimmed);
        if (res.success && res.data?.data) {
          return res.data.data;
        }
        return [];
      } catch {
        // Silent on error — speculative enrichment must never break or degrade UI
        return [];
      }
    },
    enabled: shouldFetch,
    staleTime: 60 * 1000,
    retry: false,
  });
};
