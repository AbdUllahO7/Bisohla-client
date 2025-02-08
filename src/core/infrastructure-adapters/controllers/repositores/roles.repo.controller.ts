import { IRolesRepoController } from '@/core/application/controllers/repositories/roles.repo.controller.interface';
import { IRolesRepoUseCase } from '@/core/application/use-cases/repositories/roles/roles.repo.use-case.inteface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  CreateRoleDto,
  SelectRoleDto,
  UpdateRoleDto,
} from '@/core/entities/models/permissions/roles.dto';

import { catchClientRequest } from '@/core/lib/error';

export class RolesRepoController implements IRolesRepoController {
  constructor(protected readonly userRepoUseCase: IRolesRepoUseCase) {}
  async seed(items: SelectRoleDto[]): Promise<void> {
    try {
      await this.userRepoUseCase.seed(items);
    } catch (e) {
      throw catchClientRequest(e);
    }
  }
  async reset(): Promise<void> {
    try {
      await this.userRepoUseCase.reset();
    } catch (e) {
      throw catchClientRequest(e);
    }
  }
  async findById(id: number): Promise<ApiResponse<SelectRoleDto>> {
    try {
      return await this.userRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectRoleDto>> {
    try {
      return await this.userRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async create(createDto: CreateRoleDto): Promise<ApiResponse<SelectRoleDto>> {
    try {
      return await this.userRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async update(
    id: number,
    updateDto: UpdateRoleDto,
  ): Promise<ApiResponse<SelectRoleDto>> {
    try {
      return await this.userRepoUseCase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.userRepoUseCase.delete(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
}
