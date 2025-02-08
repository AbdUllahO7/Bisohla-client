import {
  CreateUserDto,
  SelectUserDto,
  UpdateUserDto,
} from '@/core/entities/models/users/users.dto';
import { BaseRepo } from './base.repo';
import { IUserRepository } from '@/core/application/repositories/user.repo.interface';

export class UsersRepo
  extends BaseRepo<SelectUserDto, CreateUserDto, UpdateUserDto>
  // TODO: convert this to BaseRepo when linkt to backend
  implements IUserRepository {}
