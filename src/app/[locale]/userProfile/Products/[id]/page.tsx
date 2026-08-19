import { MyListingDetailPage } from '@/components/web/MyListings/MyListingDetailPage';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export const metadata = {
  title: 'Listing Management | Bishola',
  description: 'Manage publication status, map visibility, and view specifications.',
};

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const listingId = Number(resolvedParams.id);

  return <MyListingDetailPage listingId={listingId} />;
}
