'use client';

import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProductClient from './product-client';
import MobileProductClient from './mobile-product-client';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { GenericListingDto } from '@/core/entities/models/listings/generic-listing.dto';

interface ProductDetailSwitcherProps {
  carDataRes: ApiResponse<SelectCarListingDto>;
  rawListing?: GenericListingDto | null;
  isAuthenticated: boolean;
  locale: string;
  isProfileView: boolean;
}

export default function ProductDetailSwitcher({
  carDataRes,
  rawListing,
  isAuthenticated,
  locale,
  isProfileView,
}: ProductDetailSwitcherProps) {
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR and before the first client-side mount, render the desktop layout
  // so search engines (like Googlebot) crawl the full product details correctly.
  if (!isMounted) {
    return (
      <ProductClient
        carDataRes={carDataRes}
        rawListing={rawListing}
        isAuthenticated={isAuthenticated}
        locale={locale}
        isProfileView={isProfileView}
      />
    );
  }

  return isMobile ? (
    <MobileProductClient
      carDataRes={carDataRes}
      rawListing={rawListing}
      isAuthenticated={isAuthenticated}
      locale={locale}
      isProfileView={isProfileView}
    />
  ) : (
    <ProductClient
      carDataRes={carDataRes}
      rawListing={rawListing}
      isAuthenticated={isAuthenticated}
      locale={locale}
      isProfileView={isProfileView}
    />
  );
}
