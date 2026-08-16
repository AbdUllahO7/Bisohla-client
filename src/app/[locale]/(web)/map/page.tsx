import React from 'react';
import { Metadata } from 'next';
import { InteractiveMapContainer } from '@/components/web/Map/InteractiveMapContainer';
import { getLocale, getTranslations } from 'next-intl/server';

interface MapPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ typeId?: string }>;
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  return {
    title: isRtl ? 'خريطة الإعلانات التفاعلية | بسهولة' : 'Interactive Listing Map | Bishola',
    description: isRtl
      ? 'استكشف السيّارات والعقارات والإعلانات المباشرة على الخريطة التفاعلية في كافة المحافظات السورية'
      : 'Explore vehicles, properties, and live listings on the interactive map across Syria',
  };
}

export default async function MapPage({ params, searchParams }: MapPageProps) {
  const { locale } = await params;
  const { typeId } = await searchParams;

  const parsedTypeId = typeId ? parseInt(typeId, 10) : undefined;

  return (
    <main className="w-full h-full min-h-screen bg-gray-50 dark:bg-zinc-950">
      <InteractiveMapContainer
        initialTypeId={parsedTypeId}
        locale={locale}
      />
    </main>
  );
}
