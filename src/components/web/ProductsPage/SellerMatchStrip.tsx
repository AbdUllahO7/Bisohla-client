'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import SellerRowCard from '@/components/web/design/SellerRowCard';
import { TopSellerSummaryDto } from '@/core/entities/models/public-profile/top-seller.dto';

interface SellerMatchStripProps {
  sellers: TopSellerSummaryDto[] | undefined;
  isLoading: boolean;
  totalListingsCount: number;
}

/**
 * Seller-match strip rendered above search results when searchTerm matches trader names.
 * Follows 07-search-enhancements.md §4:
 * - Render null while loading (no spinner / flash)
 * - Renders as a plain sibling of results list
 * - Conditional caption if seller matched by name but has no listings in current type
 * - Click navigates to /profile/[id]
 */
export const SellerMatchStrip: React.FC<SellerMatchStripProps> = ({
  sellers,
  isLoading,
  totalListingsCount,
}) => {
  const t = useTranslations('search.seller_matches');
  const router = useRouter();

  // Render null — not a spinner — while lookup is in flight, or if empty
  if (isLoading || !sellers || sellers.length === 0) {
    return null;
  }

  const showNoListingsCaption = totalListingsCount === 0;

  return (
    <div className="w-full mb-6 space-y-2.5">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
        {t('title')}
      </div>
      <div className="flex flex-col gap-2">
        {sellers.map((seller) => (
          <SellerRowCard
            key={seller.id}
            userId={seller.id}
            name={seller.name}
            profileUrl={seller.profileUrl}
            listingsCount={seller.listingsCount}
            onClick={() => router.push(`/profile/${seller.id}`)}
          />
        ))}
      </div>
      {showNoListingsCaption && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 px-1">
          {t('no_type_listings')}
        </p>
      )}
    </div>
  );
};

export default SellerMatchStrip;
