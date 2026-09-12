'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import { getReq } from '@/core/lib/api';
import { catchClientRequest } from '@/core/lib/error';
import { cache } from 'react';

/**
 * Get all settings - cached per request on server & shared across RSC lifecycle
 */
export const getPublicSettings = cache(async (): Promise<ApiResponse<any>> => {
  try {
    const res = await getReq({
      url: '/settings/public',
      next: {
        revalidate: 3600,
        tags: ['settings', 'public-settings'],
      },
    });

    return res;
  } catch (error) {
    return catchClientRequest(error);
  }
});
