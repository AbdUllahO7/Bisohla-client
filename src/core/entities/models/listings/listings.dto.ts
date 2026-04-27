import { Currency } from '../../enums/currency.enum';
import { SyriaCity, SyriaGovernorate } from '../../enums/syria.enums';
import { SelectUserDto } from '../users/users.dto';

export interface ListingImageDto {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface ListingDto {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  currency: Currency;
  userId: number;
  user?: SelectUserDto;
  status: string;
  isFeatured: boolean;
  isTrend: boolean;
  listingTypeId: number;
  listingType: string;
  governorate: SyriaGovernorate;
  city: SyriaCity;
  address: string;
  images: ListingImageDto[];
  primaryImage?: string | null;
  attributeValues?: any[];
  makeId?: number | null;
  modelId?: number | null;
  trimId?: number | null;
  make?: { id: number; name: string } | null;
  model?: { id: number; name: string } | null;
  trim?: { id: number; name: string } | null;
  damages?: any[];
  saveStatus?: string;
  listingOfferType?: string;
  rentType?: string | null;
  contactNumber?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date | null;
}
