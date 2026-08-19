'use client';

import { Heart, Grid, List, RefreshCw, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocale } from 'next-intl';
import { getInjection } from '@/di/container';
import { UserFavoriteListing } from '@/core/entities/models/listings/users-favorites-listings.zod.dto';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import {
  useGetListingFavorites,
  useToggleListingFavorite,
} from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import { ProductSkeletonItem } from '@/components/web/design/ProductSkeletonItem';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { formatRelativeTime } from '@/utils/format-relative-time';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 16;
const SKELETON_COUNT = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPrimaryImage(listing: ListingDto): string {
  if (listing.primaryImage) return listing.primaryImage;
  if (!listing.images?.length) return '/placeholder-car.jpg';
  const primary = listing.images.find((img) => img.isPrimary);
  return primary?.url ?? listing.images[0]?.url ?? '/placeholder-car.jpg';
}

function formatPrice(price: number | null, currency: string, locale: string): string {
  if (!price) return locale === 'ar' ? 'السعر عند الطلب' : 'Price on request';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency || 'SYP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ── Listing type chip type ────────────────────────────────────────────────────

interface ListingType {
  id: number;
  name: string;
  translations?: { locale: string; name: string }[];
}

// ── FavoriteCard ──────────────────────────────────────────────────────────────

interface FavoriteCardProps {
  item: UserFavoriteListing;
  viewMode: 'grid' | 'list';
  isRemoved: boolean;
  onToggle: (id: number) => void;
  locale: string;
}

function FavoriteCard({ item, viewMode, isRemoved, onToggle, locale }: FavoriteCardProps) {
  const listing = item.listing as ListingDto | undefined;
  if (!listing) return null;

  const image = getPrimaryImage(listing);
  const priceStr = formatPrice(listing.price, listing.currency, locale);
  const offerType = (listing.listingOfferType ?? listing.listingType ?? '').toLowerCase();
  const typeLabel = offerType === 'for_rent'
    ? (locale === 'ar' ? 'للإيجار' : 'For Rent')
    : (locale === 'ar' ? 'للبيع' : 'For Sale');
  const relTime = formatRelativeTime(String(listing.createdAt));

  // Removed state drives instant visual fade (Twitter-pattern optimistic removal)
  if (isRemoved) return null;

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
        {/* Thumbnail */}
        <Link
          href={`/products/product/${listing.slug || listing.id}`}
          className="flex-shrink-0"
        >
          <div className="relative w-28 h-20 rounded-xl overflow-hidden">
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-[#198341]">
              {typeLabel}
            </span>
          </div>
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/product/${listing.slug || listing.id}`}>
            <p className="text-sm font-semibold text-[#2C3C39] line-clamp-1 group-hover:text-[#198341] transition-colors">
              {listing.title}
            </p>
          </Link>
          {listing.make && (
            <p className="text-xs text-gray-400 mt-0.5">{listing.make.name}</p>
          )}
          <p className="text-sm font-bold text-[#198341] mt-1">{priceStr}</p>
          <p className="text-[10px] text-gray-400 mt-1">{relTime}</p>
        </div>

        {/* Remove heart */}
        <button
          onClick={() => onToggle(listing.id)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
          title="Remove from favorites"
        >
          <Heart size={16} className="text-red-500 fill-red-500" />
        </button>
      </div>
    );
  }

  // Grid card
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group relative">
      {/* Remove heart */}
      <button
        onClick={() => onToggle(listing.id)}
        className="absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
        title="Remove from favorites"
      >
        <Heart size={14} className="text-red-500 fill-red-500" />
      </button>

      {/* Type badge */}
      <span className="absolute top-2.5 right-2.5 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#198341] text-white shadow-sm">
        {typeLabel}
      </span>

      {/* Image */}
      <Link href={`/products/product/${listing.slug || listing.id}`}>
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-semibold text-[#2C3C39] line-clamp-1 group-hover:text-[#198341] transition-colors">
            {listing.title}
          </p>
          {listing.make && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{listing.make.name}</p>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-[#198341]">{priceStr}</span>
        <span className="text-[10px] text-gray-400">{relTime}</span>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function FavoritesPage() {
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulated, setAccumulated] = useState<UserFavoriteListing[]>([]);
  // Twitter-pattern optimistic removal: maps listingId → removed
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  // Listing types for type chips
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────────
  const { data, isFetching, isError, refetch } = useGetListingFavorites({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const { mutate: toggleFav } = useToggleListingFavorite();

  // ── Fetch listing types for chip row ─────────────────────────────────────────
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        const res = await controller.getListingTypes(1, 100);
        if (res.success && res.data) {
          setListingTypes(res.data.data.filter((t: any) => t.isActive));
        }
      } catch {
        // silently ignore — chips are a UX enhancement, not critical
      }
    };
    fetchTypes();
  }, []);

  // ── Accumulate pages (same logic as app + NotificationsPage) ─────────────────
  useEffect(() => {
    const incoming = data?.data?.data;
    if (!incoming || incoming.length === 0) return;
    setAccumulated((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const novel = incoming.filter((f) => !existingIds.has(f.id));
      return novel.length > 0 ? [...prev, ...novel] : prev;
    });
  }, [data]);

  // ── Derived results ───────────────────────────────────────────────────────────
  const rawResults =
    currentPage === 1 && accumulated.length === 0
      ? data?.data?.data ?? []
      : accumulated;

  // Filter by selected listing type if any
  const displayResults = rawResults.filter((item) => {
    if (selectedTypeId !== undefined && item.listing) {
      return (item.listing as ListingDto).listingTypeId === selectedTypeId;
    }
    return true;
  });

  const hasNextPage = data?.data?.hasNextPage ?? false;
  const totalItems = data?.data?.totalItems ?? 0;
  const isInitialLoad = data === undefined && !isError;

  // ── Refresh ───────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAccumulated([]);
    setRemovedIds(new Set());
    void refetch();
  }, [refetch]);

  // ── Type chip selection ───────────────────────────────────────────────────────
  const handleSelectType = useCallback((id: number | undefined) => {
    setSelectedTypeId(id);
    setCurrentPage(1);
    setAccumulated([]);
  }, []);

  // ── Optimistic remove ─────────────────────────────────────────────────────────
  const handleToggle = useCallback((listingId: number) => {
    // Instantly hide — same as the app's optimistic removal
    setRemovedIds((prev) => new Set([...prev, listingId]));
    toggleFav(
      { listingId },
      {
        onError: () => {
          // Rollback on failure
          setRemovedIds((prev) => {
            const next = new Set(prev);
            next.delete(listingId);
            return next;
          });
        },
      },
    );
  }, [toggleFav]);

  // ── Infinite scroll ───────────────────────────────────────────────────────────
  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetching) setCurrentPage((p) => p + 1);
  }, [hasNextPage, isFetching]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadNextPage(); },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // ── Breadcrumbs ───────────────────────────────────────────────────────────────
  const breadcrumbItems = [{ label: locale === 'ar' ? 'المفضلة' : 'Favorites' }];

  // ── Visible count (after optimistic removal) ──────────────────────────────────
  const visibleCount = displayResults.filter((f) => {
    const listing = f.listing as ListingDto | undefined;
    return listing && !removedIds.has(listing.id);
  }).length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
            <h1 className="text-2xl font-bold text-[#2C3C39]">
              {locale === 'ar' ? 'المفضلة' : 'Favorites'}
            </h1>
            {totalItems > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#198341] text-white">
                {totalItems}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="p-2 rounded-lg text-gray-400 hover:text-[#198341] hover:bg-[#198341]/5 transition-all duration-200 disabled:opacity-40"
              title={locale === 'ar' ? 'تحديث' : 'Refresh'}
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>

            {/* Grid / List toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={[
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-[#198341]'
                    : 'text-gray-400 hover:text-gray-600',
                ].join(' ')}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={[
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-[#198341]'
                    : 'text-gray-400 hover:text-gray-600',
                ].join(' ')}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Type chip row ───────────────────────────────────────────────────── */}
        {(listingTypes.length > 0 || isInitialLoad) && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            <button
              onClick={() => handleSelectType(undefined)}
              className={[
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                selectedTypeId === undefined
                  ? 'bg-[#198341] text-white border-[#198341] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#198341] hover:text-[#198341]',
              ].join(' ')}
            >
              {locale === 'ar' ? 'الكل' : 'All'}
            </button>
            {listingTypes.map((lt) => {
              const name =
                lt.translations?.find((tr) => tr.locale === locale)?.name ?? lt.name;
              return (
                <button
                  key={lt.id}
                  onClick={() => handleSelectType(selectedTypeId === lt.id ? undefined : lt.id)}
                  className={[
                    'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                    selectedTypeId === lt.id
                      ? 'bg-[#198341] text-white border-[#198341] shadow-sm'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#198341] hover:text-[#198341]',
                  ].join(' ')}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        {isInitialLoad ? (
          /* Skeleton */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-3'
            }
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, i) =>
              viewMode === 'grid' ? (
                <ProductSkeletonItem key={i} />
              ) : (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse">
                  <div className="w-28 h-20 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : isError && displayResults.length === 0 ? (
          /* Error state */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={28} className="text-red-300" />
            </div>
            <p className="text-base font-semibold text-[#2C3C39] mb-1">
              {locale === 'ar' ? 'حدث خطأ ما' : 'Something went wrong'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {locale === 'ar'
                ? 'تعذّر تحميل المفضلة.'
                : 'We couldn\'t load your favorites.'}
            </p>
            <button
              onClick={handleRefresh}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-sm font-semibold shadow hover:shadow-md transition-all"
            >
              {locale === 'ar' ? 'حاول مجدداً' : 'Try again'}
            </button>
          </div>
        ) : visibleCount === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={40} className="text-gray-200" />
            </div>
            <p className="text-xl font-bold text-[#2C3C39] mb-2">
              {locale === 'ar' ? 'لا يوجد مفضلات بعد' : 'No favorites yet'}
            </p>
            <p className="text-sm text-gray-400 max-w-xs mb-8">
              {locale === 'ar'
                ? 'أضف الإعلانات التي تعجبك إلى المفضلة لتجدها هنا.'
                : 'Save listings you love and find them all here.'}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-sm font-semibold shadow hover:shadow-md transition-all"
            >
              <ShoppingBag size={16} />
              {locale === 'ar' ? 'تصفح الإعلانات' : 'Browse listings'}
            </Link>
          </div>
        ) : (
          /* List */
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                  : 'space-y-3'
              }
            >
              {displayResults.map((item) => {
                const listing = item.listing as ListingDto | undefined;
                if (!listing) return null;
                return (
                  <FavoriteCard
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    isRemoved={removedIds.has(listing.id)}
                    onToggle={handleToggle}
                    locale={locale}
                  />
                );
              })}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="py-4">
              {isFetching && currentPage > 1 && (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#198341] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!hasNextPage && visibleCount > 0 && (
                <p className="text-center text-xs text-gray-300 py-4">
                  {locale === 'ar' ? 'لقد رأيت كل شيء' : "You've seen it all"}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
