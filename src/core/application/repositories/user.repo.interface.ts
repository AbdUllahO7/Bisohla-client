import {
  CreateUserDto,
  SelectUserDto,
  // SelectUserWithTransformedRolesType,
  UpdateUserDto,
} from '@/core/entities/models/users/users.dto';
import { IBaseRepo } from '../strategies/repo.strategy';

export type IUserRepository = IBaseRepo<
  SelectUserDto,
  CreateUserDto,
  UpdateUserDto
>;
