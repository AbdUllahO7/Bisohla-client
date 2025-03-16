import { ICarModelRepo } from '@/core/application/repositories/cars/cars.repos.interface';

import { SelectCarModelDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarModelDto,
  UpdateCarModelDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { BaseRepo } from '../base.repo';

export class CarModelRepo
  extends BaseRepo<SelectCarModelDto, CreateCarModelDto, UpdateCarModelDto>
  implements ICarModelRepo {}
