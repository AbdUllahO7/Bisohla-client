'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  Edit3,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Map,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  useGetListingById,
  useChangePublicationStatus,
  useChangeMapVisibility,
  useDeleteListing,
} from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import { useToast } from '@/hooks/use-toast';

interface MyListingDetailPageProps {
  listingId: number;
}

export function MyListingDetailPage({ listingId }: MyListingDetailPageProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: listingRes, isLoading, isError, error } = useGetListingById(listingId);
  const changeStatusMutation = useChangePublicationStatus();
  const changeMapVisibilityMutation = useChangeMapVisibility();
  const deleteListingMutation = useDeleteListing();

  const listing = listingRes?.data;

  // Formatting helpers
  const title =
    (listing?.translations as any)?.[locale]?.title ||
    (listing?.translations as any)?.['ar']?.title ||
    listing?.title ||
    'Listing Details';

  const description =
    (listing?.translations as any)?.[locale]?.description ||
    (listing?.translations as any)?.['ar']?.description ||
    listing?.description ||
    '';

  const rawImages = listing?.images && listing.images.length > 0 ? listing.images : [];
  const images: { url: string }[] = rawImages.map((img: any) =>
    typeof img === 'string' ? { url: img } : { url: img.url || img.imageUrl }
  );
  if (images.length === 0 && listing?.primaryImage) {
    images.push({ url: listing.primaryImage });
  }

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'sold') => {
    try {
      const res = await changeStatusMutation.mutateAsync({
        id: listingId,
        publicationStatus: newStatus,
      });
      if (res.success) {
        toast({
          title: isArabic ? 'تم تحديث حالة الإعلان' : 'Status Updated',
          description: isArabic
            ? `تم تغيير الحالة إلى ${newStatus}`
            : `Listing status changed to ${newStatus}`,
        });
      } else {
        toast({
          title: isArabic ? 'خطأ' : 'Error',
          description: res.message || (isArabic ? 'فشل تغيير الحالة' : 'Failed to update status'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل تغيير الحالة' : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleMapVisibilityToggle = async (checked: boolean) => {
    try {
      const res = await changeMapVisibilityMutation.mutateAsync({
        id: listingId,
        showOnMap: checked,
      });
      if (res.success) {
        toast({
          title: checked
            ? isArabic
              ? 'تم تفعيل الظهور على الخريطة'
              : 'Visible on Map'
            : isArabic
            ? 'تم إخفاء الإعلان من الخريطة'
            : 'Hidden from Map',
        });
      }
    } catch {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل تحديث الظهور على الخريطة' : 'Failed to update map visibility',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteListingMutation.mutateAsync({ id: listingId });
      if (res.success) {
        toast({
          title: isArabic ? 'تم حذف الإعلان' : 'Listing Deleted',
        });
        router.push('/my-listings');
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
      setIsDeleteDialogOpen(false);
    }
  };

  const isDashboard = pathname.includes('/userProfile');
  const backHref = isDashboard ? '/userProfile/Products' : '/my-listings';
  const statsHref = isDashboard
    ? `/userProfile/Statistics/listing/${listingId}`
    : `/statistics/listing/${listingId}`;

  const breadcrumbItems = [
    ...(isDashboard ? [{ label: isArabic ? 'لوحة التحكم' : 'Dashboard', href: '/userProfile' }] : []),
    { label: isArabic ? 'إعلاناتي' : 'My Listings', href: backHref },
    { label: title },
  ];

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          <div className="h-8 bg-gray-100 dark:bg-zinc-800 rounded-xl w-48 animate-pulse" />
          <div className="h-[400px] bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    const isForbidden =
      (listingRes as any)?.status === 401 ||
      (error as any)?.status === 401;

    return (
      <div className="bg-background min-h-[60vh] pb-20 flex items-center justify-center px-4">
        <div className="text-center p-8 max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100 mb-2">
            {isForbidden
              ? (isArabic ? 'هذا الإعلان ليس ضمن حسابك' : "This listing isn't on your account")
              : (isArabic ? 'هذا الإعلان لم يعد موجوداً' : 'This listing no longer exists')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
            {isForbidden
              ? (isArabic
                  ? 'ربما يعود إلى حساب آخر. سجّل الدخول بالحساب الذي يملكه.'
                  : 'It may belong to another account. Sign in with the account that owns it.')
              : (isArabic ? 'ربما تم حذفه.' : 'It may have been deleted.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={backHref}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#198341] hover:bg-[#198341]/90 text-white font-bold text-sm transition-colors text-center"
            >
              {isArabic ? 'الانتقال إلى إعلاناتي' : 'Go to my listings'}
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-[#2C3C39] dark:text-zinc-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              {isArabic ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              {isArabic ? 'رجوع' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Publication status display styling
  const status = listing.publicationStatus || 'draft';
  const getStatusBadge = () => {
    switch (status) {
      case 'published':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {isArabic ? 'منشور' : 'Published'}
          </span>
        );
      case 'sold':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {isArabic ? 'تم البيع' : 'Sold'}
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
            {isArabic ? 'مسودة' : 'Draft'}
          </span>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* Top Header & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <span className="text-xs text-gray-400">ID: #{listing.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
              {title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Stats Button */}
            <Link
              href={statsHref}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-[#198341] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <BarChart3 size={16} />
              <span>{isArabic ? 'الإحصائيات' : 'Statistics'}</span>
            </Link>

            {/* Edit Button */}
            <Link
              href={`/products/EditProduct/${listing.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Edit3 size={16} />
              <span>{isArabic ? 'تعديل الإعلان' : 'Edit'}</span>
            </Link>

            {/* Delete Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-xl border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* Main Grid: Gallery on left/top, Details & Controls on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery & Description */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hero Image */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm overflow-hidden space-y-4">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
                {images.length > 0 ? (
                  <Image
                    src={images[activeImageIndex]?.url || images[0]?.url}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Layers size={48} />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-gray-700 dark:text-zinc-200 shadow-md"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-center text-gray-700 dark:text-zinc-200 shadow-md"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img: any, idx: number) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#198341] shadow-sm'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt={`Thumb ${idx}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  {isArabic ? 'الوصف' : 'Description'}
                </h2>
                <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Controls & Specs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Management Control Card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                {isArabic ? 'إدارة حالة الإعلان' : 'Publication & Visibility'}
              </h2>

              {/* Publication Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  {isArabic ? 'حالة النشر' : 'Publication Status'}
                </label>
                <Select
                  value={status}
                  onValueChange={(val: any) => handleStatusChange(val)}
                  disabled={changeStatusMutation.isPending}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800/80 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900">
                    <SelectItem value="published">{isArabic ? 'منشور (نشط)' : 'Published'}</SelectItem>
                    <SelectItem value="draft">{isArabic ? 'مسودة (مخفي)' : 'Draft'}</SelectItem>
                    <SelectItem value="sold">{isArabic ? 'تم البيع' : 'Sold'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Map Visibility Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Map size={14} className="text-[#198341]" />
                    <span>{isArabic ? 'الظهور على الخريطة' : 'Show on Map'}</span>
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {isArabic
                      ? 'عرض موقع الإعلان للزوار على خريطة بسهولة'
                      : 'Display listing pin on the public exploration map'}
                  </p>
                </div>
                <Switch
                  checked={listing.showOnMap ?? true}
                  onCheckedChange={handleMapVisibilityToggle}
                  disabled={changeMapVisibilityMutation.isPending}
                />
              </div>
            </div>

            {/* Price & Location Card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                {isArabic ? 'السعر والموقع' : 'Price & Location'}
              </h2>

              <div className="space-y-3 divide-y divide-gray-100 dark:divide-zinc-800 text-xs">
                {/* Price */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500">{isArabic ? 'السعر المطلوب' : 'Price'}</span>
                  <span className="text-base font-extrabold text-[#198341]">
                    {listing.price ? Number(listing.price).toLocaleString() : '—'}{' '}
                    {listing.currency || 'SYP'}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 flex items-center gap-1">
                    <MapPin size={13} />
                    <span>{isArabic ? 'المحافظة / المدينة' : 'Location'}</span>
                  </span>
                  <span className="font-bold text-gray-800 dark:text-zinc-200">
                    {[listing.governorate, listing.city].filter(Boolean).join(' - ') || '—'}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{isArabic ? 'تاريخ الإضافة' : 'Date Added'}</span>
                  </span>
                  <span className="font-semibold text-gray-600 dark:text-zinc-400">
                    {new Date(listing.createdAt).toLocaleDateString(locale)}
                  </span>
                </div>
              </div>
            </div>

            {/* Attributes specifications */}
            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  {isArabic ? 'المواصفات والخصائص' : 'Specifications'}
                </h2>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(listing.attributes).map(([key, val]: [string, any]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 space-y-0.5"
                    >
                      <span className="text-[10px] font-semibold uppercase text-gray-400 block truncate">
                        {key}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 truncate block">
                        {String(val?.name || val?.value || val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
