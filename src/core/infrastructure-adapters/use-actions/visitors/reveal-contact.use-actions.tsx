'use client';

import { ApiResponse } from '@/core/entities/api/success.response';
import { RevealContactDto } from '@/core/entities/models/listings/reveal-contact.dto';
import { useMutation } from '@tanstack/react-query';
import { revealListingContact } from '../../actions/visitors/listing.visitor.actions';

/**
 * Fetches a seller's number on demand.
 *
 * Deliberately a mutation, not a query: it must fire only on a real click. The
 * backend counts every call against the visitor's daily allowance, so a query
 * (which React Query would refetch on mount, focus or reconnect) would drain it.
 */
export const useRevealContact = () => {
  return useMutation<ApiResponse<RevealContactDto>, Error, { listingId: number }>({
    mutationFn: async ({ listingId }) => {
      const res = await revealListingContact(listingId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
  });
};
