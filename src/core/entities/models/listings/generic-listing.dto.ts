/**
 * GenericListingDto — mirrors the raw API response from /listings-visitor/slug/:slug
 * Used by the details page to render dynamic attribute grids for any listing type.
 */

export interface GenericAttributeOption {
  id: string;
  label: {
    ar: string;
    en: string;
  };
}

export interface GenericAttributeReferenceItem {
  id: number;
  slug: string;
  name: string;
  iconUrl?: string | null;
  logoUrl?: string | null;
}

export interface GenericAttributeMeta {
  id: number;
  slug: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'reference' | 'year' | 'color_picker' | 'color_selection' | 'color_multi_selection';
  name: string;
  hint?: string | null;
  options?: GenericAttributeOption[] | null;
  isTranslatable: boolean;
}

export interface GenericAttributeValue {
  id: number;
  attributeId: number;
  attribute: GenericAttributeMeta;
  valueText: string | null;
  valueNumber: string | null;
  valueBoolean: boolean | null;
  valueDate: string | null;
  valueJson: any;
  valueTextTranslations: Record<string, string> | null;
  referenceItemId: number | null;
  referenceItem: GenericAttributeReferenceItem | null;
}

export interface GenericListingUser {
  id: number;
  name: string;
  email: string;
  profileUrl?: string | null;
  phone: string;
}

export interface GenericListingImage {
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface GenericListingType {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  imageUrl?: string | null;
}

export interface GenericListingDto {
  id: number;
  userId: number;
  listingTypeId: number;
  listingTypeVersionId: number;
  slug: string;
  title: string;
  description: string | null;
  story: string | null;
  price: string;
  currency: string;
  governorate: string;
  city: string;
  address: string | null;
  publicationStatus: string;
  moderationStatus: string;
  listingOfferType: string;
  rentType: string | null;
  condition: string | null;
  isFeatured: boolean;
  isTrend: boolean;
  contactNumber: string;
  publishedAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isFavorite: boolean;
  user: GenericListingUser;
  listingType: GenericListingType;
  images: GenericListingImage[];
  attributeValues: GenericAttributeValue[];
}
