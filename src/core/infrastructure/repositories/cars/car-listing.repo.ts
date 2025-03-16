import { ICarListingRepo } from '@/core/application/repositories/cars/cars.repos.interface';

import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { BaseRepo } from '../base.repo';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarListingRepo
  extends BaseRepo<
    SelectCarListingDto,
    CreateCarListingDto,
    UpdateCarListingDto
  >
  implements ICarListingRepo {}
