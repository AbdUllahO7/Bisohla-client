'use client';

import { ApiResponse } from '@/core/entities/api/success.response';
import { useMutation } from '@tanstack/react-query';
import { updateUserLocale } from '../../actions/users/locale.actions';

export const useUpdateLocale = () => {
  return useMutation<
    ApiResponse<{
      updated: boolean;
    }>,
    Error,
    { id: number; locale: string }
  >({
    mutationFn: async ({ id, locale }) => {
      const res = await updateUserLocale(id, locale);

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    },
   
  });
};
