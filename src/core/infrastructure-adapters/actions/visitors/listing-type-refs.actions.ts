'use server';

import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { getReq } from '@/core/lib/api';

/**
 * Resolve reference items by id — the only way to get a stored parent's `metadata`
 * (the owner detail's `referenceItem` carries none), which `conditionallyRequiredWhen`
 * needs before a child like Trim can be shown or hidden.
 */
export const getReferenceItemsByIds = async (
  groupId: number,
  ids: number[],
): Promise<ApiResponse<ListingTypeRefItemDto[]>> => {
  if (ids.length === 0) return { success: true, message: '', data: [] } as ApiResponse<ListingTypeRefItemDto[]>;

  const res = (await getReq({
    url: `/listing-type-ref/ref-groups/${groupId}/items`,
    params: {
      pageSize: Math.min(Math.max(ids.length, 1), 50),
      where: [{ field: 'id', operator: 'in', value: ids }],
    },
    cache: 'no-store',
  })) as PaginatedResponse<ListingTypeRefItemDto>;

  return {
    ...res,
    data: res.success && res.data ? res.data.data ?? [] : [],
  } as unknown as ApiResponse<ListingTypeRefItemDto[]>;
};
