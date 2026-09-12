// src/core/entities/models/listings/create-listing.dto.ts
// Generic listing API types for POST /my-listings and PATCH /my-listings/{id}

export interface ListingTranslations {
  en?: { title: string; description: string | null; story?: string | null };
  ar?: { title: string; description: string | null; story?: string | null };
}

export interface AttributeValue {
  attributeId: number;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueDate?: string;
  valueJson?: any;
  valueTextTranslations?: { en?: string; ar?: string };
  referenceItemId?: number | null;
  proposedReferenceName?: string;
}

import { InstallmentPlanInputDto } from './installments.dto';

export interface CreateListingDto {
  listingTypeId: number;
  listingOfferType: string;       // "for_sale" | "for_rent" | "for_exchange"
  rentType?: 'daily' | 'weekly' | 'monthly' | null;
  installmentsAvailable?: boolean;
  installmentPlans?: InstallmentPlanInputDto[];
  price?: number | null;
  currency?: string;              // "USD" | "SYP" | "EUR"
  governorate?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactNumber?: string | null;
  showOnMap?: boolean;
  condition?: string | null;
  publicationStatus?: string;     // "draft" | "published" | "sold"
  publishedAt?: string | null;
  translations: ListingTranslations;
  attributeValues: AttributeValue[];
  images?: string[];
  primaryImageIndex?: number;
}

export interface UpdateListingDto {
  listingTypeId?: number;
  listingOfferType?: string;
  rentType?: 'daily' | 'weekly' | 'monthly' | null;
  installmentsAvailable?: boolean;
  installmentPlans?: InstallmentPlanInputDto[];
  price?: number | null;
  currency?: string;
  governorate?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactNumber?: string | null;
  showOnMap?: boolean;
  condition?: string | null;
  publicationStatus?: string;
  publishedAt?: string | null;
  translations?: ListingTranslations;
  attributeValues?: AttributeValue[];
  images?: string[];
  primaryImageIndex?: number;
  /** Optimistic lock from the owner detail; a mismatch is a 409. */
  version?: number;
}
