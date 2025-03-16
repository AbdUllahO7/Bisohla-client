import {
  ApiResponse,
  SuccessCheckResponse,
} from '@/core/entities/api/success.response';
import { SelectPermissionDto } from '@/core/entities/models/permissions/permissions.dto';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';

export interface IPermissionStrategy {
  checkPermission: (
    permission: string,
  ) => Promise<ApiResponse<SuccessCheckResponse>>;
  checkRole: (role: string) => Promise<ApiResponse<SuccessCheckResponse>>;
  checkAnyPermission: (
    permissions: string[],
  ) => Promise<ApiResponse<SuccessCheckResponse>>;
  checkAnyRole: (role: string[]) => Promise<ApiResponse<SuccessCheckResponse>>;
  findRoles(): Promise<ApiResponse<SelectRoleDto[]>>;
  findRoleById(id: number): Promise<ApiResponse<SelectRoleDto>>;
  findPermissions(): Promise<ApiResponse<SelectPermissionDto[]>>;
  findPermissionById(id: number): Promise<ApiResponse<SelectPermissionDto>>;
}
