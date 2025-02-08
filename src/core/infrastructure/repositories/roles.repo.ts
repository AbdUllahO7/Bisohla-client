import { BaseRepo } from './base.repo';
import { IRolesRepo } from '@/core/application/repositories/roles.repo.interface';
import {
  CreateRoleDto,
  SelectRoleDto,
  UpdateRoleDto,
} from '@/core/entities/models/permissions/roles.dto';

export class RolesRepo
  extends BaseRepo<SelectRoleDto, CreateRoleDto, UpdateRoleDto>
  // TODO: convert this to BaseRepo when linkt to backend
  implements IRolesRepo {}
