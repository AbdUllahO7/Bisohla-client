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
  listingType: string;
  governorate: SyriaGovernorate;
  city: SyriaCity;
  address: string;
  images: ListingImageDto[];
  listingOfferType?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date | null;
}
