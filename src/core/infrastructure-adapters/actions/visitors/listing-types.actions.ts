'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import { ListingTypeAlertFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { getInjection } from '@/di/container';

export const getAlertFormSchema = async (
  id: number
): Promise<ApiResponse<ListingTypeAlertFormSchemaDto>> => {
  const controller = getInjection('IListingTypesRepoController');
  return await controller.getAlertFormSchema(id);
};
