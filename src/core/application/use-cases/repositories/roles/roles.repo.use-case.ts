import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { QueryParams } from '@/core/entities/api/api';

import { IRolesRepoUseCase } from './roles.repo.use-case.inteface';
import { IRolesRepo } from '@/core/application/repositories/roles.repo.interface';
import {
  CreateRoleDto,
  SelectRoleDto,
  UpdateRoleDto,
} from '@/core/entities/models/permissions/roles.dto';

export class RolesRepoUseCase implements IRolesRepoUseCase {
  constructor(protected readonly userRepo: IRolesRepo) {}
  async seed(items: SelectRoleDto[]): Promise<void> {
    await this.userRepo.seed(items);
  }
  async reset(): Promise<void> {
    await this.userRepo.reset();
  }
  async findById(id: number): Promise<ApiResponse<SelectRoleDto>> {
    return await this.userRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectRoleDto>> {
    return await this.userRepo.findAll(params);
  }
  async create(createDto: CreateRoleDto): Promise<ApiResponse<SelectRoleDto>> {
    return await this.userRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateRoleDto,
  ): Promise<ApiResponse<SelectRoleDto>> {
    return await this.userRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return this.userRepo.delete(id);
  }
}
