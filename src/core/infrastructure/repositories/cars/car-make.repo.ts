import { ICarMakeRepo } from '@/core/application/repositories/cars/cars.repos.interface';

import { SelectCarMakeDto } from '@/core/entities/models/cars/cars.dto';
import { BaseRepo } from '../base.repo';
import {
  CreateCarMakeDto,
  UpdateCarMakeDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarMakeRepo
  extends BaseRepo<SelectCarMakeDto, CreateCarMakeDto, UpdateCarMakeDto>
  implements ICarMakeRepo {}
