'use client';

import React, { useMemo } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@/components/ui/box';
import { Skeleton } from '@/components/ui/skeleton';
import AccordionProductSafety from './Tabs/AccordionProductSafety';
import CarDetailsContent from './Tabs/CarDetailsContent';
import { SelectCarDamageDto } from '@/core/entities/models/cars/cars.dto';
import AccordionProductDetails from './Tabs/AccordionProductDetails';
import AttributeGrid from './AttributeGrid';
import { GenericAttributeValue } from '@/core/entities/models/listings/generic-listing.dto';
import { humanizeOptionId } from '@/utils/listing-normalization';
interface TabsSectionProps {
  data?: {
    data?: any;
    damages?: SelectCarDamageDto[];
  };
  isLoading?: boolean;
  /** When false, hides car-specific sections and shows the generic attribute grid */
  isCarListing?: boolean;
  /** Raw attributeValues from the API — used for non-car listings */
  attributeValues?: GenericAttributeValue[];
  /** Current locale for value resolution */
  locale?: string;
}

const TabsSection: React.FC<TabsSectionProps> = ({
  data,
  isLoading = false,
  isCarListing = true,
  attributeValues = [],
  locale,
}) => {
  const t = useTranslations('product');
  const currentLocale = useLocale();
  const resolvedLocale = locale || currentLocale;
  // Ensure damages is always an array, even if undefined or null
  const damages = Array.isArray(data?.data?.damages) ? data.data?.damages : [];

  // Extract non-car Additional Features from attributeValues
  const additionalFeaturesAttr = useMemo(() => {
    return attributeValues.find(
      (av) =>
        av.attribute.slug === 'additional_features' ||
        av.attribute.slug === 'additional-features' ||
        av.attribute.slug === 'features' ||
        av.attribute.name.toLowerCase().includes('additional feature') ||
        av.attribute.name.includes('الميزات الإضافية') ||
        av.attribute.name.includes('المميزات الإضافية')
    );
  }, [attributeValues]);

  const nonCarFeatures = useMemo(() => {
    if (!additionalFeaturesAttr) return [];
    const { valueJson, valueText } = additionalFeaturesAttr;
    let ids: string[] = [];
    if (Array.isArray(valueJson)) {
      ids = valueJson.map(String);
    } else if (typeof valueText === 'string') {
      try {
        const parsed = JSON.parse(valueText);
        if (Array.isArray(parsed)) {
          ids = parsed.map(String);
        } else {
          ids = [valueText];
        }
      } catch {
        ids = valueText.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return ids.map((id) => {
      const option = additionalFeaturesAttr.attribute.options?.find((o) => o.id === id);
      const label = option 
        ? (option.label[resolvedLocale as 'ar' | 'en'] || option.label.en || id) 
        : humanizeOptionId(id, resolvedLocale);
      return { id, label };
    });
  }, [additionalFeaturesAttr, resolvedLocale]);

  // Skeleton for section headers
  const SectionHeaderSkeleton = () => (
    <div className="mb-2">
      <Skeleton className="h-6 w-48" />
    </div>
  );

  return (
    <Box variant="column" className="justify-start items-start w-full">
      <Tabs defaultValue="account" className="flex-wrap">
        {/* Tab Content */}
        <TabsContent value="productDetails"></TabsContent>
        <TabsContent value="productInfo"></TabsContent>
        <TabsContent value="location"></TabsContent>
        <TabsContent value="adsInfo" className=""></TabsContent>
      </Tabs>

      {/* Attributes Section:
           - Cars: show CarDetailsContent (engine size, plate, vin, condition)
           - Other types: show AttributeGrid with raw attributeValues */}
      {isCarListing ? (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B]">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {t('accordionDetails.details.adsDetails.question')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300 mt-8">
            <CarDetailsContent
              data={data?.data}
              type="ads"
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : attributeValues.length > 0 ? (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-4 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B] mb-6">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {resolvedLocale === 'ar' ? 'السمات' : 'Attributes'}
              </span>
            )}
          </div>
          <AttributeGrid
            attributeValues={attributeValues}
            locale={resolvedLocale}
            isLoading={isLoading}
          />
        </div>
      ) : null}

      {/* Additional Features Section — non-car listings with additional features */}
      {!isCarListing && nonCarFeatures.length > 0 && (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-4 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B] mb-6">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {resolvedLocale === 'ar' ? 'الميزات الإضافية' : 'Additional Features'}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`non-car-features-skeleton-${index}`}
                    className="h-12 w-full rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nonCarFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="relative group/feature"
                  >
                    {/* Outer glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-xl opacity-0 group-hover/feature:opacity-20 blur transition-opacity duration-300"></div>
                    
                    <div
                      className="relative flex items-center bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm border-2 border-slate-200 dark:border-zinc-800 hover:border-[#198341] dark:hover:border-[#ABDE3B] hover:shadow-lg transition-all duration-300 h-12 overflow-hidden"
                    >
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 to-[#ABDE3B]/5 dark:from-[#ABDE3B]/5 dark:to-[#ABDE3B]/10 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Left side indicator */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover/feature:h-8 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>
                      
                      {/* Checkbox Icon */}
                      <div className="relative mr-3 ml-1 flex-shrink-0">
                        {/* Glow effect behind checkbox */}
                        <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover/feature:opacity-30 transition-opacity duration-300"></div>
                        <div className="h-5 w-5 rounded-md border-2 border-[#198341] dark:border-[#ABDE3B] bg-gradient-to-br from-[#198341] to-[#198341] dark:from-[#ABDE3B] dark:to-[#ABDE3B] flex items-center justify-center text-white dark:text-zinc-950 shadow-sm transition-all duration-300 group-hover/feature:scale-110">
                          <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>

                      <span className="relative z-10 text-sm font-medium text-[#2C3C39] dark:text-zinc-300 truncate group-hover/feature:text-[#198341] dark:group-hover/feature:text-[#ABDE3B] group-hover/feature:font-semibold transition-all duration-300">
                        {feature.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Car Technical Details Section — only for car listings */}
      {isCarListing && (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B]">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {t('accordionDetails.details.carDetails.question')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300 mt-8">
            <CarDetailsContent
              data={data?.data}
              type="car"
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Contact & Location Information Section */}
      <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-lg w-full mb-4">
        <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B]">
          {isLoading ? (
            <SectionHeaderSkeleton />
          ) : (
            <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
              {t('tabs.contactLocationInfo')}
            </span>
          )}
        </div>
        <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300 mt-8">
          <CarDetailsContent
            data={data?.data}
            type="contact"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Description & Story Section — only when at least one field has content */}
      {(isLoading || data?.data?.description || data?.data?.story) && (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B]">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {t('tabs.descriptionStory')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300 mt-8">
            <CarDetailsContent
              data={data?.data}
              type="description"
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Product Damages Section — car listings only */}
      {isCarListing && (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B]">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {t('tabs.productDamages')}
              </span>
            )}
          </div>
          {/* <CarDamagesTabContent isLoading={isLoading} carListing={data?.data} /> */}
          <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300 mt-8">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={`accordion-skeleton-${index}`}
                    className="h-12 w-full"
                  />
                ))}
              </div>
            ) : (
              <AccordionProductDetails damages={damages} />
            )}
          </div>
        </div>
      )}

      {/* Product Features Section — car listings only */}
      {isCarListing && (
        <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B]">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">
                {t('tabs.productFeatures')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text dark:text-zinc-300 mt-8">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton
                    key={`features-skeleton-${index}`}
                    className="h-12 w-full"
                  />
                ))}
              </div>
            ) : (
              <AccordionProductSafety features={data?.data?.features} />
            )}
          </div>
        </div>
      )}
    </Box>
  );
};

export default TabsSection;
