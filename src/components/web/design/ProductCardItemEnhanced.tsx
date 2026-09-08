'use client';
import React, { useEffect, useState, useRef } from 'react';
import Text from '@/components/ui/text';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { CarCardItemPropsProfile } from '@/core/entities/types/homePageTypes';
import {
  AlertTriangle,
  Edit,
  HeartIcon,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  MoreVertical,
  ChevronDown,
  BarChart3,
  Eye,
  Phone,
  Share2,
  TrendingUp,
  Gauge,
  Calendar,
  MapPin,
} from 'lucide-react';
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
import { useLocale, useTranslations } from 'next-intl';
import clsx from 'clsx';
import { SaveStatus } from '@/core/entities/enums/cars.enums';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@radix-ui/react-dropdown-menu';

// Extended props interface to include the callback, favorite status and authentication
interface ExtendedCarCardItemPropsProfile extends CarCardItemPropsProfile {
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  isMarkedFavorite?: boolean;
  isAuthenticated?: boolean;
  userProdcut?: boolean;
  profile?: boolean;
  onDelete?: (productId: number) => void;
  isMine?: boolean;
  carStatus?: string;
  isFeatured?: boolean;
  saveStatus?: string;
  onStatusChange?: (productId: number, newStatus: string) => void;
  currency?: string;
  governorate?: string;
  city?: string;
  contactNumber?: string | null;
  rejectionReason?: string | null;
}

// Enhanced CardItem Component
export const EnhancedProductCardItem: React.FC<ExtendedCarCardItemPropsProfile> = ({
  title,
  marka,
  imageSrc,
  ProductId,
  slug,
  isFavorites,
  priceWord,
  price,
  type,
  onFavoriteToggle,
  isMarkedFavorite = false,
  isAuthenticated: isAuthenticatedProp,
  onDelete,
  profile,
  isMine = false,
  carStatus,
  isFeatured = false,
  saveStatus,
  onStatusChange,
  currency,
  governorate,
  city,
  contactNumber,
  rejectionReason,
  installmentsAvailable,
  minMonthlyInstallment,
}) => {
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(
    isAuthenticatedProp !== undefined ? isAuthenticatedProp : false,
  );
  const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStatisticsDialog, setShowStatisticsDialog] = useState(false);
  const authChecked = useRef(false);
  const [currentSaveStatus, setCurrentSaveStatus] = useState(saveStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const updateSaveStatusMutation = useUpdateSaveStatus();
  const deleteListingMutation = useDeleteListing();
  const { toast } = useToast();

  // Get locale and direction
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const t = useTranslations('common');

  // Fetch car statistics when modal is open
  const { data: carStatistics, isLoading: isLoadingStatistics, refetch: refetchStatistics } = useGetListingStatistics(
    Number(ProductId)
  );

  // Update currentSaveStatus when saveStatus prop changes
  useEffect(() => {
    setCurrentSaveStatus(saveStatus);
  }, [saveStatus]);

  // Refetch statistics when dialog opens
  useEffect(() => {
    if (showStatisticsDialog && profile && isMine) {
      refetchStatistics();
    }
  }, [showStatisticsDialog, profile, isMine, refetchStatistics]);

  // Only check authentication if it's not provided as a prop
  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticatedProp !== undefined) {
        return;
      }

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
    if (ProductId) {
      cacheListing({
        id: Number(ProductId),
        title: title || '',
        price: Number(price) || 0,
        listingOfferType: type || 'for_sale',
        makeName: marka || '',
        imageSrc: imageSrc || '',
        slug: slug || '',
      });
    }
  }, [ProductId, title, price, type, marka, imageSrc, slug]);

  // Update internal state when the favorite prop changes
  const prevFavoriteRef = useRef(isMarkedFavorite);
  useEffect(() => {
    if (prevFavoriteRef.current !== isMarkedFavorite) {
      setFavoriteStatus(isMarkedFavorite);
      prevFavoriteRef.current = isMarkedFavorite;
    }
  }, [isMarkedFavorite]);

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
    if (!isMine || !carStatus) return null;
    const status = carStatus.toLowerCase();
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
        className={clsx(config.className, 'font-medium border z-[99] relative')}
      >
        <IconComponent
          size={12}
          className={clsx(locale === 'ar' ? 'ml-1' : 'mr-1')}
        />
        {config.label}
      </Badge>
    );
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated && !isProcessing && ProductId) {
      setIsProcessing(true);

      try {
        const currentState = favoriteStatus;
        const newStatus = !currentState;
        setFavoriteStatus(newStatus);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(ProductId), newStatus);
        }

        const response = await toggleListingFavorite({
          listingId: Number(ProductId),
        });

        if (response.success) {
          let responseStatus: boolean;

          if (typeof response.data === 'boolean') {
            responseStatus = response.data;
          } else if (
            response.data &&
            typeof response.data === 'object'
          ) {
            const data = response.data as any;
            if ('isFavorited' in data) {
              responseStatus = data.isFavorited as boolean;
            } else if ('isFavorite' in data) {
              responseStatus = data.isFavorite as boolean;
            } else {
              responseStatus = newStatus;
            }
          } else {
            responseStatus = newStatus;
          }

          if (responseStatus !== newStatus) {
            setFavoriteStatus(responseStatus);

            if (onFavoriteToggle) {
              onFavoriteToggle(Number(ProductId), responseStatus);
            }
          }
        } else {
          setFavoriteStatus(currentState);

          if (onFavoriteToggle) {
            onFavoriteToggle(Number(ProductId), currentState);
          }
        }
      } catch (error) {
        setFavoriteStatus(isMarkedFavorite);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(ProductId), isMarkedFavorite);
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
    if (!ProductId) return;

    try {
      setIsDeleting(true);
      await deleteListingMutation.mutateAsync({ id: Number(ProductId) });
      setShowDeleteDialog(false);

      if (onDelete) {
        onDelete(Number(ProductId));
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

  // RTL-aware positioning classes
  const heartButtonClass = clsx(
    'absolute top-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-full shadow-md z-10',
    locale === 'ar' ? 'right-2' : 'left-2',
  );

  const typeTagClass = clsx(
    'absolute bottom-[190px] bg-white dark:bg-zinc-900 border dark:border-zinc-800 px-2 py-1 rounded-lg shadow-md text-primary text-sm font-medium',
    locale === 'ar' ? 'right-2' : 'left-2',
  );

  const featuredBadgeClass = clsx(
    'absolute top-2 z-20 bg-yellow-100 text-yellow-800 border-yellow-200',
    isMine && carStatus
      ? locale === 'ar'
        ? 'left-14'
        : 'right-14'
      : locale === 'ar'
      ? 'left-2'
      : 'right-2',
  );

  const iconMarginClass = clsx(locale === 'ar' ? 'ml-2' : 'mr-2');

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
                <CheckCircle size={14} className="text-gray-600" />
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
    if (!ProductId || isUpdatingStatus) return;

    const previousStatus = currentSaveStatus;

    try {
      setIsUpdatingStatus(true);
      setCurrentSaveStatus(newStatus);

      const response = await updateSaveStatusMutation.mutateAsync({
        id: Number(ProductId),
        dto: { saveStatus: newStatus },
      });

      if (response.success) {
        if (onStatusChange) {
          onStatusChange(Number(ProductId), newStatus);
        }

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
        setCurrentSaveStatus(previousStatus);
        
        toast({
          title: locale === 'ar' ? 'خطأ' : 'Error',
          description: locale === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status',
          variant: 'destructive',
        });
      }
    } catch (error) {
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

  return (
    <div className="w-full" dir={direction}>
      <Card
        className={`group border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 w-full shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <Badge variant="outline" className={featuredBadgeClass}>
            <Star
              size={10}
              className={clsx(locale === 'ar' ? 'ml-1' : 'mr-1')}
            />
            {t('featured')}
          </Badge>
        )}

        {/* Heart Icon for Favorites */}
        {isFavorites && (
          <Button
            className={heartButtonClass}
            onClick={handleFavoriteClick}
            disabled={!isAuthenticated || isProcessing}
            size="sm"
            variant="secondary"
          >
            <HeartIcon
              size={20}
              className={
                isProcessing
                  ? 'text-gray-400 animate-pulse'
                  : !isAuthenticated
                  ? 'text-gray-400'
                  : favoriteStatus
                  ? 'text-red-500'
                  : 'text-gray-600'
              }
              fill={favoriteStatus ? 'currentColor' : 'none'}
            />
          </Button>
        )}
        
        {isMine && getStatusBadge() && (
          <div
            className={clsx(
              'absolute top-3',
              isFavorites
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

        <Text className={typeTagClass}>
          {type === 'for_sale' ? t('sale') : t('rent')}
        </Text>

        {/* Save Status Badge */}
        {currentSaveStatus && (
          <div
            className={clsx(
              'absolute bottom-[170px] z-[100]',
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

        {/* Make the card content clickable */}
        <Link
          href={`/products/product/${slug || ProductId}${
            profile ? '?profile=true' : ''
          }`}
          className="block"
        >
          <CardHeader className="p-0">
            <CardTitle className="w-full">
              <div className="relative overflow-hidden rounded-t-xl">
                <Image
                  src={imageSrc}
                  alt={title}
                  width={300}
                  height={220}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </CardTitle>
            <CardDescription className="p-4 pb-2">
              <Text
                variant="h4"
                className="text-primary dark:text-zinc-100 font-bold line-clamp-1 mb-1 group-hover:text-primary-light transition-colors duration-300"
              >
                {title}
              </Text>
              
              <div className="flex justify-between items-center mb-2">
                <Text variant="mid" className="text-gray-600 dark:text-zinc-400 font-medium">
                  {marka}
                </Text>
                <div className="text-right rtl:text-left">
                  {price !== undefined && price !== null && (
                    <span className="text-primary font-bold text-sm block">
                      {price.toLocaleString()} {currency || 'USD'}
                    </span>
                  )}
                  {installmentsAvailable && minMonthlyInstallment && currentSaveStatus !== 'sold' && (
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      {locale === 'ar'
                        ? `ابتداءً من ${minMonthlyInstallment.toLocaleString()} ${currency || 'USD'}/شهرياً`
                        : `from ${minMonthlyInstallment.toLocaleString()} ${currency || 'USD'}/mo`}
                    </span>
                  )}
                </div>
              </div>

              {/* Location info */}
              {(governorate || city) && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
                  <MapPin size={12} className="flex-shrink-0" />
                  <span className="truncate">
                    {city ? `${city}, ` : ''}{governorate}
                  </span>
                </div>
              )}

              {/* Contact number */}
              {isMine && contactNumber && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
                  <Phone size={12} className="flex-shrink-0" />
                  <span dir="ltr" className="font-mono">{contactNumber}</span>
                </div>
              )}

              {/* Rejection Reason display if rejected */}
              {isMine && carStatus?.toLowerCase() === 'rejected' && rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-red-800 dark:text-red-300 text-xs flex items-start gap-1">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{locale === 'ar' ? 'سبب الرفض: ' : 'Rejection Reason: '}</span>
                    {rejectionReason}
                  </div>
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </Link>

        {/* Conditional Footer based on auth state */}
        {isFavorites ? (
          <Link
            href={`/products/product/${slug || ProductId}${
              profile ? '?profile=true' : ''
            }`}
          >
            <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 flex justify-between p-4 rounded-b-xl group-hover:from-primary-light group-hover:to-primary transition-all duration-300">
              <Text className="text-primary font-medium group-hover:text-white transition-colors duration-300">
                {priceWord}
              </Text>
              <Text className="text-primary-light font-bold text-lg group-hover:text-white transition-colors duration-300">
                {price.toString()}
              </Text>
            </CardFooter>
          </Link>
        ) : (
          <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 w-full flex flex-wrap gap-2 justify-between p-4 rounded-b-xl dark:border-t dark:border-zinc-800">
            {/* Statistics Button - Only for owner in profile view */}
            {profile && isMine && (
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 text-white rounded-lg flex-1 text-center shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleStatisticsClick}
              >
                <span className="flex items-center justify-center">
                  <BarChart3 className={iconMarginClass} size={16} />
                  {locale === 'ar' ? 'الإحصائيات' : 'Statistics'}
                </span>
              </Button>
            )}

            <Button
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 text-white rounded-lg flex-1 text-center shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className={`animate-spin ${
                      locale === 'ar' ? '-mr-1 ml-2' : '-ml-1 mr-2'
                    } h-4 w-4 text-white`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('deleting')}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Trash2 className={iconMarginClass} size={16} />
                  {t('delete')}
                </span>
              )}
            </Button>

            {/* Only show Edit button if user is authenticated */}
            {isAuthenticated && (
              <Link
                href={`/products/EditProduct/${ProductId}`}
                className="bg-primary hover:primary-light px-4 py-2 text-white rounded-lg flex-1 text-center flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Edit className={iconMarginClass} size={16} />
                {t('edit')}
              </Link>
            )}
          </CardFooter>
        )}
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
                    className={`${
                      locale === 'ar' ? 'mr-3' : 'ml-3'
                    } mt-2 text-sm`}
                  >
                    <h3 className="font-medium text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-gray-500 dark:text-zinc-400">{marka}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="bg-gray-50 dark:bg-zinc-950 px-6 py-4 rounded-b-lg border-t dark:border-zinc-800/80 flex flex-row-reverse sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className={`inline-flex justify-center rounded-md border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                locale === 'ar' ? 'sm:ml-3' : 'sm:mr-3'
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
                  <svg
                    className={`animate-spin h-4 w-4 text-white ${
                      locale === 'ar' ? 'ml-2 -mr-1' : 'mr-2 -ml-1'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('deleting')}
                </span>
              ) : (
                <span className="flex items-center">
                  <Trash2
                    className={`h-4 w-4 ${
                      locale === 'ar' ? 'ml-2 -mr-1' : 'mr-2 -ml-1'
                    }`}
                  />
                  {t('confirmDelete')}
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showStatisticsDialog} onOpenChange={setShowStatisticsDialog} >
        <DialogContent
          dir={direction}
          className="bg-white dark:bg-zinc-900 dark:border-zinc-800 rounded-lg max-w-3xl z-[999] max-h-[85vh] overflow-y-auto dark:text-zinc-200"
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
                            {title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-zinc-400">{marka}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className="bg-primary text-white border-none">
                              ID: {ProductId}
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
                                  <p className="text-sm font-medium text-gray-700 dark:text-white">
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
                          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border dark:border-zinc-800/50 rounded-lg p-3">
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
                          <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border dark:border-zinc-800/50 rounded-lg p-3">
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