'use client';

import React, { JSX, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Car,
  Phone,
  DollarSign,
  Info,
  Settings,
  Bookmark,
  MessageSquare,
  MapPin,
  Key,
  Hash,
  ChevronDown,
  ChevronUp,
  Palette,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface CarDetailsContentProps {
  data: any;
  type?: 'car' | 'ads' | 'contact' | 'description';
  isLoading?: boolean;
}

const CarDetailsContent: React.FC<CarDetailsContentProps> = ({
  data,
  type = 'car',
  isLoading = false,
}) => {
  const t = useTranslations('product.CarDetailsContent');
  // State for expanded text fields
  const [expandedFields, setExpandedFields] = useState<{
    [key: string]: boolean;
  }>({});

  // Toggle expansion of a field
  const toggleExpand = (fieldName: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  type DetailItem = {
    label: string;
    value: any;
    icon: JSX.Element;
    longText?: boolean;
    key?: string;
  };

  // Car technical details
  const carDetails: DetailItem[] = [
    {
      label: t('title'),
      value: data?.title || '-',
      icon: <Car className="w-4 h-4" />,
    },
    {
      label: t('price'),
      value: data?.price ? `${data?.price} ${data?.currency || ''}` : '-',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      label: t('currency'),
      value: data?.currency || '-',
      icon: <Bookmark className="w-4 h-4" />,
    },
  ];

  // Ad basic information
  const adsDetails: DetailItem[] = [
    {
      label: t('engineSize'),
      value: data?.details?.engineSize || '-',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: t('enginePower'),
      value: data?.details?.enginePower || '-',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: t('doors'),
      value: data?.details?.doors || '-',
      icon: <Hash className="w-4 h-4" />,
    },
    {
      label: t('colorExterior'),
      value: data?.details?.colorExterior || '-',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      label: t('colorInterior'),
      value: data?.details?.colorInterior || '-',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      label: t('plateNumber'),
      value: data?.details?.plateNumber || '-',
      icon: <Hash className="w-4 h-4" />,
    },
    {
      label: t('vin'),
      value: data?.details?.vin || '-',
      icon: <Key className="w-4 h-4" />,
    },
    {
      label: t('vehicleCondition.label'),
      value: data?.condition ? t(`vehicleCondition.${data?.condition}`) : '-',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  // Contact and location information
  const contactDetails: DetailItem[] = [
    {
      label: t('contactNumber'),
      // Never print the digits here. This row is plain server-rendered text, so
      // a number in it is the single easiest thing on the page for a scraper to
      // take — and it would defeat the reveal flow the Call/WhatsApp buttons
      // use. When the backend has hidden the number, point the user at those
      // buttons instead.
      value:
        data?.contactNumber ||
        (data?.contactAvailable ? t('contactViaButtons') : '-'),
      icon: <Phone className="w-4 h-4" />,
    },
    {
      label: t('city'),
      value: data?.city || '-',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      label: t('governorate'),
      value: data?.governorate || '-',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      label: t('address'),
      value: data?.address || '-',
      icon: <MapPin className="w-4 h-4" />,
      longText: true,
      key: 'address',
    },
  ];

  // Description and story information
  const descriptionDetails: DetailItem[] = [
    {
      label: t('description'),
      value: data?.description || '-',
      icon: <MessageSquare className="w-4 h-4" />,
      longText: true,
      key: 'description',
    },
    {
      label: t('story'),
      value: data?.story || '-',
      icon: <Info className="w-4 h-4" />,
      longText: true,
      key: 'story',
    },
  ];

  // Select which details to show based on type
  const getDetailsToShow = () => {
    switch (type) {
      case 'car':
        return carDetails;
      case 'ads':
        return adsDetails;
      case 'contact':
        return contactDetails;
      case 'description':
        return descriptionDetails;
      default:
        return carDetails;
    }
  };

  const detailsToShow = getDetailsToShow();
  const regularFields = detailsToShow.filter((detail) => !detail.longText);
  const longTextFields = detailsToShow.filter((detail) => detail.longText);

  // Get skeleton count based on type
  const getSkeletonCount = () => {
    switch (type) {
      case 'car':
        return { regular: 6, long: 0 };
      case 'ads':
        return { regular: 3, long: 0 };
      case 'contact':
        return { regular: 3, long: 1 };
      case 'description':
        return { regular: 0, long: 2 };
      default:
        return { regular: 6, long: 0 };
    }
  };

  const skeletonCount = getSkeletonCount();

  // Enhanced skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-8">
        {/* Regular fields skeleton */}
        {skeletonCount.regular > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: skeletonCount.regular }).map((_, index) => (
              <div key={`skeleton-${index}`} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
                <div className="pl-6">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Long text fields skeleton */}
        {skeletonCount.long > 0 && (
          <div className="space-y-6">
            {Array.from({ length: skeletonCount.long }).map((_, index) => (
              <div key={`long-skeleton-${index}`} className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-28 rounded-lg" />
                </div>
                <div className="pl-6">
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Enhanced function to render regular fields
  const renderRegularField = (detail: any, index: number) => (
    <div key={index} className="group relative">
      {/* Outer glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>

      <div className="relative p-4 bg-white dark:bg-zinc-900 rounded-xl border-2 border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-[#198341] dark:hover:border-[#ABDE3B] transition-all duration-300 space-y-3 overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] transition-all duration-300"></div>

        {/* Side accent indicator */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-16 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>

        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#198341]/5 to-[#ABDE3B]/5 dark:from-[#ABDE3B]/5 dark:to-[#ABDE3B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative group/icon">
            {/* Icon glow */}
            <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>

            <div className="relative flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 rounded-lg flex items-center justify-center text-[#198341] group-hover:from-[#198341]/20 group-hover:to-[#ABDE3B]/20 group-hover/icon:scale-110 transition-all duration-300">
              {detail.icon}
            </div>
          </div>
          <label className="text-sm font-semibold text-[#2C3C39] dark:text-zinc-300 uppercase tracking-wide group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B] transition-colors duration-300">
            {detail.label}
          </label>
        </div>
        <div className="pl-11 relative z-10">
          <p className="text-base font-bold text-[#2C3C39] dark:text-zinc-200 group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B] transition-colors duration-300">
            {typeof detail.value === 'object' ? JSON.stringify(detail.value) : detail.value}
          </p>
        </div>
      </div>
    </div>
  );

  // Enhanced function to render long text fields
  const renderLongTextField = (detail: any, index: number) => {
    const isExpanded = expandedFields[detail.key] || false;
    const maxLength = 200;
    const shouldTruncate = detail.value.length > maxLength;

    const valueStr = typeof detail.value === 'string' ? detail.value : JSON.stringify(detail.value) || '';
    const displayValue =
      shouldTruncate && !isExpanded
        ? `${valueStr.substring(0, maxLength)}...`
        : valueStr;

    return (
      <div
        key={index}
        className="group relative"
      >
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

        <div className="relative p-6 bg-white dark:bg-zinc-900 rounded-xl border-2 border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500 space-y-4 overflow-hidden">
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ABDE3B]/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#198341]/10 to-transparent rounded-tr-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341]"></div>

          {/* Side accent indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-32 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-500 rounded-r-full"></div>

          {/* Background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#198341]/3 to-[#ABDE3B]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="relative group/icon">
              {/* Icon glow */}
              <div className="absolute inset-0 bg-[#198341] blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-lg"></div>

              <div className="relative flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 rounded-lg flex items-center justify-center text-[#198341] group-hover:from-[#198341]/20 group-hover:to-[#ABDE3B]/20 group-hover/icon:scale-110 transition-all duration-300">
                {detail.icon}
              </div>
            </div>
            <label className="text-sm font-semibold text-[#2C3C39] dark:text-zinc-300 uppercase tracking-wide group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B] transition-colors duration-300">
              {detail.label}
            </label>
          </div>

          <div className="pl-11 space-y-3 relative z-10">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap m-0 group-hover:text-[#2C3C39] dark:group-hover:text-zinc-200 transition-colors duration-300">
                {displayValue}
              </p>
            </div>

            {shouldTruncate && (
              <div className="relative inline-block group/button">
                {/* Button glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-lg opacity-0 group-hover/button:opacity-30 blur transition-opacity duration-300"></div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(detail.key)}
                  className="relative text-[#198341] dark:text-[#ABDE3B] hover:text-white hover:bg-gradient-to-r hover:from-[#198341] hover:to-[#ABDE3B] px-4 py-2 h-auto font-semibold rounded-lg transition-all duration-300 border-2 border-[#198341] dark:border-[#ABDE3B] hover:border-[#198341] dark:hover:border-[#ABDE3B] overflow-hidden group/btn"
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                  {isExpanded ? (
                    <div className="flex items-center gap-2 relative z-10">
                      <span>{t('showLess')}</span>
                      <ChevronUp className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 relative z-10">
                      <span>{t('showMore')}</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* Enhanced Regular Fields Section */}
      {regularFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularFields.map((detail, index) =>
            renderRegularField(detail, index),
          )}
        </div>
      )}

      {/* Enhanced Long Text Fields Section */}
      {longTextFields.length > 0 && (
        <div className="space-y-6">
          {longTextFields.map((detail, index) =>
            renderLongTextField(detail, index),
          )}
        </div>
      )}
    </div>
  );
};

export default CarDetailsContent;