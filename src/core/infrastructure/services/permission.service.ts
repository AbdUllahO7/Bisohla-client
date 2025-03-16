import { IPermissionService } from '@/core/application/services/permission.service.interface';
import {
  ApiResponse,
  SuccessCheckResponse,
} from '@/core/entities/api/success.response';
import { SelectPermissionDto } from '@/core/entities/models/permissions/permissions.dto';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';
import { getAuthReq, postAuthReq } from '@/core/lib/api';

export class PermissionService implements IPermissionService {
  async authorizePermission(permission: string): Promise<boolean> {
    const authorize = await this.checkPermission(permission);
    if (!authorize.success || !authorize.data?.success) {
      throw new Error('Permission denied');
    }

    return true;
  }
  async authorizeRole(role: string): Promise<boolean> {
    const authorize = await this.checkRole(role);
    if (!authorize.success || !authorize.data?.success) {
      throw new Error('Role denied');
    }

    return true;
  }
  async findRoles(): Promise<ApiResponse<SelectRoleDto[]>> {
    const res = await getAuthReq<Record<string, unknown>, SelectRoleDto[]>({
      url: '/permission/roles',
      errorDefaultMessage: 'Failed to fetch roles.',
    });

    return res;
  }
  async findRoleById(id: number): Promise<ApiResponse<SelectRoleDto>> {
    const res = await getAuthReq<Record<string, unknown>, SelectRoleDto>({
      url: '/permission/role/' + id,
      errorDefaultMessage: 'Failed to fetch role.',
    });

    return res;
  }
  async findPermissions(): Promise<ApiResponse<SelectPermissionDto[]>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      SelectPermissionDto[]
    >({
      url: '/permission/permissions',
      errorDefaultMessage: 'Failed to fetch role.',
    });

    return res;
  }
  async findPermissionById(
    id: number,
  ): Promise<ApiResponse<SelectPermissionDto>> {
    const res = await getAuthReq<Record<string, unknown>, SelectPermissionDto>({
      url: '/permission/permission/' + id,
      errorDefaultMessage: 'Failed to fetch permission.',
    });

    return res;
  }

  async checkPermission(
    permission: string,
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    const res = await postAuthReq<{ permission: string }, SuccessCheckResponse>(
      {
        url: '/permission/check-permission',
        body: {
          permission: permission,
        },
        errorDefaultMessage: 'Failed to check permission.',
      },
    );

    return res;
  }

  async checkAnyPermission(
    permissions: string[],
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    const res = await postAuthReq<
      { permissions: string[] },
      SuccessCheckResponse
    >({
      url: '/permission/check-any-permission',
      body: {
        permissions: permissions,
      },
      errorDefaultMessage: 'Failed to check any permission.',
    });

    return res;
  }

  async checkAnyRole(
    roles: string[],
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    const res = await postAuthReq<{ roles: string[] }, SuccessCheckResponse>({
      url: '/permission/check-any-role',
      body: {
        roles: roles,
      },
      errorDefaultMessage: 'Failed to check any role.',
    });

    return res;
  }
  async checkRole(role: string): Promise<ApiResponse<SuccessCheckResponse>> {
    const res = await postAuthReq<{ role: string }, SuccessCheckResponse>({
      url: '/permission/check-role',
      body: {
        role: role,
      },
      errorDefaultMessage: 'Failed to register.',
    });

    return res;
  }
}
