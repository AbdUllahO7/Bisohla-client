'use client';

import { useQuery } from '@tanstack/react-query';
import {
  searchFuzzyReferenceItems,
  FuzzySearchOptions,
} from '@/core/infrastructure-adapters/actions/visitors/reference-proposal.actions';
import { FuzzyRefItemResult } from '@/core/entities/models/listings/reference-proposal.dto';

export const useFuzzyReferenceSearch = (
  groupId: number | null | undefined,
  options: FuzzySearchOptions,
  enabled: boolean = true
) => {
  return useQuery<FuzzyRefItemResult[]>({
    queryKey: ['fuzzyReferenceSearch', groupId, options.searchTerm, options.parentItemId, options.searchAllParents],
    queryFn: async () => {
      if (!groupId || !options.searchTerm || !options.searchTerm.trim()) {
        return [];
      }
      const res = await searchFuzzyReferenceItems(groupId, options);
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    enabled: enabled && !!groupId && options.searchTerm.trim().length >= 2,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
};
