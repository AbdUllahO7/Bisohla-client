import { getRoles } from '@/app/[locale]/admin/dashboard/permissions/actions';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';
import { useQuery } from '@tanstack/react-query';

export const useRoles = (params: QueryParams) =>
  useQuery<PaginatedResponse<SelectRoleDto>>({
    queryKey: ['roles', params],
    queryFn: async () => await getRoles(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });
