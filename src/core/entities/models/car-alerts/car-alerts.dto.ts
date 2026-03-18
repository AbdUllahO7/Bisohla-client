import { SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '../cars/cars.dto';

export interface SelectCarAlertDto {
  id: number;
  userId: number;
  makeId: number;
  modelId: number;
  trimId: number;
  minPrice: number;
  maxPrice: number;
  governorate: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Optional relations
  make?: SelectCarMakeDto;
  model?: SelectCarModelDto;
  trim?: SelectCarTrimDto;
}
