'use client';
import React, { useEffect, useState, useRef } from 'react';
import Text from '@/components/text/text';
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
import { CarCardItemPropsProfile } from '@/types/homePageTypes';
import {
  AlertTriangle,
  Edit,
  HeartIcon,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Star,
} from 'lucide-react';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { toggleCarListingFavorite } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { useDeleteCarListing } from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
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
import { useLocale, useTranslations } from 'next-intl';
import clsx from 'clsx';

// Extended props interface to include the callback, favorite status and authentication
interface ExtendedCarCardItemPropsProfile extends CarCardItemPropsProfile {
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  isMarkedFavorite?: boolean;
  isAuthenticated?: boolean;
  userProdcut?: boolean;
  profile?: boolean;
  onDelete?: (productId: number) => void;
  isMine?: boolean;
  status?: string; // Add status prop
  isFeatured?: boolean; // Add featured prop
}

// Enhanced CardItem Component
export const EnhancedProductCardItem: React.FC<
  ExtendedCarCardItemPropsProfile
> = ({
  title,
  marka,
  imageSrc,
  ProductId,
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
  status,
  isFeatured = false,
}) => {
  // Use the auth prop if provided, otherwise start with undefined and check later
  const [isAuthenticated, setIsAuthenticated] = useState(
    isAuthenticatedProp !== undefined ? isAuthenticatedProp : false,
  );
  const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const authChecked = useRef(false);

  // Get locale and direction
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  // Get translations
  const t = useTranslations('common');

  // Use the delete mutation hook
  const deleteCarListingMutation = useDeleteCarListing();

  // Only check authentication if it's not provided as a prop
  useEffect(() => {
    const verifyAuth = async () => {
      // Skip auth check if prop is provided
      if (isAuthenticatedProp !== undefined) {
        return;
      }

      // Only check auth once
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

  // Update internal state when the favorite prop changes
  // Use a ref to track previous value to avoid unnecessary updates
  const prevFavoriteRef = useRef(isMarkedFavorite);
  useEffect(() => {
    if (prevFavoriteRef.current !== isMarkedFavorite) {
      setFavoriteStatus(isMarkedFavorite);
      prevFavoriteRef.current = isMarkedFavorite;
    }
  }, [isMarkedFavorite]);

  // Get status badge configuration
  const getStatusBadge = () => {
    if (!isMine || !status) return null;

    const statusLower = status.toLowerCase();
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

    const config = statusConfig[statusLower as keyof typeof statusConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Badge
        variant="outline"
        className={clsx(config.className, 'font-medium border text-xs')}
      >
        <IconComponent
          size={10}
          className={clsx(locale === 'ar' ? 'ml-1' : 'mr-1')}
        />
        {config.label}
      </Badge>
    );
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link navigation
    e.stopPropagation(); // Stop the event from bubbling up

    // Only allow favorite action if authenticated
    if (isAuthenticated && !isProcessing && ProductId) {
      setIsProcessing(true);

      try {
        // Store current state for comparison/reversion
        const currentState = favoriteStatus;

        // Optimistically update UI
        const newStatus = !currentState;
        setFavoriteStatus(newStatus);

        // Notify parent component
        if (onFavoriteToggle) {
          onFavoriteToggle(Number(ProductId), newStatus);
        }

        // Call API
        const response = await toggleCarListingFavorite({
          carListingId: Number(ProductId),
        });

        // Handle API response
        if (response.success) {
          // Determine the actual status from API
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
            // If response format is unexpected, keep optimistic update
            responseStatus = newStatus;
          }

          // If API returned something different than our optimistic update
          if (responseStatus !== newStatus) {
            setFavoriteStatus(responseStatus);

            if (onFavoriteToggle) {
              onFavoriteToggle(Number(ProductId), responseStatus);
            }
          }
        } else {
          // API call failed, revert to original state
          setFavoriteStatus(currentState);

          if (onFavoriteToggle) {
            onFavoriteToggle(Number(ProductId), currentState);
          }
        }
      } catch (error) {
        // Exception occurred, revert to initial state
        setFavoriteStatus(isMarkedFavorite);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(ProductId), isMarkedFavorite);
        }
      } finally {
        setIsProcessing(false);
      }
    } else if (!isAuthenticated) {
      // Could redirect to login page here
      // window.location.href = '/login';
    }
  };

  // Handle delete button click - show confirmation dialog
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  // Handle confirm delete action
  const handleConfirmDelete = async () => {
    if (!ProductId) return;

    try {
      setIsDeleting(true);
      await deleteCarListingMutation.mutateAsync({ id: Number(ProductId) });

      // Close the dialog
      setShowDeleteDialog(false);

      // Notify parent of deletion if callback provided
      if (onDelete) {
        onDelete(Number(ProductId));
      }
    } catch (error) {
      console.error('Failed to delete car listing:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // RTL-aware positioning classes
  const heartButtonClass = clsx(
    'absolute top-2 bg-white p-2 rounded-full shadow-md z-10',
    locale === 'ar' ? 'right-2' : 'left-2',
  );

  const typeTagClass = clsx(
    'absolute bottom-[170px] bg-white px-2 py-1 rounded-lg shadow-md text-primary text-sm font-medium',
    locale === 'ar' ? 'right-2' : 'left-2',
  );

  const statusBadgeClass = clsx(
    'absolute top-2 z-20',
    isFavorites
      ? locale === 'ar'
        ? 'left-2'
        : 'right-2'
      : locale === 'ar'
      ? 'right-2'
      : 'left-2',
  );

  const featuredBadgeClass = clsx(
    'absolute top-2 z-20 bg-yellow-100 text-yellow-800 border-yellow-200',
    isMine && status
      ? locale === 'ar'
        ? 'left-14'
        : 'right-14' // Offset if status badge is present
      : locale === 'ar'
      ? 'left-2'
      : 'right-2',
  );

  const iconMarginClass = clsx(locale === 'ar' ? 'ml-2' : 'mr-2');

  return (
    <div className="w-full" dir={direction}>
      <Card
        className={`group border border-gray-200 rounded-xl bg-white w-full shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
      >
        {/* Status Badge - Only for user's own listings */}
        {isMine && getStatusBadge() && (
          <div className={statusBadgeClass}>{getStatusBadge()}</div>
        )}

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

        {/* Heart Icon for Favorites with favorite status directly from props */}
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

        <Text className={typeTagClass}>
          {type === 'for_sale' ? t('sale') : t('rent')}
        </Text>

        {/* Make the card content clickable */}
        <Link
          href={`/products/product/${ProductId}${
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
                className="text-primary font-bold line-clamp-1 mb-1 group-hover:text-primary-light transition-colors duration-300"
              >
                {title}
              </Text>
              <Text variant="mid" className="text-gray-600 font-medium">
                {marka}
              </Text>
            </CardDescription>
          </CardHeader>
        </Link>

        {/* Conditional Footer based on auth state */}
        {isFavorites ? (
          <Link
            href={`/products/product/${ProductId}${
              profile ? '?profile=true' : ''
            }`}
          >
            <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between p-4 rounded-b-xl group-hover:from-primary-light group-hover:to-primary transition-all duration-300">
              <Text className="text-primary font-medium group-hover:text-white transition-colors duration-300">
                {priceWord}
              </Text>
              <Text className="text-primary-light font-bold text-lg group-hover:text-white transition-colors duration-300">
                {price.toString()}
              </Text>
            </CardFooter>
          </Link>
        ) : (
          <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 w-full flex flex-wrap gap-2 justify-between p-4 rounded-b-xl">
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
                className="bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-light px-4 py-2 text-white rounded-lg flex-1 text-center flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Edit className={iconMarginClass} size={16} />
                {t('edit')}
              </Link>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Delete Confirmation Dialog - Enhanced Design */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          dir={direction}
          className="bg-white rounded-lg p-0 max-w-md shadow-xl"
        >
          <div className="bg-red-50 p-4 rounded-t-lg border-b border-red-100">
            <AlertDialogHeader>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle
                    className="h-6 w-6 text-red-500"
                    aria-hidden="true"
                  />
                </div>
                <div className={`${locale === 'ar' ? 'mr-3' : 'ml-3'}`}>
                  <AlertDialogTitle className="text-lg font-medium text-red-800">
                    {t('deleteConfirmation')}
                  </AlertDialogTitle>
                </div>
              </div>
            </AlertDialogHeader>
          </div>

          <div className="p-6">
            <AlertDialogDescription className="text-sm text-gray-600">
              {t('deleteWarning')}
            </AlertDialogDescription>

            <div className="mt-2">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div
                    className={`${
                      locale === 'ar' ? 'mr-3' : 'ml-3'
                    } mt-2 text-sm`}
                  >
                    <h3 className="font-medium text-gray-800">{title}</h3>
                    <p className="text-gray-500">{marka}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className={`inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
    </div>
  );
};
