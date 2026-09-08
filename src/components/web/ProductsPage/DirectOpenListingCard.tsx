'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Hash, ChevronRight } from 'lucide-react';
import { parseIdSearchTerm } from '@/core/lib/parse-id-search-term';
import { getListingById } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { cn } from '@/lib/utils';

interface DirectOpenListingCardProps {
  searchTerm: string | null | undefined;
  currentPage: number;
  isSearchLoading: boolean;
  totalItems: number;
  className?: string;
}

/**
 * Cross-type direct-open card rendered above the empty state when a user searches
 * for a specific listing #ID that exists in another listing category.
 *
 * Requirements from 07-search-enhancements.md §5:
 * 1. parseIdSearchTerm(searchTerm) != null
 * 2. currentPage === 1
 * 3. in-type search completed with totalItems === 0
 * 4. Stale-data guard: listing.id === directOpenId
 * 5. 404 is silent (renders null)
 * 6. Bidi: '#' travels inside the interpolated value, isolated from Arabic text.
 */
export const DirectOpenListingCard: React.FC<DirectOpenListingCardProps> = ({
  searchTerm,
  currentPage,
  isSearchLoading,
  totalItems,
  className,
}) => {
  const t = useTranslations('search.direct_open');

  const parsedId = parseIdSearchTerm(searchTerm);

  const shouldFire =
    parsedId !== null &&
    currentPage === 1 &&
    !isSearchLoading &&
    totalItems === 0;

  const { data: listingData } = useQuery({
    queryKey: ['direct-open-listing', parsedId],
    queryFn: async () => {
      if (!parsedId) return null;
      try {
        const res = await getListingById(parsedId);
        if (res.success && res.data) {
          return res.data;
        }
        return null;
      } catch {
        // Silent on 404 / errors — speculative lookup
        return null;
      }
    },
    enabled: shouldFire,
    staleTime: 60 * 1000,
    retry: false,
  });

  // Stale-data flash guard: ensure resolved id matches parsedId exactly
  if (!shouldFire || !listingData || listingData.id !== parsedId) {
    return null;
  }

  // Listing type display name from locale-resolved backend response
  const typeName =
    listingData.listingType?.name ||
    listingData.listingType?.nameTranslations?.ar ||
    listingData.listingType?.nameTranslations?.en ||
    '';

  // Bidi-isolated #id string (\u2066 = LRI, \u2069 = PDI)
  const bidiIsolatedId = `\u2066#${parsedId}\u2069`;

  return (
    <Link
      href={`/products/product/${listingData.slug || listingData.id}`}
      aria-label={t('button')}
      className={cn(
        'w-full max-w-xl mx-auto mb-6 p-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-white to-primary/5 dark:from-primary/10 dark:via-zinc-900 dark:to-primary/10 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex items-center justify-between gap-4 group text-start',
        className,
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 text-primary group-hover:scale-105 transition-transform">
          <Hash className="w-5 h-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
            {t('title', { id: bidiIsolatedId })}
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
            {t('subtitle', { typeName })}
          </p>
        </div>
      </div>
      <div className="shrink-0 flex items-center text-primary group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
        <ChevronRight className="w-5 h-5 rtl:rotate-180" />
      </div>
    </Link>
  );
};

export default DirectOpenListingCard;
