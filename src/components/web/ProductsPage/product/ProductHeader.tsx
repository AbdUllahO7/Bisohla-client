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
import { SaveStatus } from '@/core/entities/enums/cars.enums';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import SellerInfoCard from './SellerInfoCard';

interface ProductHeaderProps {
  productName?: string;
  price?: number | string;
  currency?: string;
  ContactNumber?: string;
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

  // 🆕 Handle contact button click (for phone call)
  const handlePhoneClick = (e: React.MouseEvent) => {
    // Track the contact action
    if (onContactClick) {
      onContactClick();
    }
    // The Link component will handle the actual tel: navigation
  };

  // 🆕 Handle WhatsApp button click
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    // Track the contact action
    if (onContactClick) {
      onContactClick();
    }
    // The Link component will handle the actual WhatsApp navigation
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
            <Text
              variant="h4"
              className="font-bold text-center w-full text-[#2C3C39]"
              as="h1"
            >
              {productName}
            </Text>
          )}

          {/* Price - Enhanced with gradient background */}
          <Box variant="center" className="w-full relative">
            {/* Glow effect behind price */}
            <div className="absolute inset-0 bg-[#ABDE3B]/20 blur-2xl rounded-full"></div>

            <div
              className={`relative px-6 rounded-lg border-2 ${
                isSold
                  ? 'bg-gray-200 border-gray-400'
                  : 'bg-gradient-to-r from-[#198341]/10 via-[#ABDE3B]/10 to-[#198341]/10 border-[#198341]/30'
              }`}
            >
              <Text
                variant="h3"
                className={`font-bold text-center ${
                  isSold ? 'text-gray-500 line-through' : 'text-[#198341]'
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
                    ? 'bg-white/90 border-gray-200 hover:bg-white hover:shadow-xl hover:border-[#198341]'
                    : isMarkedFavorite
                    ? 'bg-red-50 border-red-200 hover:bg-red-100 hover:shadow-xl'
                    : 'bg-white/90 border-gray-200 hover:bg-white hover:shadow-xl hover:border-[#198341]'
                }`}
                onClick={handleFavoriteClick}
                disabled={isProcessing || isSold}
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
                      : isSold
                      ? 'text-gray-400'
                      : isMarkedFavorite
                      ? 'text-red-500 fill-red-500 scale-110'
                      : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
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
              <div className="flex-1 relative group">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-lg opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>

                {/* 🆕 Added onClick handler to track contact */}
                <Link
                  href={`tel:${ContactNumber}`}
                  onClick={handlePhoneClick}
                  className="relative flex items-center justify-center font-bold gap-2 text-base px-4 py-1 border-2 border-[#198341] text-[#198341] rounded-lg hover:bg-[#198341] hover:text-white transition-all duration-300 min-h-[48px] overflow-hidden group"
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <PhoneCall className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">{t('call')}</span>
                </Link>
              </div>

              <div className="flex-1 relative group">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg opacity-0 group-hover:opacity-50 blur transition-opacity duration-300"></div>

                {/* 🆕 Added onClick handler to track contact */}
                <Link
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="relative flex items-center justify-center gap-2 px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 min-h-[48px] font-bold text-base overflow-hidden group"
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <MessageCircle className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">{t('whatsapp')}</span>
                </Link>
              </div>
            </Box>
          )}
        </div>
      </div>

      {/* Desktop Layout (>= md) */}
      <div className="hidden md:block w-full">
        {/* Product Title Row - Standalone Above */}
        <Box className="w-full py-3 border-b flex items-center">
          <Text
            variant="h5"
            className="font-bold text-start text-[#2C3C39]"
            as="h1"
          >
            {productName}
          </Text>
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
                    ? 'bg-background hover:bg-white hover:shadow-md border-transparent hover:border-[#198341]'
                    : isMarkedFavorite
                    ? 'bg-red-50 hover:bg-red-100 border-red-200'
                    : 'bg-background hover:bg-white hover:shadow-md border-transparent hover:border-[#198341]'
                }`}
                onClick={handleFavoriteClick}
                disabled={isProcessing || isSold}
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
                      : isSold
                      ? 'text-gray-400'
                      : isMarkedFavorite
                      ? 'text-red-500 fill-red-500 scale-110'
                      : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
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
              <>
                {/* Desktop Call Button - Enhanced */}
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-md opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>

                  {/* 🆕 Added onClick handler to track contact */}
                  <Link
                    href={`tel:${ContactNumber}`}
                    onClick={handlePhoneClick}
                    className="relative flex items-center justify-center font-bold gap-1 text-sm px-3 py-2 sm:px-4 sm:py-1.5 border-2 border-[#198341] text-[#198341] rounded-md hover:bg-[#198341] hover:text-white transition-all duration-300 min-w-[80px] sm:min-w-0 overflow-hidden"
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <PhoneCall className="h-4 w-4 sm:h-4 sm:w-4 relative z-10" />
                    <span className="hidden sm:inline relative z-10">
                      {ContactNumber}
                    </span>
                    <span className="sm:hidden relative z-10">Call</span>
                  </Link>
                </div>

                {/* Desktop WhatsApp Button - Enhanced */}
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-md opacity-0 group-hover:opacity-50 blur transition-opacity duration-300"></div>

                  {/* 🆕 Added onClick handler to track contact */}
                  <Link
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="relative flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-1.5 bg-gradient-to-r from-[#198341] to-[#198341] text-white hover:from-[#2C3C39] hover:to-[#198341] rounded-md transition-all duration-300 min-w-[120px] sm:min-w-0 overflow-hidden"
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <MessageCircle className="h-4 w-4 sm:h-4 sm:w-4 relative z-10" />
                    <span className="font-bold text-sm relative z-10">
                      {t('header.whatsApp')}
                    </span>
                  </Link>
                </div>
              </>
            )}
          </Box>
        </Box>
      </div>
    </>
  );
};

export default ProductHeader;
