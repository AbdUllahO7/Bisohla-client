import { IUserRepository } from '@/core/application/repositories/user.repo.interface';
import { IUsersRepoUseCase } from './users.repo.use-case.interface';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { QueryParams } from '@/core/entities/api/api';
import {
  CreateUserDto,
  SelectUserDto,
  UpdateUserDto,
} from '@/core/entities/models/users/users.dto';

export class UserRepoUseCase implements IUsersRepoUseCase {
  constructor(protected readonly userRepo: IUserRepository) {}
  async seed(items: SelectUserDto[]): Promise<void> {
    await this.userRepo.seed(items);
  }
  async reset(): Promise<void> {
    await this.userRepo.reset();
  }
  async findById(id: number): Promise<ApiResponse<SelectUserDto>> {
    return await this.userRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectUserDto>> {
    return await this.userRepo.findAll(params);
  }
  async create(createDto: CreateUserDto): Promise<ApiResponse<SelectUserDto>> {
    return await this.userRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<ApiResponse<SelectUserDto>> {
    return await this.userRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return this.userRepo.delete(id);
  }
}
