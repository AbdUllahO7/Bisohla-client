import { ICarFeatureRepo } from '@/core/application/repositories/cars/cars.repos.interface';

import { SelectFeatureDto } from '@/core/entities/models/cars/cars.dto';
import { BaseRepo } from '../base.repo';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarFeatureRepo
  extends BaseRepo<SelectFeatureDto, CreateFeatureDto, UpdateFeatureDto>
  implements ICarFeatureRepo {}
