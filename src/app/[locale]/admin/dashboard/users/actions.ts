'use server';

import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  CreateUserDto,
  CreateUserResponse,
  SelectUserDto,
} from '@/core/entities/models/users/users.dto';
import { getInjection } from '@/di/container';

export const getPaginatedUsers = async (
  params: QueryParams,
): Promise<PaginatedResponse<SelectUserDto>> => {
  const userController = getInjection('IUserRepoController');

  const res = await userController.findAll(params);

  return res;
};

export const createUser = async (
  createUserDto: CreateUserDto,
): Promise<ApiResponse<CreateUserResponse>> => {
  const userController = getInjection('IUserRepoController');

  const res = await userController.create(createUserDto);

  console.log('RESPONSE: ', res);

  return res;
};
