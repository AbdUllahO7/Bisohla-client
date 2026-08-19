'use client';

import React from 'react';
import Image from 'next/image';
import { X, MapPin, Tag, ExternalLink, Navigation } from 'lucide-react';
import { ListingMapPoint } from '@/core/entities/models/listings/map.dto';
import { Link } from '@/i18n/routing';

interface MapListingPreviewCardProps {
  listing: ListingMapPoint | null;
  cardDetail?: any;
  loadingCard?: boolean;
  onClose: () => void;
  locale: string;
}

export const MapListingPreviewCard: React.FC<MapListingPreviewCardProps> = ({
  listing,
  cardDetail,
  loadingCard,
  onClose,
  locale,
}) => {
  if (!listing) return null;

  const isRtl = locale === 'ar';
  const displayTitle =
    cardDetail?.title || listing.title || (isRtl ? 'إعلان بدون عنوان' : 'Untitled Listing');
  const displayPrice = cardDetail?.price || listing.price;
  const displayCurrency = cardDetail?.currency || listing.currency || (isRtl ? 'ل.س' : 'SYP');
  const displayImage = cardDetail?.primaryImage || cardDetail?.images?.[0] || listing.primaryImage;
  const displayGov = cardDetail?.governorate || listing.governorate;
  const displayCity = cardDetail?.city || listing.city;
  const offerType = cardDetail?.listingOfferType || listing.listingOfferType;
  const slug = cardDetail?.slug || listing.slug;

  const offerTypeLabel =
    offerType === 'for_sale'
      ? isRtl
        ? 'للبيع'
        : 'For Sale'
      : offerType === 'for_rent'
      ? isRtl
        ? 'للإيجار'
        : 'For Rent'
      : null;

  const handleDirections = () => {
    if (listing.latitude && listing.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`,
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[1000] p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400 transition-colors z-10"
        aria-label={isRtl ? 'إغلاق' : 'Close'}
      >
        <X className="w-4 h-4" />
      </button>

      {loadingCard ? (
        <div className="flex items-center space-x-4 space-x-reverse animate-pulse p-2">
          <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image Thumbnail */}
          <div className="relative w-full sm:w-28 h-32 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={displayTitle}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Tag className="w-8 h-8" />
              </div>
            )}
            {offerTypeLabel && (
              <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ABDE3B] text-black shadow-sm">
                {offerTypeLabel}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                {displayTitle}
              </h3>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                <MapPin className="w-3.5 h-3.5 mr-1 ml-1 text-[#198341]" />
                <span>
                  {[displayGov, displayCity].filter(Boolean).join(', ') || (isRtl ? 'سوريا' : 'Syria')}
                </span>
              </div>

              <div className="text-base font-extrabold text-[#198341] dark:text-[#ABDE3B]">
                {displayPrice ? `${Number(displayPrice).toLocaleString()} ${displayCurrency}` : isRtl ? 'السعر عند الاتصال' : 'Price on call'}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={`/products/product/${slug}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white shadow-md hover:shadow-lg transition-all"
              >
                <span>{isRtl ? 'عرض الإعلان' : 'View Listing'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {listing.latitude && listing.longitude && (
                <button
                  type="button"
                  onClick={handleDirections}
                  title={isRtl ? 'الاتجاهات عبر خرائط جوجل' : 'Directions'}
                  className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#198341]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
