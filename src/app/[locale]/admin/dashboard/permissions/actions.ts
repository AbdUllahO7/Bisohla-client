'use server';

import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';
import { getInjection } from '@/di/container';

export const getRoles = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectRoleDto>> => {
  const controller = getInjection('IRolesRepo');

  const res = await controller.findAll(params);

  return res;
};
