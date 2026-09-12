'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import { FuzzyRefItemResult } from '@/core/entities/models/listings/reference-proposal.dto';
import { getReq } from '@/core/lib/api';

export interface FuzzySearchOptions {
  searchTerm: string;
  parentItemId?: number | null;
  searchAllParents?: boolean;
}

export const searchFuzzyReferenceItems = async (
  groupId: number,
  options: FuzzySearchOptions
): Promise<ApiResponse<FuzzyRefItemResult[]>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('searchTerm', options.searchTerm);
  if (options.parentItemId !== undefined && options.parentItemId !== null) {
    queryParams.append('parentItemId', options.parentItemId.toString());
  }
  if (options.searchAllParents) {
    queryParams.append('searchAllParents', 'true');
  }

  const queryString = queryParams.toString();
  const url = `/listing-type-ref/ref-groups/${groupId}/items/fuzzy?${queryString}`;

  const res = await getReq({ url });
  return res as ApiResponse<FuzzyRefItemResult[]>;
};
