import {
  CreateRoleDto,
  SelectRoleDto,
  UpdateRoleDto,
} from '@/core/entities/models/permissions/roles.dto';
import { IBaseRepo } from '../strategies/repo.strategy';

export type IRolesRepo = IBaseRepo<SelectRoleDto, CreateRoleDto, UpdateRoleDto>;
