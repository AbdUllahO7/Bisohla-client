import { ICarTrimRepo } from '@/core/application/repositories/cars/cars.repos.interface';

import { SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto';
import { BaseRepo } from '../base.repo';
import {
  CreateCarTrimDto,
  UpdateCarTrimDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarTrimRepo
  extends BaseRepo<SelectCarTrimDto, CreateCarTrimDto, UpdateCarTrimDto>
  implements ICarTrimRepo {}
