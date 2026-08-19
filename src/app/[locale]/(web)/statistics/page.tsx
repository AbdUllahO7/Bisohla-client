import { redirect } from '@/i18n/routing';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  redirect({ href: '/userProfile/Statistics', locale });
}
