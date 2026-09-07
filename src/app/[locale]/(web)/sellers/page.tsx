import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SellersDirectory from '@/components/web/Sellers/SellersDirectory';

interface SellersPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: SellersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'sellers.list' });

  return {
    title: `${t('title')} | Bishola`,
    description: t('empty_subtitle'),
  };
}

export default async function SellersPage() {
  return <SellersDirectory />;
}
