import { SavedAddressForm } from '@/components/web/SavedAddresses/SavedAddressForm';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function EditSavedAddressPage({ params }: PageProps) {
  const { id } = await params;
  return <SavedAddressForm addressId={Number(id)} />;
}
