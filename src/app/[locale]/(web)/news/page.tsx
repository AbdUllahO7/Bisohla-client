import React from 'react';
import { getTranslations } from 'next-intl/server';
import NewsHero from '@/components/web/News/NewsHero';
import NewsPageClient from '@/components/web/News/NewsPageClient';
import { Metadata } from 'next';
import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';

export async function generateMetadata(): Promise<Metadata> {
  return await generateSettingsBasedMetadata('news');
}

export default async function NewsPage() {
  const t = await getTranslations('news');

  return (
    <>
      <NewsHero
        title={t('allNews')}
        description={t('allNewsDescription')}
        subtitle={t('latestNews')}
      />
      <NewsPageClient />
    </>
  );
}
