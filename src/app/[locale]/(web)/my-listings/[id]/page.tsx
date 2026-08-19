import { MyListingDetailPage } from '@/components/web/MyListings/MyListingDetailPage';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export const metadata = {
  title: 'Listing Management | Bishola',
  description: 'Manage listing details, visibility, and status on Bishola.',
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <MyListingDetailPage listingId={Number(id)} />;
}
