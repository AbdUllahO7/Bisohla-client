'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ListingType, RentType } from '@/core/entities/enums/cars.enums';
import { LISTING_CONDITIONS } from '@/core/entities/enums/listing-condition.enum';
import {
  SyriaCity_ARABIC_NAMES,
  SyriaGovernorate_ARABIC_NAMES,
} from '@/core/entities/enums/syria.enums';
import type { GenericListingDto } from '@/core/entities/models/listings/generic-listing.dto';

export interface ProductInfoRow {
  key: string;
  label: string;
  value: string;
}

export interface ProductInfoSource {
  id?: number;
  price?: string | number | null;
  currency?: string | null;
  listingOfferType?: string | null;
  rentType?: string | null;
  condition?: string | null;
  governorate?: string | null;
  city?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  listingType?: Pick<GenericListingDto['listingType'], 'name'> | null;
}

const placeLabel = (raw: string | null | undefined, names: Record<string, string>, isArabic: boolean) =>
  raw ? (isArabic ? names[raw] ?? raw : raw.replace(/-/g, ' ')) : '';

/** Listing-level meta (common fields only, never schema attributes) for the "Product Info" card. */
export const useProductInfoRows = (listing: ProductInfoSource | null | undefined): ProductInfoRow[] => {
  const locale = useLocale();
  const t = useTranslations('product.BasicInfo');
  const tStepFour = useTranslations('addProduct.enteredData.stepFour');

  return useMemo(() => {
    if (!listing) return [];
    const isArabic = locale === 'ar';

    const offerLabel =
      listing.listingOfferType === ListingType.FOR_RENT
        ? tStepFour('dateValue.forRent')
        : listing.listingOfferType === ListingType.FOR_SALE
          ? tStepFour('dateValue.forSale')
          : '';
    const rentLabel =
      listing.listingOfferType === ListingType.FOR_RENT &&
      (Object.values(RentType) as string[]).includes(listing.rentType ?? '')
        ? tStepFour(`dateValue.RentType.${listing.rentType}`)
        : '';

    const location = [
      placeLabel(listing.city, SyriaCity_ARABIC_NAMES, isArabic),
      placeLabel(listing.governorate, SyriaGovernorate_ARABIC_NAMES, isArabic),
    ]
      .filter(Boolean)
      .join(isArabic ? '، ' : ', ');

    const dateSource = listing.publishedAt ?? listing.createdAt;
    const date = dateSource ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(dateSource)) : '';

    return [
      { key: 'price', label: t('price'), value: listing.price ? `${listing.price} ${listing.currency ?? ''}`.trim() : '' },
      { key: 'adType', label: t('adType'), value: [offerLabel, rentLabel].filter(Boolean).join(' · ') },
      {
        key: 'condition',
        label: t('condition'),
        value: (LISTING_CONDITIONS as readonly string[]).includes(listing.condition ?? '')
          ? tStepFour(`condition_options.${listing.condition}`)
          : '',
      },
      { key: 'location', label: t('location'), value: location },
      { key: 'listingType', label: t('listingType'), value: listing.listingType?.name ?? '' },
      { key: 'adsNumber', label: t('adsNumber'), value: listing.id ? String(listing.id) : '' },
      { key: 'dateOfAds', label: t('dateOfAds'), value: date },
    ];
  }, [listing, locale, t, tStepFour]);
};
