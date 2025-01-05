import MainAppBar from '@/components/layouts/web/main-app-bar';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PropsWithChildren } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('homePage');

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

const WebLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <MainAppBar />
      {children}
    </>
  );
};

export default WebLayout;
