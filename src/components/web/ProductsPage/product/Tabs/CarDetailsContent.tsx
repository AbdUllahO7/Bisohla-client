'use client';

import React, { JSX, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Car,
  Tag,
  Phone,
  DollarSign,
  Info,
  Layers,
  Settings,
  Bookmark,
  MessageSquare,
  MapPin,
  Calendar,
  BarChart,
  Key,
  Palette,
  Hash,
  ChevronDown,
  ChevronUp,
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
      label: t('trim'),
      value: data?.trim?.name || '-',
      icon: <Settings className="w-4 h-4" />,
    },
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
      icon: <Car className="w-4 h-4" />,
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
  ];

  // Contact and location information
  const contactDetails: DetailItem[] = [
    {
      label: t('contactNumber'),
      value: data?.contactNumber || '-',
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

  // Render skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Regular fields skeleton */}
        {skeletonCount.regular > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            {Array.from({ length: skeletonCount.regular }).map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        )}

        {/* Long text fields skeleton */}
        {skeletonCount.long > 0 && (
          <div className="space-y-6">
            {Array.from({ length: skeletonCount.long }).map((_, index) => (
              <div key={`long-skeleton-${index}`} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Function to render regular fields
  const renderRegularField = (detail: any, index: number) => (
    <div key={index} className="group space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-primary-light group-hover:text-primary transition-colors">
          {detail.icon}
        </div>
        <label className="text-sm font-medium text-secondary-text uppercase tracking-wide">
          {detail.label}
        </label>
      </div>
      <div className="pl-6">
        <p className="text-base font-semibold text-primary group-hover:text-primary-light transition-colors">
          {detail.value}
        </p>
      </div>
    </div>
  );

  // Function to render long text fields
  const renderLongTextField = (detail: any, index: number) => {
    const isExpanded = expandedFields[detail.key] || false;
    const maxLength = 200;
    const shouldTruncate = detail.value.length > maxLength;

    const displayValue =
      shouldTruncate && !isExpanded
        ? `${detail.value.substring(0, maxLength)}...`
        : detail.value;

    return (
      <div
        key={index}
        className="group space-y-3 py-4 border-t border-gray-100 first:border-t-0 first:pt-0"
      >
        <div className="flex items-center gap-2">
          <div className="text-primary-light group-hover:text-primary transition-colors">
            {detail.icon}
          </div>
          <label className="text-sm font-medium text-secondary-text uppercase tracking-wide">
            {detail.label}
          </label>
        </div>

        <div className="pl-6 space-y-2">
          <div className="prose prose-sm max-w-none">
            <p className="text-primary leading-relaxed whitespace-pre-wrap m-0">
              {displayValue}
            </p>
          </div>

          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpand(detail.key)}
              className="text-primary-light hover:text-primary hover:bg-primary-light/10 px-0 h-auto font-medium"
            >
              {isExpanded ? (
                <div className="flex items-center gap-1">
                  <span>{t('showLess')}</span>
                  <ChevronUp className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span>{t('showMore')}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* Regular Fields Section */}
      {regularFields.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {regularFields.map((detail, index) =>
            renderRegularField(detail, index),
          )}
        </div>
      )}

      {/* Long Text Fields Section */}
      {longTextFields.length > 0 && (
        <div className="space-y-1">
          {longTextFields.map((detail, index) =>
            renderLongTextField(detail, index),
          )}
        </div>
      )}
    </div>
  );
};

export default CarDetailsContent;
