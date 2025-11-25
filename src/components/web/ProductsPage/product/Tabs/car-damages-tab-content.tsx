'use client';

import { Badge } from '@/components/ui/badge';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { cn } from '@/lib/utils';
import { AlertTriangle, Palette, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useMemo } from 'react';

export interface CarDamagesTabContentProps {
  carListing?: SelectCarListingDto;
  isLoading?: boolean;
}

const CarDamagesTabContent: React.FC<CarDamagesTabContentProps> = ({
  carListing,
  isLoading = false,
}) => {
  const t = useTranslations('product');

  const damages = useMemo(() => carListing?.damages || [], [carListing]);

  const productDetailsBoxes = {
    'box-scratch': {
      title: t('accordionDetails.details.productDetailsTitles.scratch', {
        defaultValue: 'Scratches',
      }),
      damageType: 'Scratch',
      bgColor: 'bg-orange-500',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
    },
    'box-paint': {
      title: t('accordionDetails.details.productDetailsTitles.paint', {
        defaultValue: 'Paint Damage',
      }),
      damageType: 'paint',
      bgColor: 'bg-purple-500',
      icon: <Palette className="w-5 h-5 text-white" />,
    },
    'box-replacement': {
      title: t('accordionDetails.details.productDetailsTitles.replacement', {
        defaultValue: 'Requires Replacement',
      }),
      damageType: 'replacement',
      bgColor: 'bg-red-500',
      icon: <Wrench className="w-5 h-5 text-white" />,
    },
  };

  if (isLoading) {
    // Render loading state
    return <div>Loading damages...</div>;
  }
  // Placeholder for actual damage content rendering logic
  return (
    <div className="flex flex-col w-full gap-4 mt-8">
      <div className="flex items-center justify-between w-full">
        {Object.entries(productDetailsBoxes).map(([key, box]) => {
          return (
            <div
              key={key}
              className={cn(
                box.bgColor,
                'rounded-full flex items-center gap-4 py-1 px-8 text-white',
              )}
            >
              <div>{box.icon}</div>
              {box.title}
            </div>
          );
        })}
      </div>
      <div className="w-full relative">{/* front end section */}</div>
    </div>
  );
};

export default CarDamagesTabContent;
