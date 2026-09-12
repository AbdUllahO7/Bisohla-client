'use client';

import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import Box from '@/components/ui/box';
import { Skeleton } from '@/components/ui/skeleton';
import CarDetailsContent from './Tabs/CarDetailsContent';
import ListingAttributeSections from './ListingAttributeSections/ListingAttributeSections';
import type { DisplaySection } from '@/lib/listing-attributes/attribute-sections/attribute-sections';

interface TabsSectionProps {
  data?: { data?: any };
  isLoading?: boolean;
  /** Schema-driven sections built server-side; renders every attribute of every listing type. */
  attributeSections: DisplaySection[];
  listingTypeSlug?: string | null;
}

const TabsSection: React.FC<TabsSectionProps> = ({ data, isLoading = false, attributeSections, listingTypeSlug }) => {
  const t = useTranslations('product');

  const SectionHeaderSkeleton = () => (
    <div className="mb-2">
      <Skeleton className="h-6 w-48" />
    </div>
  );

  return (
    <Box variant="column" className="justify-start items-start w-full">
      <Tabs defaultValue="account" className="flex-wrap">
        <TabsContent value="productDetails"></TabsContent>
        <TabsContent value="productInfo"></TabsContent>
        <TabsContent value="location"></TabsContent>
        <TabsContent value="adsInfo" className=""></TabsContent>
      </Tabs>

      {/* Every section of the listing type's schema, in schema order */}
      <ListingAttributeSections sections={attributeSections} listingTypeSlug={listingTypeSlug} />

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

    </Box>
  );
};

export default TabsSection;
