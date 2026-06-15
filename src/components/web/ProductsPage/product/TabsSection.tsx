'use client';

import type React from 'react';
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
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light">
                {t('accordionDetails.details.adsDetails.question')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text mt-8">
            <CarDetailsContent
              data={data?.data}
              type="ads"
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : attributeValues.length > 0 ? (
        <div className="shadow-xl bg-white p-4 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary mb-6">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light">
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

      {/* Car Technical Details Section — only for car listings */}
      {isCarListing && (
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light">
                {t('accordionDetails.details.carDetails.question')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text  mt-8">
            <CarDetailsContent
              data={data?.data}
              type="car"
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Contact & Location Information Section */}
      <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
        <div className="font-cairo font-bold text-primary">
          {isLoading ? (
            <SectionHeaderSkeleton />
          ) : (
            <span className="border-b-2 pb-1 border-primary-light">
              {t('tabs.contactLocationInfo')}
            </span>
          )}
        </div>
        <div className="font-cairo text-[400] text-secondary-text  mt-8">
          <CarDetailsContent
            data={data?.data}
            type="contact"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Description & Story Section — only when at least one field has content */}
      {(isLoading || data?.data?.description || data?.data?.story) && (
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light">
                {t('tabs.descriptionStory')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text mt-8">
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
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light">
                {t('tabs.productDamages')}
              </span>
            )}
          </div>
          {/* <CarDamagesTabContent isLoading={isLoading} carListing={data?.data} /> */}
          <div className="font-cairo text-[400] text-secondary-text mt-8">
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
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
          <div className="font-cairo font-bold text-primary">
            {isLoading ? (
              <SectionHeaderSkeleton />
            ) : (
              <span className="border-b-2 pb-1 border-primary-light">
                {t('tabs.productFeatures')}
              </span>
            )}
          </div>
          <div className="font-cairo text-[400] text-secondary-text mt-8">
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
