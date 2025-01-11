import HeaderOne from '@/components/web/HeaderOne';
import HeaderTow from '@/components/web/HeaderTow';
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
      <HeaderOne /> {/*  check if user login or not  */}
      <HeaderTow />
      {children}
 
    </>
  );
};

export default WebLayout;
