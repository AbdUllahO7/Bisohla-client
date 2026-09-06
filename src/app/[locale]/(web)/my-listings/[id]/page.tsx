import { redirect } from '@/i18n/routing';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params;
  redirect({ href: `/userProfile/Products/${id}`, locale });
  return null;
}
