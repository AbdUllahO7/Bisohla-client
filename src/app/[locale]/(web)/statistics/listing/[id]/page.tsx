import { ListingStatisticsPage } from '@/components/web/Statistics/ListingStatisticsPage';

export const metadata = {
  title: 'Listing Statistics | Bishola',
  description: 'Detailed analytics and visitor trends for your listing on Bishola.',
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingStatisticsPage listingId={Number(id)} />;
}
