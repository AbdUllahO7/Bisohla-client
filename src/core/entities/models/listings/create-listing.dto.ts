// src/core/entities/models/listings/create-listing.dto.ts
// Generic listing API types for POST /my-listings and PATCH /my-listings/{id}

export interface ListingTranslations {
  en?: { title: string; description: string; story?: string | null };
  ar?: { title: string; description: string; story?: string | null };
}

export interface AttributeValue {
  attributeId: number;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueJson?: any;
  valueTextTranslations?: { en?: string; ar?: string };
}

export interface CreateListingDto {
  listingTypeId: number;
  listingOfferType: string;       // "for_sale" | "for_rent" | "for_exchange"
  price?: number | null;
  currency?: string;              // "USD" | "SYP" | "EUR"
  governorate?: string | null;
  city?: string | null;
  address?: string | null;
  contactNumber?: string | null;
  publicationStatus?: string;     // "draft" | "published"
  translations: ListingTranslations;
  attributeValues: AttributeValue[];
  images?: string[];
}

export interface UpdateListingDto {
  listingTypeId?: number;
  listingOfferType?: string;
  price?: number | null;
  currency?: string;
  governorate?: string | null;
  city?: string | null;
  address?: string | null;
  contactNumber?: string | null;
  publicationStatus?: string;
  translations?: ListingTranslations;
  attributeValues?: AttributeValue[];
  images?: string[];
}

// Metadata saved alongside form values in localStorage so we can
// resolve attribute IDs at submission time.
export interface AttributeMeta {
  id: number;
  type: string;  // 'text' | 'number' | 'select' | 'reference' | 'textarea' | 'boolean' | 'repeating_group' | etc.
}

// Shape stored in localStorage STEP_TWO
export interface StepTwoStorage {
  [slug: string]: any;
  __attributeMap__?: Record<string, AttributeMeta>;
}
