'use client';

import type React from 'react';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';
import { resolveAttributeValue } from '@/utils/listing-normalization';
import {
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  List,
  BookOpen,
  Tag,
  Palette,
} from 'lucide-react';

interface AttributeGridProps {
  attributeValues: GenericAttributeValue[];
  locale?: string;
  isLoading?: boolean;
}

/** Returns a lucide icon element based on the attribute type */
const getAttributeIcon = (type: string) => {
  switch (type) {
    case 'number':
      return <Hash className="w-4 h-4" />;
    case 'boolean':
      return <ToggleLeft className="w-4 h-4" />;
    case 'date':
    case 'year':
      return <Calendar className="w-4 h-4" />;
    case 'select':
      return <List className="w-4 h-4" />;
    case 'reference':
      return <BookOpen className="w-4 h-4" />;
    case 'color_picker':
    case 'color_selection':
    case 'color_multi_selection':
      return <Palette className="w-4 h-4" />;
    case 'text':
    default:
      return <Type className="w-4 h-4" />;
  }
};

const AttributeGrid: React.FC<AttributeGridProps> = ({
  attributeValues,
  locale = 'en',
  isLoading = false,
}) => {
  /** Filter out attributes with no resolvable value and build display items */
  const displayItems = useMemo(() => {
    if (!attributeValues?.length) return [];
    return attributeValues
      .map((av) => ({
        key: av.id,
        label: av.attribute.name,
        hint: av.attribute.hint,
        type: av.attribute.type,
        slug: av.attribute.slug,
        value: resolveAttributeValue(av, locale),
      }))
      .filter((item) => 
        item.value !== '' && 
        item.slug !== 'damages' && 
        item.slug !== 'damage' && 
        item.slug !== 'additional_features' && 
        item.slug !== 'additional-features' && 
        item.slug !== 'features' && 
        !item.label.toLowerCase().includes('additional feature') &&
        !item.label.includes('الميزات الإضافية') &&
        !item.label.includes('المميزات الإضافية') &&
        (item.type as string) !== 'repeating_group'
      );
  }, [attributeValues, locale]);

  if (isLoading) {
    return (
      <div className="w-full">
        {/* Mobile skeleton */}
        <div className="md:hidden w-full">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-zinc-900 border-none rounded-lg p-3 min-w-[140px] flex-shrink-0 shadow-sm"
              >
                <CardContent className="flex flex-col h-full p-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-zinc-900 border-none rounded-lg p-3 h-20">
              <CardContent className="flex flex-col h-full p-0">
                <div className="flex items-start gap-2 mb-1">
                  <Skeleton className="h-5 w-5 rounded-md" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full mt-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!displayItems.length) return null;

  const renderCard = (item: (typeof displayItems)[0]) => (
    <div key={item.key} className="relative group">
      {/* Hover glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />

      <Card className="relative bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-lg p-3 flex-shrink-0 shadow-sm hover:shadow-lg hover:border-[#198341] dark:hover:border-[#ABDE3B] transition-all duration-300 overflow-hidden h-full">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

        {/* Side accent */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-10 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full" />

        <CardContent className="flex flex-row items-center h-full p-0 gap-3 relative z-10">
          {/* Icon */}
          <div className="relative flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 rounded-lg flex items-center justify-center text-[#198341] group-hover:from-[#198341]/20 group-hover:to-[#ABDE3B]/20 group-hover:scale-110 transition-all duration-300">
            {getAttributeIcon(item.type)}
          </div>

          {/* Label + Value */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[#2C3C39] dark:text-zinc-200 group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B] font-cairo font-bold text-xs line-clamp-1 transition-colors duration-300">
              {item.label}
              {item.hint && (
                <span className="font-normal text-gray-400 dark:text-zinc-500 ms-1">({item.hint})</span>
              )}
            </span>
            <span className="text-secondary-text dark:text-zinc-400 text-xs sm:text-sm font-cairo font-medium line-clamp-1">
              {item.value || '—'}
            </span>
          </div>
        </CardContent>

        {/* Bottom corner accent */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-[#ABDE3B]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </div>
  );

  return (
    <div className="w-full">
      {/* Mobile: horizontal scroll */}
      <div className="md:hidden w-full">
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
          {displayItems.map((item) => (
            <div key={item.key} className="min-w-[160px] flex-shrink-0">
              {renderCard(item)}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(displayItems.length / 3) }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#198341] to-[#ABDE3B]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: responsive grid */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
        {displayItems.map((item) => renderCard(item))}
      </div>
    </div>
  );
};

export default AttributeGrid;
