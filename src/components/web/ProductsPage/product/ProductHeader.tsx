'use client';

import type React from 'react';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, PhoneCall, LogIn } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { toggleCarListingFavorite } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ProductHeaderProps {
  productName?: string;
  price?: number | string;
  currency?: string;
  ContactNumber?: string;
  isLoading?: boolean;
  productId?: number;
  isMarkedFavorite?: boolean;
  isAuthenticated?: boolean;
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  onAuthRequired?: () => void; // Callback for when auth is required
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  productName = '',
  price,
  currency,
  ContactNumber = '',
  isLoading = false,
  productId,
  isMarkedFavorite = false,
  isAuthenticated = false,
  onFavoriteToggle,
  onAuthRequired,
}) => {
  const t = useTranslations('product');
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const route = useRouter();

  // Format phone number for WhatsApp link (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  };

  // Generate WhatsApp link with pre-filled message
  const generateWhatsAppLink = () => {
    const formattedPhone = formatPhoneForWhatsApp(ContactNumber);
    const message = encodeURIComponent(
      `Hi, I'm interested in your ${productName} listing.`,
    );

    // If formattedPhone is empty, use a default fallback link
    if (!formattedPhone) {
      return 'https://wa.me/?text=' + message;
    }

    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  // Handle favorite button click
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If not authenticated, show auth prompt
    if (!isAuthenticated) {
      // Call the auth required callback if provided
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        // Default behavior - show a toast and potentially redirect
        toast({
          title: t('authRequired', { defaultValue: 'Authentication Required' }),
          description: t('pleaseSignIn', {
            defaultValue: 'Please sign in to add favorites',
          }),
          action: (
            <button
              onClick={() => {
                route.push('/auth/sign-in'); // Redirect to sign-in page
              }}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
            >
              {t('signIn', { defaultValue: 'Sign In' })}
            </button>
          ),
        });
      }
      return;
    }

    // Only proceed if we have a product ID and aren't already processing
    if (!productId || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Store current state for potential reversion
      const previousState = isMarkedFavorite;
      const newState = !previousState;

      // IMMEDIATE optimistic update - notify parent right away
      if (onFavoriteToggle) {
        onFavoriteToggle(productId, newState);
      }

      // Make API call in background
      const response = await toggleCarListingFavorite({
        carListingId: Number(productId),
      });

      // Handle API response
      if (response.success) {
        // Determine the actual status from API
        let actualStatus: boolean;

        if (typeof response.data === 'boolean') {
          actualStatus = response.data;
        } else if (
          response.data &&
          typeof response.data === 'object' &&
          'isFavorite' in response.data
        ) {
          actualStatus = response.data.isFavorite as boolean;
        } else {
          // If response format is unexpected, keep optimistic update
          actualStatus = newState;
        }

        // Only update if API returned something different than our optimistic update
        if (actualStatus !== newState && onFavoriteToggle) {
          onFavoriteToggle(productId, actualStatus);
        }
      } else {
        // API call failed, revert to original state
        if (onFavoriteToggle) {
          onFavoriteToggle(productId, previousState);
        }

        // Show error toast only on failure
        toast({
          title: t('error', { defaultValue: 'Error' }),
          description: t('favoriteError', {
            defaultValue: 'Failed to update favorite. Please try again.',
          }),
          variant: 'destructive',
        });
      }
    } catch (error) {
      // Exception occurred, revert to original state
      if (onFavoriteToggle) {
        onFavoriteToggle(productId, isMarkedFavorite);
      }

      console.error('Failed to toggle favorite:', error);

      // Show error toast only on failure
      toast({
        title: t('error', { defaultValue: 'Error' }),
        description: t('favoriteError', {
          defaultValue: 'Failed to update favorite. Please try again.',
        }),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box
        variant="rowBetween"
        className="items-center justify-start w-full py-2 gap-2"
      >
        {/* Desktop skeleton */}
        <Box
          className="justify-start items-start hidden md:flex"
          variant="center"
        >
          <Skeleton className="h-8 w-[200px]" />
        </Box>

        <Box
          className="justify-end items-center flex-wrap gap-2 flex-1 sm:flex-nowrap hidden md:flex"
          variant="row"
        >
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-[120px] rounded-md" />
          <Skeleton className="h-8 w-[100px] rounded-md" />
        </Box>

        {/* Mobile skeleton */}
        <div className="md:hidden w-full space-y-3">
          <Skeleton className="h-8 w-[250px] mx-auto" />
          <Skeleton className="h-12 w-[200px] mx-auto" />
          <div className="flex gap-3 justify-center">
            <Skeleton className="h-12 flex-1 max-w-[120px] rounded-lg" />
            <Skeleton className="h-12 flex-1 max-w-[120px] rounded-lg" />
          </div>
        </div>
      </Box>
    );
  }

  return (
    <>
      {/* Mobile Layout (< md) */}
      <div className="md:hidden w-full my-4 relative">
        <Box variant="column" className="w-full gap-4 items-center">
          {/* Mobile: Title (if needed) */}
          {productName && (
            <Text variant="h4" className="font-bold text-center w-full" as="h1">
              {productName}
            </Text>
          )}

          {/* Price - Prominent */}
          <Box variant="center" className="w-full">
            <Text
              variant="h3"
              className="font-bold text-primary-light text-center"
            >
              {price} {currency}
            </Text>
          </Box>

          {/* Mobile: Favorite button - top right positioned */}
          <div className="absolute -top-4 -right-4 z-10">
            <button
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 group border ${
                !isAuthenticated
                  ? 'bg-white/90 border-gray-200 hover:bg-white hover:shadow-lg'
                  : isMarkedFavorite
                  ? 'bg-red-50 border-red-200 hover:bg-red-100'
                  : 'bg-white/90 border-gray-200 hover:bg-white hover:shadow-lg'
              }`}
              onClick={handleFavoriteClick}
              disabled={isProcessing}
              aria-label={
                !isAuthenticated
                  ? 'Sign in to add favorites'
                  : isMarkedFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              <Heart
                className={`h-6 w-6 transition-colors duration-200 ${
                  isProcessing
                    ? 'animate-pulse text-gray-400'
                    : isMarkedFavorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-600 group-hover:text-red-500'
                }`}
              />
            </button>
          </div>

          {/* Mobile: Action buttons - full width */}
          <Box className="w-full flex gap-3 px-4" variant="row">
            <Link
              href={`tel:${ContactNumber}`}
              className="flex-1 flex items-center justify-center font-bold gap-2 text-base px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 min-h-[48px]"
            >
              <PhoneCall className="h-5 w-5" />
              <span>{t('call')}</span>
            </Link>

            <Link
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 min-h-[48px] font-bold text-base"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{t('whatsapp')}</span>
            </Link>
          </Box>
        </Box>
      </div>

      {/* Desktop Layout (>= md) */}
      <Box
        variant="rowBetween"
        className="items-center justify-start w-full gap-2 flex-col sm:flex-row py-2 hidden md:flex"
      >
        <Box
          className="justify-start items-start w-full sm:w-auto"
          variant="center"
        >
          <Text
            variant="h5"
            className="font-bold md:text-start xs:text-center min-w-[300px] w-full"
            as="h1"
          >
            {productName}
          </Text>
        </Box>

        <Box
          className="justify-center sm:justify-end items-center flex-wrap gap-2 w-full sm:flex-nowrap"
          variant="row"
        >
          <button
            className={`p-2 sm:p-1.5 rounded-md transition-all duration-200 group ${
              !isAuthenticated
                ? 'bg-background hover:bg-white hover:shadow-md'
                : isMarkedFavorite
                ? 'bg-red-50 hover:bg-red-100'
                : 'bg-background hover:bg-white hover:shadow-md'
            }`}
            onClick={handleFavoriteClick}
            disabled={isProcessing}
            aria-label={
              !isAuthenticated
                ? 'Sign in to add favorites'
                : isMarkedFavorite
                ? 'Remove from favorites'
                : 'Add to favorites'
            }
          >
            <Heart
              className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 ${
                isProcessing
                  ? 'animate-pulse text-gray-400'
                  : isMarkedFavorite
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-600 group-hover:text-red-500'
              }`}
            />
          </button>

          <Link
            href={`tel:${ContactNumber}`}
            className="flex items-center justify-center font-bold gap-1 text-sm px-3 py-2 sm:px-4 sm:py-1.5 border border-primary rounded-md hover:bg-primary hover:text-white transition-all duration-300 min-w-[80px] sm:min-w-0"
          >
            <PhoneCall className="h-4 w-4 sm:h-4 sm:w-4 fill-primary" />
            <span className="hidden sm:inline">{ContactNumber}</span>
            <span className="sm:hidden">Call</span>
          </Link>

          <Link
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-1.5 bg-primary-foreground text-primary hover:text-primary-foreground rounded-md hover:bg-primary transition-all duration-300 min-w-[120px] sm:min-w-0"
          >
            <MessageCircle className="h-4 w-4 sm:h-4 sm:w-4" />
            <span className="font-bold text-sm">{t('header.whatsApp')}</span>
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default ProductHeader;
