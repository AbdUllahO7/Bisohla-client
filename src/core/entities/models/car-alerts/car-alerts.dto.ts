import { SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '../cars/cars.dto';

export interface SelectCarAlertDto {
  id: number;
  userId: number;
  listingTypeId: number;
  minPrice: number;
  maxPrice: number;
  governorate: string;
  city: string;
  isActive: boolean;
  attributeFilters?: Record<string, any>;
  createdAt: string;
  updatedAt: string;

  // For backward compatibility or car-specific views
  makeId?: number;
  modelId?: number;
  trimId?: number;
  
  // Optional relations
  make?: SelectCarMakeDto;
  model?: SelectCarModelDto;
  trim?: SelectCarTrimDto;
}
