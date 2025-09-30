'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import { getReq } from '@/core/lib/api';
import { catchClientRequest } from '@/core/lib/error';

/**
 * Get all settings - simple and clean
 */
export const getPublicSettings = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await getReq({
      url: '/settings/public',
    });

    return res;
  } catch (error) {
    return catchClientRequest(error);
  }
};
