'use client';

import type React from 'react';

import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, LogIn } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toggleFavorite as toggleListingFavorite } from '@/utils/offline-favorites-manager';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SaveStatus } from '@/core/entities/enums/cars.enums';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import SellerInfoCard from './SellerInfoCard';
import ContactRevealButtons from './ContactRevealButtons';
import ListingIdCopyChip from '@/components/web/ProductsPage/ListingIdCopyChip';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';

interface ProductHeaderProps {
  productName?: string;
  price?: number | string;
  currency?: string;
  /** Null once seller-contact protection is on — see `contactAvailable`. */
  ContactNumber?: string | null;
  /** Whether a number exists at all, so the buttons know if a reveal is worth it. */
  contactAvailable?: boolean;
  isLoading?: boolean;
  productId?: number;
  isMarkedFavorite?: boolean;
  isAuthenticated?: boolean;
  saveStatus?: SaveStatus;
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  onAuthRequired?: () => void;
  onContactClick?: () => void; // 🆕 Add contact tracking callback
  user?: SelectUserDto;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  productName = '',
  price,
  currency,
  ContactNumber = '',
  contactAvailable,
  isLoading = false,
  productId,
  isMarkedFavorite = false,
  isAuthenticated = false,
  onFavoriteToggle,
  onAuthRequired,
  onContactClick, // 🆕 Destructure the new prop
  saveStatus,
  user,
}) => {
  const t = useTranslations('product');
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const sold = useTranslations('SoldCard');
  const route = useRouter();
  const isSold = saveStatus === SaveStatus.SOLD;
  const session = useSession();
  const isOwner =
    (!session.isLoading && isAuthenticated && session.user?.id === user?.id) ||
    false;

  // Phone/WhatsApp link building and contact tracking now live inside
  // <ContactRevealButtons>, which also fetches the number when the backend has
  // hidden it. Nothing here may put the digits into the rendered HTML.

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
                const currentPath =
                  typeof window !== 'undefined'
                    ? window.location.pathname + window.location.search
                    : '';
                const signInUrl = `/auth/sign-in${
                  currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ''
                }`;
                route.push(signInUrl); // Redirect to sign-in page
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
      const response = await toggleListingFavorite({
        listingId: Number(productId),
      });

      // Handle API response
      if (response.success) {
        // Determine the actual status from API
        let actualStatus: boolean;

        if (typeof response.data === 'boolean') {
          actualStatus = response.data;
        } else if (
          response.data &&
          typeof response.data === 'object'
        ) {
          const data = response.data as any;
          if ('isFavorited' in data) {
            actualStatus = data.isFavorited as boolean;
          } else if ('isFavorite' in data) {
            actualStatus = data.isFavorite as boolean;
          } else {
            actualStatus = newState;
          }
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
          className="justify-center items-center gap-2 hidden md:flex"
          variant="row"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[120px]" />
        </Box>

        {/* Mobile skeleton */}
        <div className="w-full flex md:hidden flex-col gap-4 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </Box>
    );
  }

  return (
    <>
      {/* Mobile Layout (< md) */}
      <div className="w-full flex md:hidden flex-col gap-4 p-4 relative">
        <div className="w-full gap-4 flex-col ">
          {/* Mobile: Title (if needed) */}
          {productName && (
            <div className="space-y-2 text-center w-full">
              <Text
                variant="h4"
                className="font-bold text-center w-full text-[#2C3C39] dark:text-zinc-100 line-clamp-3"
                as="h1"
              >
                {productName}
              </Text>
              {productId && (
                <div className="flex justify-center">
                  <ListingIdCopyChip id={productId} />
                </div>
              )}
            </div>
          )}

          {/* Seller Info Card */}
          {user && (
            <div className="w-full mt-2 mb-4">
              <SellerInfoCard user={user} />
            </div>
          )}

          {/* Price - Enhanced with gradient background */}
          <Box variant="center" className="w-full relative">
            {/* Glow effect behind price */}
            <div className="absolute inset-0 bg-[#ABDE3B]/20 dark:bg-[#ABDE3B]/10 blur-2xl rounded-full"></div>

            <div
              className={`relative px-6 rounded-lg border-2 ${
                isSold
                  ? 'bg-gray-200 dark:bg-zinc-800 border-gray-400 dark:border-zinc-750'
                  : 'bg-gradient-to-r from-[#198341]/10 via-[#ABDE3B]/10 to-[#198341]/10 dark:from-[#198341]/20 dark:via-[#ABDE3B]/20 dark:to-[#198341]/20 border-[#198341]/30 dark:border-[#ABDE3B]/30'
              }`}
            >
              <Text
                variant="h3"
                className={`font-bold text-center ${
                  isSold ? 'text-gray-500 dark:text-zinc-500 line-through' : 'text-[#198341]'
                }`}
              >
                {price} {currency}
              </Text>
              {/* Pulsing indicator - only when not sold */}
              {!isSold && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ABDE3B] rounded-full animate-pulse"></div>
              )}
            </div>
          </Box>

          {/* Mobile: Favorite button - enhanced */}
          <div className="absolute -top-4 -right-4 z-10">
            <div className="relative group">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#198341] to-[#ABDE3B] blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>

              <button
                className={`relative p-3 rounded-full backdrop-blur-sm transition-all duration-300 border-2 shadow-lg ${
                  !isAuthenticated || isSold
                    ? 'bg-white/90 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:border-[#198341] dark:hover:border-[#ABDE3B]'
                    : isMarkedFavorite
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/60 hover:shadow-xl'
                    : 'bg-white/90 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-xl hover:border-[#198341] dark:hover:border-[#ABDE3B]'
                }`}
                onClick={handleFavoriteClick}
                disabled={isProcessing || isSold || isOwner}
                aria-label={
                  !isAuthenticated
                    ? 'Sign in to add favorites'
                    : isMarkedFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                <Heart
                  className={`h-6 w-6 transition-all duration-300 ${
                    isProcessing
                      ? 'animate-pulse text-gray-400'
                      : isSold || isOwner
                      ? 'text-gray-400'
                      : isMarkedFavorite
                      ? 'text-red-500 fill-red-500 scale-110'
                      : 'text-gray-600 dark:text-zinc-400 group-hover:text-red-500 group-hover:scale-110'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile: Action buttons or SOLD message */}
          {isSold ? (
            // SOLD Message for Mobile
            <Box className="w-full px-4 flex-col mt-2" variant="center">
              <div className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg py-6 px-4 border-4 border-red-800 shadow-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-5xl font-black tracking-wider">
                    {sold('sold')}
                  </div>
                  <div className="text-sm font-semibold tracking-wide uppercase">
                    {sold('desc')}
                  </div>
                  <div className="h-1 w-24 bg-white/50 rounded-full mt-2"></div>
                </div>
              </div>
            </Box>
          ) : (
            <Box className="w-full flex gap-3 px-4 pt-2" variant="row">
              <ContactRevealButtons
                variant="mobile"
                listingId={productId}
                contactNumber={ContactNumber}
                contactAvailable={contactAvailable}
                productName={productName}
                onContactClick={onContactClick}
                isAuthenticated={isAuthenticated}
                isSold={isSold}
              />
            </Box>
          )}
        </div>
      </div>

      {/* Desktop Layout (>= md) */}
      <div className="hidden md:block w-full">
        {/* Product Title Row - Standalone Above */}
        <Box className="w-full py-3 border-b dark:border-zinc-800 flex items-center justify-between gap-4">
          <Text
            variant="h5"
            className="font-bold text-start text-[#2C3C39] dark:text-zinc-100"
            as="h1"
          >
            {productName}
          </Text>
          {productId && (
            <div className="shrink-0">
              <ListingIdCopyChip id={productId} />
            </div>
          )}
        </Box>

        {/* Main Header Row - User Info + Actions */}
        <Box
          variant="rowBetween"
          className="items-center justify-between w-full gap-2 py-2"
        >
          {/* LEFT: User Info (replaces title position) */}
          <Box className="justify-start items-center" variant="row">
            {user && <SellerInfoCard user={user} />}
          </Box>

          {/* RIGHT: Action Buttons (same position) */}
          <Box
            className="justify-center sm:justify-end items-center flex-wrap gap-2 sm:flex-nowrap"
            variant="row"
          >
            {/* Desktop Favorite Button - Enhanced */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#198341] to-[#ABDE3B] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-md"></div>

              <button
                className={`relative p-2 sm:p-1.5 rounded-md transition-all duration-300 border-2 ${
                  !isAuthenticated || isSold
                    ? 'bg-background hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md border-transparent hover:border-[#198341] dark:hover:border-[#ABDE3B]'
                    : isMarkedFavorite
                    ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 border-red-200 dark:border-red-900'
                    : 'bg-background hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md border-transparent hover:border-[#198341] dark:hover:border-[#ABDE3B]'
                }`}
                onClick={handleFavoriteClick}
                disabled={isProcessing || isSold || isOwner}
                aria-label={
                  !isAuthenticated
                    ? 'Sign in to add favorites'
                    : isMarkedFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                <Heart
                  className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${
                    isProcessing
                      ? 'animate-pulse text-gray-400'
                      : isSold || isOwner
                      ? 'text-gray-400'
                      : isMarkedFavorite
                      ? 'text-red-500 fill-red-500 scale-110'
                      : 'text-gray-600 dark:text-zinc-400 group-hover:text-red-500 group-hover:scale-110'
                  }`}
                />
              </button>
            </div>

            {/* Desktop: Action buttons or SOLD badge */}
            {isSold ? (
              // SOLD Badge for Desktop
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-md border-2 border-red-800 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black tracking-wider">
                    {sold('sold')}
                  </div>
                  <div className="h-6 w-px bg-white/50"></div>
                  <div className="text-xs font-semibold tracking-wide uppercase">
                    {sold('desc')}
                  </div>
                </div>
              </div>
            ) : (
              <ContactRevealButtons
                variant="desktop"
                listingId={productId}
                contactNumber={ContactNumber}
                contactAvailable={contactAvailable}
                productName={productName}
                onContactClick={onContactClick}
                isAuthenticated={isAuthenticated}
                isSold={isSold}
              />
            )}
          </Box>
        </Box>
      </div>
    </>
  );
};

export default ProductHeader;
