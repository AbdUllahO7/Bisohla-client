import { IListingTypeRefsRepo } from '@/core/application/repositories/listing-type-refs/listing-type-refs.repo.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { getReq } from '@/core/lib/api';

// Fast in-memory cache and request deduplication for reference items
const refCache = new Map<string, { data: PaginatedResponse<ListingTypeRefItemDto>; expiresAt: number }>();
const inFlightRefRequests = new Map<string, Promise<PaginatedResponse<ListingTypeRefItemDto>>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class ListingTypeRefsRepo implements IListingTypeRefsRepo {
  async getItemsByGroupId(
    groupId: number,
    parentItemId?: number,
    pageSize?: number,
    searchTerm?: string,
    page?: number,
    locale?: string,
    searchKey?: string
  ): Promise<PaginatedResponse<ListingTypeRefItemDto>> {
    const cacheKey = `${groupId}_${parentItemId ?? ''}_${pageSize ?? ''}_${searchTerm ?? ''}_${page ?? ''}_${locale ?? ''}_${searchKey ?? ''}`;

    // 1. Return from memory cache if fresh
    const cached = refCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // 2. Return in-flight promise if identical request is already pending
    const inFlight = inFlightRefRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // 3. Fetch with request deduplication
    const fetchPromise = (async () => {
      try {
        const queryParams = new URLSearchParams();
        if (parentItemId !== undefined) {
          queryParams.append('parentItemId', parentItemId.toString());
        }
        if (pageSize !== undefined) {
          queryParams.append('pageSize', pageSize.toString());
        }
        if (searchTerm) {
          queryParams.append('searchTerm', searchTerm);
        }
        if (searchKey) {
          queryParams.append('searchKey', searchKey);
        }
        if (page !== undefined) {
          queryParams.append('page', page.toString());
        }
        if (locale) {
          queryParams.append('locale', locale);
        }

        const queryString = queryParams.toString();
        const url = `/listing-type-ref/ref-groups/${groupId}/items${queryString ? `?${queryString}` : ''}`;

        const res = (await getReq({
          url,
          next: { revalidate: 180 }, // 3 min server-side cache
        })) as PaginatedResponse<ListingTypeRefItemDto>;

        if (res && res.success) {
          refCache.set(cacheKey, { data: res, expiresAt: Date.now() + CACHE_TTL_MS });
        }
        return res;
      } finally {
        inFlightRefRequests.delete(cacheKey);
      }
    })();

    inFlightRefRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }
}

