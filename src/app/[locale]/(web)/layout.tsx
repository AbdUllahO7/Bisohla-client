import HeaderOne from '@/components/web/Home/HeaderOne';
import HeaderTow from '@/components/web/Home/HeaderTow';
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

const WebLayout = async({ children }: PropsWithChildren) => {
  const t = await getTranslations('homePage');
  return (
    <div >
      <HeaderOne /> {/*  check if user login or not  */}
      <HeaderTow   translations={{
          home: t('headerTow.home'),
          rent: t('headerTow.rent'),
          sale: t('headerTow.sale'),
          news: t('headerTow.news'),
          join: t('headerTow.join'),

        }}/>
      {children}
    </div>
  );
};

export default WebLayout;
