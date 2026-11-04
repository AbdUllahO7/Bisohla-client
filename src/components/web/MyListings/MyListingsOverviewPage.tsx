'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  BarChart3,
  Edit3,
  Trash2,
  MapPin,
  Layers,
  X,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import Pagination from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useMyListings,
  useDeleteListing,
} from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import type { QueryParams } from '@/core/entities/api/api';
import { useDebounce } from '@/hooks/use-debounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// Static count query parameters to prevent re-creation on re-render
const ALL_COUNT_PARAMS: QueryParams = {
  page: 1,
  pageSize: 1,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

const PUBLISHED_COUNT_PARAMS: QueryParams = {
  page: 1,
  pageSize: 1,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  where: [{ field: 'publicationStatus', operator: 'eq', value: 'published' }],
};

const DRAFT_COUNT_PARAMS: QueryParams = {
  page: 1,
  pageSize: 1,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  where: [{ field: 'publicationStatus', operator: 'eq', value: 'draft' }],
};

const SOLD_COUNT_PARAMS: QueryParams = {
  page: 1,
  pageSize: 1,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  where: [{ field: 'publicationStatus', operator: 'eq', value: 'sold' }],
};

export function MyListingsOverviewPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const pageSize = 12;
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Reset to first page when active tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  // Query parameters sent directly to GET /my-listings
  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = {
      page: currentPage,
      pageSize,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };

    const trimmed = debouncedSearch.trim();
    if (trimmed) {
      params.searchTerm = trimmed;
    }

    if (activeTab !== 'all') {
      params.where = [
        {
          field: 'publicationStatus',
          operator: 'eq',
          value: activeTab,
        },
      ];
    }

    return params;
  }, [currentPage, pageSize, debouncedSearch, activeTab]);

  const {
    data: listingsRes,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useMyListings(queryParams);

  const deleteListingMutation = useDeleteListing();

  // Extract raw listings returned by the server
  const listings: ListingDto[] =
    (listingsRes?.data as any)?.data ||
    (Array.isArray(listingsRes?.data) ? listingsRes.data : []);

  // Extract pagination metadata from server response envelope
  const paginationMeta = useMemo(() => {
    const raw = (listingsRes?.data || listingsRes || {}) as any;
    const totalItems =
      typeof raw?.totalItems === 'number'
        ? raw.totalItems
        : typeof (listingsRes as any)?.totalItems === 'number'
        ? (listingsRes as any).totalItems
        : listings.length;
    const totalPages =
      typeof raw?.totalPages === 'number'
        ? raw.totalPages
        : Math.max(1, Math.ceil(totalItems / pageSize));
    const hasNextPage =
      typeof raw?.hasNextPage === 'boolean'
        ? raw.hasNextPage
        : currentPage < totalPages;
    const hasPreviousPage =
      typeof raw?.hasPreviousPage === 'boolean'
        ? raw.hasPreviousPage
        : currentPage > 1;

    return {
      currentPage,
      totalPages,
      totalItems,
      hasNextPage,
      hasPreviousPage,
    };
  }, [listingsRes?.data, listingsRes, listings.length, currentPage, pageSize]);

  // Safety clamp: ONLY clamp when query is done fetching and confirmed server totalPages < currentPage
  useEffect(() => {
    if (
      !isFetching &&
      listingsRes?.data &&
      paginationMeta.totalPages > 0 &&
      currentPage > paginationMeta.totalPages
    ) {
      setCurrentPage(paginationMeta.totalPages);
    }
  }, [isFetching, listingsRes?.data, paginationMeta.totalPages, currentPage]);

  // Status totals queries (pageSize: 1) to display accurate counts on tab badges
  const { data: allCountRes } = useMyListings(ALL_COUNT_PARAMS);
  const { data: publishedCountRes } = useMyListings(PUBLISHED_COUNT_PARAMS);
  const { data: draftCountRes } = useMyListings(DRAFT_COUNT_PARAMS);
  const { data: soldCountRes } = useMyListings(SOLD_COUNT_PARAMS);

  const counts = useMemo(() => {
    const isSearching = Boolean(debouncedSearch.trim());
    const allTotal = (allCountRes?.data as any)?.totalItems ?? (allCountRes as any)?.totalItems;
    const publishedTotal = (publishedCountRes?.data as any)?.totalItems ?? (publishedCountRes as any)?.totalItems;
    const draftTotal = (draftCountRes?.data as any)?.totalItems ?? (draftCountRes as any)?.totalItems;
    const soldTotal = (soldCountRes?.data as any)?.totalItems ?? (soldCountRes as any)?.totalItems;

    return {
      all: isSearching && activeTab === 'all' ? paginationMeta.totalItems : allTotal,
      published: isSearching && activeTab === 'published' ? paginationMeta.totalItems : publishedTotal,
      draft: isSearching && activeTab === 'draft' ? paginationMeta.totalItems : draftTotal,
      sold: isSearching && activeTab === 'sold' ? paginationMeta.totalItems : soldTotal,
    };
  }, [
    allCountRes,
    publishedCountRes,
    draftCountRes,
    soldCountRes,
    debouncedSearch,
    activeTab,
    paginationMeta.totalItems,
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteListingMutation.mutateAsync({ id: deletingId });
      if (res.success) {
        toast({
          title: isArabic ? 'تم حذف الإعلان' : 'Listing Deleted',
        });
        refetch();
      } else {
        toast({
          title: isArabic ? 'خطأ' : 'Error',
          description: res.message || (isArabic ? 'فشل حذف الإعلان' : 'Failed to delete listing'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل حذف الإعلان' : 'Failed to delete listing',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const breadcrumbItems = [{ label: isArabic ? 'إعلاناتي' : 'My Listings' }];

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
                {isArabic ? 'إعلاناتي' : 'My Listings'}
              </h1>
            </div>
            <p className="text-xs text-gray-500">
              {isArabic
                ? 'إدارة إعلاناتك، متابعة الإحصائيات، وتعديل حالات النشر'
                : 'Manage your listings, track analytics, and adjust publication status'}
            </p>
          </div>

          <Link
            href="/products/add"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold shadow-md shadow-[#198341]/20 hover:shadow-lg transition-all text-xs"
          >
            <Plus size={16} />
            <span>{isArabic ? 'إضافة إعلان جديد' : 'Add New Listing'}</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100 dark:border-zinc-800">
          {[
            { key: 'all' as const, label: isArabic ? 'الكل' : 'All', count: counts.all },
            { key: 'published' as const, label: isArabic ? 'المنشورة' : 'Published', count: counts.published },
            { key: 'draft' as const, label: isArabic ? 'المسودات' : 'Drafts', count: counts.draft },
            { key: 'sold' as const, label: isArabic ? 'تم البيع' : 'Sold', count: counts.sold },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#198341] text-white shadow-sm'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & View Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'البحث في إعلاناتك...' : 'Search listings...'}
              className="pl-9 pr-9 rtl:pl-9 rtl:pr-9 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1 rounded-full transition-colors"
                aria-label={isArabic ? 'مسح البحث' : 'Clear search'}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-zinc-800 text-[#198341]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-zinc-800 text-[#198341]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Error Alert with Retry */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 text-center space-y-2">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {isArabic ? 'حدث خطأ أثناء تحميل الإعلانات' : 'Failed to load listings'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs rounded-xl"
            >
              {isArabic ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
          </div>
        )}

        {/* Listings Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-gray-100 dark:border-zinc-800 space-y-3 animate-pulse"
              >
                <div className="aspect-[16/10] bg-gray-100 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">
              <Layers size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-gray-800 dark:text-zinc-100">
                {isArabic ? 'لا توجد إعلانات مطابقة' : 'No Listings Found'}
              </h2>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {debouncedSearch
                  ? isArabic
                    ? `لم يتم العثور على أي إعلانات تطابق "${debouncedSearch}".`
                    : `No listings match "${debouncedSearch}".`
                  : isArabic
                  ? 'لم يتم العثور على أي إعلانات تطابق الفلاتر المحددة.'
                  : 'No listings match the selected filters.'}
              </p>
            </div>
            {debouncedSearch ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="rounded-xl text-xs"
              >
                {isArabic ? 'مسح البحث' : 'Clear Search'}
              </Button>
            ) : (
              <Link
                href="/products/add"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#198341] text-white font-bold text-xs shadow-md"
              >
                <Plus size={14} />
                <span>{isArabic ? 'إضافة إعلان جديد' : 'Add New Listing'}</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div
              className={`transition-opacity duration-200 ${
                isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'
              } ${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }`}
            >
              {listings.map((listing) => {
                const itemTitle =
                  (listing.translations as any)?.[locale]?.title ||
                  (listing.translations as any)?.['ar']?.title ||
                  listing.title ||
                  'Listing';

                const itemStatus = listing.publicationStatus || 'draft';
                const heroImage =
                  listing.primaryImage ||
                  (Array.isArray(listing.images) && listing.images.length > 0
                    ? typeof listing.images[0] === 'string'
                      ? listing.images[0]
                      : (listing.images.find((img: any) => img?.isPrimary)?.url ||
                         (listing.images[0] as any)?.url ||
                         (listing.images[0] as any)?.imageUrl)
                    : null);

                const detailHref = pathname.includes('/userProfile')
                  ? `/userProfile/Products/${listing.id}`
                  : `/my-listings/${listing.id}`;

                const statsHref = pathname.includes('/userProfile')
                  ? `/userProfile/Statistics/listing/${listing.id}`
                  : `/statistics/listing/${listing.id}`;

                return (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
                        {heroImage ? (
                          <Image
                            src={heroImage}
                            alt={itemTitle}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Layers size={32} />
                          </div>
                        )}

                        {/* Status Tag */}
                        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md ${
                              itemStatus === 'published'
                                ? 'bg-emerald-500/90 text-white'
                                : itemStatus === 'sold'
                                ? 'bg-amber-500/90 text-white'
                                : 'bg-gray-700/80 text-white'
                            }`}
                          >
                            {itemStatus === 'published'
                              ? isArabic
                                ? 'منشور'
                                : 'Published'
                              : itemStatus === 'sold'
                              ? isArabic
                                ? 'تم البيع'
                                : 'Sold'
                              : isArabic
                              ? 'مسودة'
                              : 'Draft'}
                          </span>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="space-y-1.5">
                        <h2 className="text-sm font-bold text-[#2C3C39] dark:text-zinc-100 line-clamp-1 group-hover:text-[#198341] transition-colors">
                          {itemTitle}
                        </h2>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-[#198341]">
                            {listing.price ? Number(listing.price).toLocaleString() : '—'}{' '}
                            {listing.currency || 'SYP'}
                          </span>

                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <MapPin size={11} />
                            <span>{[listing.governorate, listing.city].filter(Boolean).join(', ') || '—'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {/* View Details Link */}
                      <Link
                        href={detailHref}
                        className="flex-1 text-center py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-[#198341] hover:text-white text-gray-700 dark:text-zinc-200 text-xs font-bold transition-all shadow-sm"
                      >
                        {isArabic ? 'إدارة الإعلان' : 'Manage'}
                      </Link>

                      {/* Quick Stats */}
                      <Link
                        href={statsHref}
                        className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 transition-colors"
                        title={isArabic ? 'الإحصائيات' : 'Statistics'}
                      >
                        <BarChart3 size={16} />
                      </Link>

                      {/* Quick Edit */}
                      <Link
                        href={`/products/EditProduct/${listing.id}`}
                        className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors"
                        title={isArabic ? 'تعديل' : 'Edit'}
                      >
                        <Edit3 size={16} />
                      </Link>

                      {/* Quick Delete */}
                      <button
                        type="button"
                        onClick={() => setDeletingId(listing.id)}
                        className="p-2 rounded-xl border border-red-200 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                        title={isArabic ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {paginationMeta.totalPages > 1 && (
              <div className="pt-8 flex justify-center">
                <Pagination
                  currentPage={paginationMeta.currentPage}
                  totalPages={paginationMeta.totalPages}
                  hasNextPage={paginationMeta.hasNextPage}
                  hasPreviousPage={paginationMeta.hasPreviousPage}
                  totalItems={paginationMeta.totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  showItemsInfo={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600">
              {isArabic ? 'حذف الإعلان' : 'Delete Listing'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              {isArabic
                ? 'هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this listing? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl">
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteListingMutation.isPending}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleteListingMutation.isPending
                ? isArabic
                  ? 'جاري الحذف...'
                  : 'Deleting...'
                : isArabic
                ? 'حذف الإعلان'
                : 'Delete Listing'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
