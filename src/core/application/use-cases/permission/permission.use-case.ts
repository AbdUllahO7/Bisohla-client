import {
  ApiResponse,
  SuccessCheckResponse,
} from '@/core/entities/api/success.response';
import { IPermissionService } from '../../services/permission.service.interface';
import { IPermissionUseCase } from './permission.use-case.interface';
import { SelectPermissionDto } from '@/core/entities/models/permissions/permissions.dto';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';

export class PermissionUseCase implements IPermissionUseCase {
  constructor(protected readonly permissionService: IPermissionService) {}
  async findRoles(): Promise<ApiResponse<SelectRoleDto[]>> {
    await this.permissionService.authorizePermission('view_role');

    return this.permissionService.findRoles();
  }
  async findRoleById(id: number): Promise<ApiResponse<SelectRoleDto>> {
    await this.permissionService.authorizePermission('view_role');

    return this.permissionService.findRoleById(id);
  }
  async findPermissions(): Promise<ApiResponse<SelectPermissionDto[]>> {
    await this.permissionService.authorizePermission('view_permissions');

    return this.permissionService.findPermissions();
  }
  async findPermissionById(
    id: number,
  ): Promise<ApiResponse<SelectPermissionDto>> {
    await this.permissionService.authorizePermission('view_permissions');

    return this.permissionService.findPermissionById(id);
  }

  async checkPermission(
    permission: string,
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    return this.permissionService.checkPermission(permission);
  }

  async checkRole(role: string): Promise<ApiResponse<SuccessCheckResponse>> {
    return this.permissionService.checkRole(role);
  }

  async checkAnyPermission(
    permissions: string[],
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    return await this.permissionService.checkAnyPermission(permissions);
  }

  async checkAnyRole(
    roles: string[],
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    return await this.permissionService.checkAnyRole(roles);
  }
}
