import { IUserRepoController } from '@/core/application/controllers/repositories/users.repo.controller.interface';
import { IUsersRepoUseCase } from '@/core/application/use-cases/repositories/users/users.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  CreateUserDto,
  SelectUserDto,
  UpdateUserDto,
} from '@/core/entities/models/users/users.dto';
import { catchClientRequest } from '@/core/lib/error';

export class UsersRepoController implements IUserRepoController {
  constructor(protected readonly userRepoUseCase: IUsersRepoUseCase) {}
  async seed(items: SelectUserDto[]): Promise<void> {
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
  async findById(id: number): Promise<ApiResponse<SelectUserDto>> {
    try {
      return await this.userRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectUserDto>> {
    try {
      return await this.userRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async create(createDto: CreateUserDto): Promise<ApiResponse<SelectUserDto>> {
    try {
      return await this.userRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async update(
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<ApiResponse<SelectUserDto>> {
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
