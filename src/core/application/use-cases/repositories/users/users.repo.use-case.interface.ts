import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  CreateUserDto,
  SelectUserWithTransformedRolesType,
  UpdateUserDto,
} from '@/core/entities/models/users/users.dto';

export interface IUsersRepoUseCase {
  findById(
    id: number,
  ): Promise<ApiResponse<SelectUserWithTransformedRolesType>>;
  findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectUserWithTransformedRolesType>>;
  create(
    createDto: CreateUserDto,
  ): Promise<ApiResponse<SelectUserWithTransformedRolesType>>;
  update(
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<ApiResponse<SelectUserWithTransformedRolesType>>;
  delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>>;
  seed(items: SelectUserWithTransformedRolesType[]): Promise<void>;
  reset(): Promise<void>;
}
