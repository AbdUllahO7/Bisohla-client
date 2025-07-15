'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import { putAuthReq } from '@/core/lib/api';
import { catchClientRequest } from '@/core/lib/error';

export const updateUserLocale = async (
  userId: number,
  locale: string,
): Promise<
  ApiResponse<{
    updated: boolean;
  }>
> => {
  try {
    const res = await putAuthReq({
      url: '/locale/update/' + userId,
      body: { locale },
    });

    return res;
  } catch (error) {
    return catchClientRequest(error);
  }
};
