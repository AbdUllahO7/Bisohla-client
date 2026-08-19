import { ListingStatisticsPage } from '@/components/web/Statistics/ListingStatisticsPage';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export const metadata = {
  title: 'Listing Analytics & Performance | Bishola',
  description: 'View deep performance metrics and visitor trend charts for this listing.',
};

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const listingId = Number(resolvedParams.id);

  return <ListingStatisticsPage listingId={listingId} />;
}
