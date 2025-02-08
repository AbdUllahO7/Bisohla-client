import { IPermissionController } from '@/core/application/controllers/permission.controller.interface';
import { IPermissionUseCase } from '@/core/application/use-cases/permission/permission.use-case.interface';
import {
  ApiResponse,
  SuccessCheckResponse,
} from '@/core/entities/api/success.response';
import { SelectPermissionDto } from '@/core/entities/models/permissions/permissions.dto';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';
import { catchClientRequest } from '@/core/lib/error';

export class PermissionController implements IPermissionController {
  constructor(protected readonly permissionUseCase: IPermissionUseCase) {}
  async findRoles(): Promise<ApiResponse<SelectRoleDto[]>> {
    try {
      const res = await this.permissionUseCase.findRoles();
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findRoleById(id: number): Promise<ApiResponse<SelectRoleDto>> {
    try {
      const res = await this.permissionUseCase.findRoleById(id);
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findPermissions(): Promise<ApiResponse<SelectPermissionDto[]>> {
    try {
      const res = await this.permissionUseCase.findPermissions();
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findPermissionById(
    id: number,
  ): Promise<ApiResponse<SelectPermissionDto>> {
    try {
      const res = await this.permissionUseCase.findPermissionById(id);
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async checkPermission(
    permission: string,
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    try {
      const res = await this.permissionUseCase.checkPermission(permission);
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async checkRole(role: string): Promise<ApiResponse<SuccessCheckResponse>> {
    try {
      const res = await this.permissionUseCase.checkRole(role);
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async checkAnyPermission(
    permissions: string[],
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    try {
      const res = await this.permissionUseCase.checkAnyPermission(permissions);
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async checkAnyRole(
    role: string[],
  ): Promise<ApiResponse<SuccessCheckResponse>> {
    try {
      const res = await this.permissionUseCase.checkAnyRole(role);
      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
}
