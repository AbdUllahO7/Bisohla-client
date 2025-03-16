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
  SelectUserWithTransformedRolesType,
  UpdateUserDto,
} from '@/core/entities/models/users/users.dto';

export class UserRepoUseCase implements IUsersRepoUseCase {
  constructor(protected readonly userRepo: IUserRepository) {}

  transformRolesData(
    selectUser: SelectUserDto,
  ): SelectUserWithTransformedRolesType {
    return {
      ...selectUser,
      roles: selectUser.usersToRoles?.map((userRole) => userRole.role) ?? [],
    };
  }

  transformRolesDataInPaginatedRes(
    selectUser: PaginatedResponse<SelectUserDto>,
  ): PaginatedResponse<SelectUserWithTransformedRolesType> {
    return {
      ...selectUser,
      data: selectUser.data
        ? {
            ...selectUser.data,
            data: selectUser.data.data.map(this.transformRolesData),
          }
        : undefined,
    };
  }

  transformRolesDataInApiRes(
    selectUser: ApiResponse<SelectUserDto>,
  ): ApiResponse<SelectUserWithTransformedRolesType> {
    return {
      ...selectUser,
      data: selectUser.data
        ? this.transformRolesData(selectUser.data)
        : undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async seed(items: SelectUserWithTransformedRolesType[]): Promise<void> {
    throw Error('Cannot seed');
  }
  async reset(): Promise<void> {
    await this.userRepo.reset();
  }
  async findById(
    id: number,
  ): Promise<ApiResponse<SelectUserWithTransformedRolesType>> {
    return this.transformRolesDataInApiRes(await this.userRepo.findById(id));
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectUserWithTransformedRolesType>> {
    const users = await this.userRepo.findAll(params);

    return this.transformRolesDataInPaginatedRes(users);
  }

  async create(
    createDto: CreateUserDto,
  ): Promise<ApiResponse<SelectUserWithTransformedRolesType>> {
    return this.transformRolesDataInApiRes(
      await this.userRepo.create(createDto),
    );
  }
  async update(
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<ApiResponse<SelectUserWithTransformedRolesType>> {
    return this.transformRolesDataInApiRes(
      await this.userRepo.update(id, updateDto),
    );
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return this.userRepo.delete(id);
  }
}
