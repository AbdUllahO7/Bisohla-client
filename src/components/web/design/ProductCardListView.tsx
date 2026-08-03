'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
  HeartIcon,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  Car,
  Fuel,
  Gauge,
  AlertTriangle,
  Phone,
  User,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  MoreVertical,
  BarChart3,
  TrendingUp,
  Share2,
  Home,
} from 'lucide-react';
import { resolveAttributeValue } from '@/utils/listing-normalization';

import { useLocale, useTranslations } from 'next-intl';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { toggleFavorite as toggleListingFavorite, cacheListing } from '@/utils/offline-favorites-manager';
import {
  useUpdateSaveStatus,
} from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
import { useDeleteListing, useGetListingStatistics } from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { SaveStatus } from '@/core/entities/enums/cars.enums';
import { useToast } from '@/hooks/use-toast';

// Import your interfaces
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';

interface ProductCardListViewProps {
  carListing: SelectCarListingDto;
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  isMarkedFavorite?: boolean;
  isAuthenticated?: boolean;
  showFavorites?: boolean;
  profile?: boolean;
  onDelete?: (productId: number) => void;
  isMine?: boolean;
  onStatusChange?: (productId: number, newStatus: string) => void;
}

const TRANSLATION_KEYS: Record<string, Set<string>> = {
  fuel_type: new Set(['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid', 'gasoline_gas', 'petrol']),
  transmission: new Set(['automatic', 'manual', 'semi_automatic', 'cvt']),
  body_type: new Set(['suv', 'sedan', 'hatchback', 'coupe', 'grand_coupe', 'convertible', 'wagon', 'station_wagon', 'van', 'minivan', 'pickup', 'other']),
  condition: new Set(['new', 'used', 'certified_pre_owned'])
};

export const ProductCardListView: React.FC<ProductCardListViewProps> = ({
  carListing,
  onFavoriteToggle,
  isMarkedFavorite = false,
  isAuthenticated: isAuthenticatedProp,
  showFavorites = true,
  profile = false,
  onDelete,
  isMine = false,
  onStatusChange,
}) => {
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const t = useTranslations('common');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTwo');
  const { toast } = useToast();

  const getAttrIcon = (slug: string, defaultIcon: React.ReactNode) => {
    const av = (carListing as any).rawListing?.attributeValues?.find(
      (av: any) => av.attribute?.slug === slug
    );
    const iconUrl = av?.attribute?.iconUrl;
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={slug}
          className="h-3.5 w-3.5 object-contain"
        />
      );
    }
    return defaultIcon;
  };

  const footerDetails = useMemo(() => {
    const rawAttrValues = (carListing as any).rawListing?.attributeValues || [];

    if (rawAttrValues.length > 0) {
      return rawAttrValues
        .map((av: any) => {
          let value = resolveAttributeValue(av, locale);
          const iconUrl = av.attribute?.iconUrl;
          const slug = av.attribute?.slug;

          if (!value) {
            if (slug === 'make' && carListing.make?.name) value = carListing.make.name;
            else if (slug === 'model' && carListing.model?.name) value = carListing.model.name;
            else if (slug === 'trim' && carListing.trim?.name) value = carListing.trim.name;
          }

          // Translate slug values if they exist in the stepTwo translation namespace
          if (slug === 'fuel_type' || slug === 'transmission' || slug === 'body_type' || slug === 'condition') {
            const keys = TRANSLATION_KEYS[slug];
            const lowerVal = value?.toLowerCase();
            if (keys && keys.has(lowerVal)) {
              try {
                const translationKey = slug === 'fuel_type' 
                  ? `fuelType.${lowerVal === 'petrol' ? 'gasoline' : lowerVal}` 
                  : slug === 'transmission' 
                  ? `transmission.${lowerVal}` 
                  : slug === 'body_type' 
                  ? `bodyType.${lowerVal}` 
                  : `vehicleCondition.${lowerVal}`;
                value = bodyTypeT(translationKey);
              } catch (e) {
                // Fall back to resolved value
              }
            }
          }

          let defaultIcon = <Home size={14} />;
          if (slug === 'fuel_type') defaultIcon = <Fuel size={14} />;
          else if (slug === 'transmission') defaultIcon = <Car size={14} />;
          else if (slug === 'year') defaultIcon = <Calendar size={14} />;
          else if (slug === 'mileage') defaultIcon = <Gauge size={14} />;
          else if (slug === 'rooms_count' || slug === 'rooms' || slug === 'bedrooms') defaultIcon = <Home size={14} />;
          else if (slug === 'area' || slug === 'square_meters') defaultIcon = <Home size={14} />;

          const icon = iconUrl ? (
            <img
              src={iconUrl}
              alt={slug}
              className="h-3.5 w-3.5 object-contain"
            />
          ) : (
            defaultIcon
          );

          let displayValue = value;
          if (slug === 'mileage' && value) {
            const num = parseFloat(value);
            displayValue = `${isNaN(num) ? value : num.toLocaleString()} ${t('km')}`;
          }

          return {
            slug,
            icon,
            value: displayValue,
            type: av.attribute?.type,
          };
        })
        .filter((item: any) => {
          return (
            item.value &&
            !item.slug.startsWith('features_') &&
            item.slug !== 'damages' &&
            item.slug !== 'damage' &&
            item.type !== 'repeating_group'
          );
        });
    }

    const fallback = [];
    if (carListing.details?.year) {
      fallback.push({
        slug: 'year',
        icon: <Calendar size={14} />,
        value: carListing.details.year.toString(),
      });
    }
    if (carListing.details?.mileage) {
      fallback.push({
        slug: 'mileage',
        icon: <Gauge size={14} />,
        value: `${carListing.details.mileage.toLocaleString()} ${t('km')}`,
      });
    }
    if (carListing.details?.fuelType) {
      fallback.push({
        slug: 'fuel_type',
        icon: <Fuel size={14} />,
        value: carListing.details.fuelType,
      });
    }
    if (carListing.details?.transmission) {
      fallback.push({
        slug: 'transmission',
        icon: <Car size={14} />,
        value: carListing.details.transmission,
      });
    }
    return fallback;
  }, [carListing, locale, t, bodyTypeT]);

  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(
    isAuthenticatedProp !== undefined ? isAuthenticatedProp : false,
  );
  const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSaveStatus, setCurrentSaveStatus] = useState(carListing.saveStatus || carListing.publicationStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatisticsDialog, setShowStatisticsDialog] = useState(false);
  const authChecked = useRef(false);

  const deleteListingMutation = useDeleteListing();
  const updateSaveStatusMutation = useUpdateSaveStatus();

  // Fetch car statistics when modal is open
  const { data: carStatistics, isLoading: isLoadingStatistics, refetch: refetchStatistics } = useGetListingStatistics(
    Number(carListing.id)
  );

  // Update currentSaveStatus when carListing.saveStatus or carListing.publicationStatus changes
  useEffect(() => {
    setCurrentSaveStatus(carListing.saveStatus || carListing.publicationStatus);
  }, [carListing.saveStatus, carListing.publicationStatus]);

  // Authentication check
  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticatedProp !== undefined) return;

      if (!authChecked.current) {
        try {
          const authResponse = await checkAuth();
          setIsAuthenticated(authResponse.success);
          authChecked.current = true;
        } catch (error) {
          console.error('Auth check failed:', error);
          setIsAuthenticated(false);
          authChecked.current = true;
        }
      }
    };

    verifyAuth();
  }, [isAuthenticatedProp]);

  // Update authentication status if prop changes
  useEffect(() => {
    if (isAuthenticatedProp !== undefined) {
      setIsAuthenticated(isAuthenticatedProp);
    }
  }, [isAuthenticatedProp]);

  // Cache listing details for offline favorites lookup
  useEffect(() => {
    if (carListing.id) {
      cacheListing({
        id: Number(carListing.id),
        title: carListing.title || '',
        price: Number(carListing.price) || 0,
        listingOfferType: carListing.listingType || carListing.listingOfferType || 'for_sale',
        makeName: carListing.make?.name || '',
        imageSrc: getPrimaryImage(),
        slug: carListing.slug || '',
      });
    }
  }, [carListing.id, carListing.title, carListing.price, carListing.listingType, carListing.listingOfferType, carListing.make?.name, carListing.slug]);

  // Update favorite status
  const prevFavoriteRef = useRef(isMarkedFavorite);
  useEffect(() => {
    if (prevFavoriteRef.current !== isMarkedFavorite) {
      setFavoriteStatus(isMarkedFavorite);
      prevFavoriteRef.current = isMarkedFavorite;
    }
  }, [isMarkedFavorite]);

  // Refetch statistics when dialog opens
  useEffect(() => {
    if (showStatisticsDialog && profile && isMine) {
      refetchStatistics();
    }
  }, [showStatisticsDialog, profile, isMine, refetchStatistics]);

  // Helper functions
  const getPrimaryImage = () => {
    // Priority 1: Direct primaryImage field
    if (carListing.primaryImage) return carListing.primaryImage;
    
    // Priority 2: images array
    if (!carListing.images?.length) return '/placeholder-car.jpg';

    const primaryImage = carListing.images.find((img) => img.isPrimary);
    return (
      primaryImage?.url || carListing.images[0]?.url || '/placeholder-car.jpg'
    );
  };

  const formatPrice = () => {
    if (!carListing.price) return t('priceOnRequest');

    const formatter = new Intl.NumberFormat(
      locale === 'ar' ? 'ar-SA' : 'en-US',
      {
        style: 'currency',
        currency: carListing.currency || 'SYP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      },
    );

    return formatter.format(carListing.price);
  };

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: locale === 'ar' ? ar : enUS,
      });
    } catch {
      return '';
    }
  };

  const getListingTypeLabel = () => {
    const type = String(carListing.listingType || carListing.listingOfferType || '').toLowerCase();
    return type === 'for_sale' ? t('forSale') : t('forRent');
  };

  const getListingTypeColor = () => {
    const type = String(carListing.listingType || carListing.listingOfferType || '').toLowerCase();
    return type === 'for_sale'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  // Format statistics for display
  const formatStatistics = () => {
    if (!carStatistics?.data) return null;
    const stats = carStatistics.data.statics || carStatistics.data;
    const formatDateValue = (dateString: string | null) => {
      if (!dateString) return locale === 'ar' ? 'غير متوفر' : 'N/A';
      try {
        return new Date(dateString).toLocaleDateString(
          locale === 'ar' ? 'ar-SA' : 'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        );
      } catch {
        return locale === 'ar' ? 'غير متوفر' : 'N/A';
      }
    };

    const formatDuration = (seconds: number | null) => {
      if (!seconds) return '0';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (minutes > 0) {
        return locale === 'ar'
          ? `${minutes} دقيقة ${remainingSeconds} ثانية`
          : `${minutes}m ${remainingSeconds}s`;
      }
      return locale === 'ar' ? `${seconds} ثانية` : `${seconds}s`;
    };

    return [
      {
        label: locale === 'ar' ? 'عدد المشاهدات' : 'Views Count',
        value: stats.viewsCount?.toLocaleString() || '0',
        icon: Eye,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        borderColor: 'border-blue-200 dark:border-blue-900/50',
      },
      {
        label: locale === 'ar' ? 'عدد جهات الاتصال' : 'Contact Count',
        value: stats.contactCount?.toLocaleString() || '0',
        icon: Phone,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-900/50',
      },
      {
        label: locale === 'ar' ? 'عدد المفضلة' : 'Favorites Count',
        value: stats.favoritesCount?.toLocaleString() || '0',
        icon: HeartIcon,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-900/50',
      },
      {
        label: locale === 'ar' ? 'عدد المشاركات' : 'Shares Count',
        value: stats.sharesCount?.toLocaleString() || '0',
        icon: Share2,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        borderColor: 'border-purple-200 dark:border-purple-900/50',
      },
      {
        label: locale === 'ar' ? 'مدة المشاهدة' : 'View Duration',
        value: formatDuration(stats.viewDuration),
        icon: Clock,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        borderColor: 'border-orange-200 dark:border-orange-900/50',
      },
      {
        label: locale === 'ar' ? 'عدد التفاصيل المعروضة' : 'Details Viewed',
        value: stats.detailsViewedCount?.toLocaleString() || '0',
        icon: TrendingUp,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
        borderColor: 'border-indigo-200 dark:border-indigo-900/50',
      },
      {
        label: locale === 'ar' ? 'آخر مشاهدة' : 'Last Viewed',
        value: formatDateValue(stats.lastViewedAt),
        icon: Calendar,
        color: 'text-gray-600 dark:text-zinc-300',
        bgColor: 'bg-gray-50 dark:bg-zinc-800/50',
        borderColor: 'border-gray-200 dark:border-zinc-700',
        fullWidth: true,
      },
    ];
  };

  // Get status badge configuration
  const getStatusBadge = () => {
    if (!isMine || !carListing.status) return null;

    const status = carListing.status.toLowerCase();
    const statusConfig = {
      approved: {
        label: locale === 'ar' ? 'نشط' : 'Active',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
      pending: {
        label: locale === 'ar' ? 'قيد المراجعة' : 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      },
      rejected: {
        label: locale === 'ar' ? 'مرفوض' : 'Rejected',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Badge
        variant="outline"
        className={clsx(config.className, 'font-medium border')}
      >
        <IconComponent
          size={12}
          className={clsx(locale === 'ar' ? 'ml-1' : 'mr-1')}
        />
        {config.label}
      </Badge>
    );
  };

  // Redesigned Save Status Badge with Dropdown
  const getSaveStatusBadge = () => {
    if (!currentSaveStatus) return null;

    const saveStatusLower = currentSaveStatus.toLowerCase();
    const saveStatusConfig = {
      published: {
        label: locale === 'ar' ? 'منشور' : 'Published',
        className: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-300 hover:from-green-100 hover:to-green-200',
        icon: CheckCircle,
      },
      draft: {
        label: locale === 'ar' ? 'مسودة' : 'Draft',
        className: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-300 hover:from-gray-100 hover:to-gray-200',
        icon: Clock,
      },
      sold: {
        label: locale === 'ar' ? 'مباع' : 'Sold',
        className: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-300 hover:from-blue-100 hover:to-blue-200',
        icon: CheckCircle,
      },
    };

    const config =
      saveStatusConfig[saveStatusLower as keyof typeof saveStatusConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    // If it's the user's own listing, make it a dropdown
    if (isMine) {
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 shadow-sm',
                config.className,
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                isUpdatingStatus && 'opacity-60 cursor-not-allowed'
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={isUpdatingStatus}
            >
              <IconComponent size={14} className="flex-shrink-0" />
              <span>{config.label}</span>
              <ChevronDown size={14} className="flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={locale === 'ar' ? 'end' : 'start'}
            className="z-[102] bg-white dark:bg-zinc-900 rounded-lg shadow-xl border-2 border-gray-200 dark:border-zinc-800 p-1 min-w-[180px]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveStatusChange(SaveStatus.PUBLISHED);
              }}
              disabled={currentSaveStatus === SaveStatus.PUBLISHED || isUpdatingStatus}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors',
                currentSaveStatus === SaveStatus.PUBLISHED
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400 cursor-default'
                  : 'hover:bg-green-50 dark:hover:bg-green-950/20 text-gray-700 dark:text-zinc-300 hover:text-green-800 dark:hover:text-green-400',
                'focus:outline-none focus:bg-green-50 dark:focus:bg-green-950/20'
              )}
            >
              <CheckCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">{locale === 'ar' ? 'منشور' : 'Published'}</span>
              {currentSaveStatus === SaveStatus.PUBLISHED && (
                <CheckCircle size={14} className="text-green-600" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveStatusChange(SaveStatus.DRAFT);
              }}
              disabled={currentSaveStatus === SaveStatus.DRAFT || isUpdatingStatus}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors',
                currentSaveStatus === SaveStatus.DRAFT
                  ? 'bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 cursor-default'
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white',
                'focus:outline-none focus:bg-gray-50 dark:focus:bg-zinc-800'
              )}
            >
              <Clock size={16} className="flex-shrink-0" />
              <span className="flex-1">{locale === 'ar' ? 'مسودة' : 'Draft'}</span>
              {currentSaveStatus === SaveStatus.DRAFT && (
                <CheckCircle size={14} className="text-gray-605" />
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 h-px bg-gray-200 dark:bg-zinc-800" />

            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveStatusChange(SaveStatus.SOLD);
              }}
              disabled={currentSaveStatus === SaveStatus.SOLD || isUpdatingStatus}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors',
                currentSaveStatus === SaveStatus.SOLD
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 cursor-default'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-700 dark:text-zinc-300 hover:text-blue-800 dark:hover:text-blue-400',
                'focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-950/20'
              )}
            >
              <CheckCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">{locale === 'ar' ? 'مباع' : 'Sold'}</span>
              {currentSaveStatus === SaveStatus.SOLD && (
                <CheckCircle size={14} className="text-blue-600" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // For non-owner view, just show the badge
    return (
      <Badge
        variant="outline"
        className={clsx(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm',
          config.className
        )}
      >
        <IconComponent size={14} />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const handleSaveStatusChange = async (newStatus: SaveStatus) => {
    if (!carListing.id || isUpdatingStatus) return;

    // Store previous status for rollback
    const previousStatus = currentSaveStatus;

    try {
      setIsUpdatingStatus(true);

      // Optimistically update the UI
      setCurrentSaveStatus(newStatus);

      const response = await updateSaveStatusMutation.mutateAsync({
        id: Number(carListing.id),
        dto: { saveStatus: newStatus },
      });

      if (response.success) {
        // Notify parent component of the status change
        if (onStatusChange) {
          onStatusChange(Number(carListing.id), newStatus);
        }

        // Show success toast
        const messages = {
          [SaveStatus.PUBLISHED]: locale === 'ar' ? 'تم النشر بنجاح' : 'Published successfully',
          [SaveStatus.DRAFT]: locale === 'ar' ? 'تم الحفظ كمسودة' : 'Saved as draft',
          [SaveStatus.SOLD]: locale === 'ar' ? 'تم وضع علامة كمباع' : 'Marked as sold',
        };

        toast({
          title: locale === 'ar' ? 'نجح التحديث' : 'Status Updated',
          description: messages[newStatus as keyof typeof messages],
          variant: 'default',
        });
      } else {
        // Revert on failure
        setCurrentSaveStatus(previousStatus);

        toast({
          title: locale === 'ar' ? 'خطأ' : 'Error',
          description: locale === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // Revert on error
      setCurrentSaveStatus(previousStatus);
      console.error('Failed to update save status:', error);

      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'حدث خطأ أثناء تحديث الحالة' : 'An error occurred while updating status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Event handlers
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated && !isProcessing && carListing.id) {
      setIsProcessing(true);

      try {
        const currentState = favoriteStatus;
        const newStatus = !currentState;
        setFavoriteStatus(newStatus);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(carListing.id), newStatus);
        }

        const response = await toggleListingFavorite({
          listingId: Number(carListing.id),
        });

        if (response.success) {
          let responseStatus: boolean;

          if (typeof response.data === 'boolean') {
            responseStatus = response.data;
          } else if (
            response.data &&
            typeof response.data === 'object' &&
            'isFavorite' in response.data
          ) {
            responseStatus = response.data.isFavorite as boolean;
          } else {
            responseStatus = newStatus;
          }

          if (responseStatus !== newStatus) {
            setFavoriteStatus(responseStatus);
            if (onFavoriteToggle) {
              onFavoriteToggle(Number(carListing.id), responseStatus);
            }
          }
        } else {
          setFavoriteStatus(currentState);
          if (onFavoriteToggle) {
            onFavoriteToggle(Number(carListing.id), currentState);
          }
        }
      } catch (error) {
        setFavoriteStatus(isMarkedFavorite);
        if (onFavoriteToggle) {
          onFavoriteToggle(Number(carListing.id), isMarkedFavorite);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!carListing.id) return;

    try {
      setIsDeleting(true);
      await deleteListingMutation.mutateAsync({ id: Number(carListing.id) });
      setShowDeleteDialog(false);

      if (onDelete) {
        onDelete(Number(carListing.id));
      }
    } catch (error) {
      console.error('Failed to delete car listing:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleStatisticsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowStatisticsDialog(true);
  };

  // CSS classes
  const maxVisibleAttributes = 5;
  const visibleDetails = footerDetails.slice(0, maxVisibleAttributes);
  const remainingCount = footerDetails.length - maxVisibleAttributes;

  const cardClass = clsx(
    'group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden',
    direction === 'rtl' ? 'text-right' : 'text-left',
  );

  const imageContainerClass = clsx(
    'relative overflow-hidden bg-gray-100 dark:bg-zinc-800',
    'w-full sm:w-48 md:w-56 lg:w-64 h-48 sm:h-full',
  );

  const contentClass = clsx('flex-1 p-4 sm:p-6 min-w-0');

  const actionButtonClass = clsx(
    'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    locale === 'ar' ? 'flex-row-reverse' : 'flex-row',
  );

  return (
    <div className="w-full" dir={direction}>
      <Card className={cardClass}>
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section */}
          <div className={imageContainerClass}>
            <div className="relative w-full h-[260px]">
              <Link
                prefetch={false}
                href={`/products/product/${carListing.id}${profile && isMine ? '?profile=true' : ''
                  }`}
              >
                <Image
                  src={getPrimaryImage()}
                  alt={carListing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                />
              </Link>
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Favorite Button */}
            {showFavorites && (
              <Button
                size="sm"
                variant="secondary"
                className={clsx(
                  'absolute top-3 bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-850 dark:text-zinc-200 dark:border-zinc-800 border shadow-lg',
                  locale === 'ar' ? 'right-3' : 'left-3',
                )}
                onClick={handleFavoriteClick}
                disabled={!isAuthenticated || isProcessing}
              >
                <HeartIcon
                  size={16}
                  className={clsx(
                    isProcessing
                      ? 'text-gray-400 animate-pulse'
                      : !isAuthenticated
                        ? 'text-gray-400'
                        : favoriteStatus
                          ? 'text-red-500'
                          : 'text-gray-600',
                  )}
                  fill={favoriteStatus ? 'currentColor' : 'none'}
                />
              </Button>
            )}

            {/* Status Badge - Only for user's own listings */}
            {isMine && getStatusBadge() && (
              <div
                className={clsx(
                  'absolute top-3',
                  showFavorites
                    ? locale === 'ar'
                      ? 'left-3'
                      : 'right-3'
                    : locale === 'ar'
                      ? 'right-3'
                      : 'left-3',
                )}
              >
                {getStatusBadge()}
              </div>
            )}

            {/* Listing Type Badge */}
            <Badge
              className={clsx(
                'absolute bottom-3 font-medium hover:bg-primary hover:text-white transition-colors',
                locale === 'ar' ? 'right-3' : 'left-3',
                getListingTypeColor(),
              )}
            >
              {getListingTypeLabel()}
            </Badge>

            {/* Save Status Badge - Redesigned */}
            {currentSaveStatus && (
              <div
                className={clsx(
                  'absolute bottom-3 z-[100]',
                  locale === 'ar' ? 'left-3' : 'right-3',
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {getSaveStatusBadge()}
              </div>
            )}

            {/* Featured Badge */}
            {carListing.isFeatured && (
              <Badge
                className={clsx(
                  'absolute top-12 bg-yellow-100 text-yellow-800',
                  locale === 'ar' ? 'right-3' : 'left-3',
                )}
              >
                <Star
                  size={12}
                  className={clsx(locale === 'ar' ? 'ml-1' : 'mr-1')}
                />
                {t('featured')}
              </Badge>
            )}
          </div>

          {/* Content Section */}
          <CardContent className={contentClass}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex-1">
                <Link
                  prefetch={false}
                  href={`/products/product/${carListing.id}${profile ? '?profile=true' : ''
                    }`}
                >
                  <div className="mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {carListing.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                      {carListing.listingTypeId === 1 || carListing.listingTypeId === 3 || carListing.listingTypeId === undefined 
                        ? (carListing.make?.name && carListing.make?.name !== 'Unknown' ? `${carListing.make.name} ${carListing.model?.name || ''}` : '')
                        : (`${carListing.city}, ${carListing.governorate}`)
                      }
                    </p>
                  </div>
                </Link>

                {/* Status Badge in content area for better visibility on mobile */}
                {isMine && getStatusBadge() && (
                  <div className="mb-3 sm:hidden">{getStatusBadge()}</div>
                )}

                {/* Save Status Badge in content area for mobile */}
                {currentSaveStatus && (
                  <div className="mb-3 sm:hidden">{getSaveStatusBadge()}</div>
                )}

                {/* Rejection Reason display if rejected */}
                {isMine && carListing.status?.toLowerCase() === 'rejected' && carListing.rejectionReason && (
                  <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-red-800 dark:text-red-300 text-xs flex items-start gap-1.5 max-w-xl">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <span className="font-semibold">{locale === 'ar' ? 'سبب الرفض: ' : 'Rejection Reason: '}</span>
                      {carListing.rejectionReason}
                    </div>
                  </div>
                )}

                 {/* Vehicle Details */}
                {visibleDetails.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 text-sm">
                    {visibleDetails.map((detail: { icon: React.ReactNode; value: string }, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
                        {detail.icon}
                        <span>{detail.value}</span>
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold col-span-1">
                        <span>{locale === 'ar' ? `المزيد +${remainingCount}` : `more +${remainingCount}`}</span>
                      </div>
                    )}
                  </div>
                )}


                {/* Location and Date */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-zinc-400 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>
                      {carListing.city}, {carListing.governorate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(carListing.createdAt)}</span>
                  </div>

                  {isMine && carListing.contactNumber && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <span>{carListing.contactNumber}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {carListing.description && (
                  <p className="text-sm text-gray-600 dark:text-zinc-350 line-clamp-2 mb-4">
                    {carListing.description}
                  </p>
                )}

                {/* Damage Info */}
                {carListing.damages && carListing.damages.length > 0 && (
                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20"
                    >
                      <AlertTriangle
                        size={12}
                        className={clsx(locale === 'ar' ? 'ml-1' : 'mr-1')}
                      />
                      {carListing.damages.length} {t('damageReported')}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatPrice()}
                  </span>
                  {carListing.listingType === 'for_rent' &&
                    carListing.rentType && (
                      <span className="text-sm text-gray-500 dark:text-zinc-400">
                        / {carListing.rentType}
                      </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {/* Statistics Button - Only for owner in profile view */}
                  {profile && isMine && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`${actionButtonClass} text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30`}
                      onClick={handleStatisticsClick}
                    >
                      <BarChart3 size={14} />
                      {locale === 'ar' ? 'الإحصائيات' : 'Statistics'}
                    </Button>
                  )}

                  {/* Contact Button */}
                  {carListing.contactNumber && !isMine && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={actionButtonClass}
                    >
                      <Phone size={14} />
                      {t('contact')}
                    </Button>
                  )}

                  {/* Profile-specific buttons */}
                  {profile && (
                    <>
                      {isMine && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`${actionButtonClass} text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30`}
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                              {t('deleting')}
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              {t('delete')}
                            </>
                          )}
                        </Button>
                      )}

                      {isAuthenticated && isMine && (
                        <Button size="sm" className={actionButtonClass} asChild>
                          <Link href={`/products/EditProduct/${carListing.id}`}>
                            <Edit size={14} />
                            {t('edit')}
                          </Link>
                        </Button>
                      )}
                    </>
                  )}

                  {/* View Details Button */}
                  <Button size="sm" className={actionButtonClass} asChild>
                    <Link
                      prefetch={false}
                      href={`/products/product/${carListing.id}${profile && isMine ? '?profile=true' : ''
                        }`}
                    >
                      <Eye size={14} />
                      {t('viewDetails')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          dir={direction}
          className="bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-lg p-0 max-w-md shadow-xl"
        >
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-t-lg border-b border-red-100 dark:border-red-900/50">
            <AlertDialogHeader>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className="h-6 w-6 text-red-500 dark:text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className={`${locale === 'ar' ? 'mr-3' : 'ml-3'}`}>
                  <AlertDialogTitle className="text-lg font-medium text-red-800 dark:text-red-400">
                    {t('deleteConfirmation')}
                  </AlertDialogTitle>
                </div>
              </div>
            </AlertDialogHeader>
          </div>

          <div className="p-6">
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-white">
              {t('deleteWarning')}
            </AlertDialogDescription>

            <div className="mt-2">
              <div className="rounded-md bg-gray-50 dark:bg-zinc-950 border dark:border-zinc-800 p-4">
                <div className="flex">
                  <div
                    className={`${locale === 'ar' ? 'mr-3' : 'ml-3'
                      } mt-2 text-sm`}
                  >
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      {carListing.title}
                    </h3>
                    <p className="text-gray-500 dark:text-zinc-400">
                      {carListing.make?.name} {carListing.model?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="bg-gray-50 dark:bg-zinc-950 px-6 py-4 rounded-b-lg border-t dark:border-zinc-800/80 flex flex-row-reverse sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className={`inline-flex justify-center rounded-md border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-350 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${locale === 'ar' ? 'sm:ml-3' : 'sm:mr-3'
                } w-full sm:w-auto`}
            >
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <div
                    className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${locale === 'ar' ? 'ml-2' : 'mr-2'
                      }`}
                  />
                  {t('deleting')}
                </span>
              ) : (
                <span className="flex items-center">
                  <Trash2
                    className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                  />
                  {t('confirmDelete')}
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showStatisticsDialog} onOpenChange={setShowStatisticsDialog}>
        <DialogContent
          className="bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-lg max-w-2xl max-h-[85vh] overflow-y-auto dark:text-zinc-200"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <BarChart3 className="text-primary" size={28} />
              </div>
              <span>{locale === 'ar' ? 'إحصائيات الإعلان' : 'Listing Statistics'}</span>
            </DialogTitle>

          </DialogHeader>

          <div className="mt-6">
            {isLoadingStatistics ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4" />
                <p className="text-gray-505 dark:text-zinc-400">
                  {locale === 'ar' ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}
                </p>
              </div>
            ) : (carStatistics?.data?.statics || carStatistics?.data) ? (
              (() => {
                const statsObj = carStatistics.data.statics || carStatistics.data;
                return (
                  <div className="space-y-6">
                    {/* Car Info Header */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20 rounded-xl p-5 border-2 border-primary/20 dark:border-primary/40">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                            {carListing.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-zinc-400">
                            {carListing.make?.name} {carListing.model?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className="bg-primary text-white border-none">
                              ID: {carListing.id}
                            </Badge>
                            {getStatusBadge()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formatStatistics()?.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                          <div
                            key={index}
                            className={clsx(
                              'rounded-xl p-5 border-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
                              stat.bgColor,
                              stat.borderColor,
                              stat.fullWidth && 'md:col-span-2'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={clsx('p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 shadow-sm', stat.color)}>
                                    <IconComponent size={20} strokeWidth={2.5} />
                                  </div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-zinc-350">
                                    {stat.label}
                                  </p>
                                </div>
                                <p className={clsx('text-3xl font-bold', stat.color)}>
                                  {stat.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Additional Info Section */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-900 rounded-xl p-5 border border-gray-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="text-gray-600 dark:text-zinc-300" size={20} />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {locale === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {statsObj.createdAt && (
                          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border dark:border-zinc-850 rounded-lg p-3">
                            <span className="text-gray-600 dark:text-zinc-400">
                              {locale === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(statsObj.createdAt).toLocaleDateString(
                                locale === 'ar' ? 'ar-SA' : 'en-US'
                              )}
                            </span>
                          </div>
                        )}
                        {statsObj.updatedAt && (
                          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border dark:border-zinc-850 rounded-lg p-3">
                            <span className="text-gray-600 dark:text-zinc-400">
                              {locale === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(statsObj.updatedAt).toLocaleDateString(
                                locale === 'ar' ? 'ar-SA' : 'en-US'
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <TrendingUp size={16} className="flex-shrink-0 mt-0.5" />
                        <span>
                          {locale === 'ar'
                            ? 'يتم تحديث الإحصائيات بشكل دوري. قد يستغرق ظهور البيانات الجديدة بعض الوقت.'
                            : 'Statistics are updated periodically. New data may take some time to appear.'}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertTriangle className="text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-center">
                  {locale === 'ar'
                    ? 'لا توجد إحصائيات متاحة لهذا الإعلان'
                    : 'No statistics available for this listing'}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};