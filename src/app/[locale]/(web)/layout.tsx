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
      <div className="fixed top-0 z-[20] w-full bg-white shadow-md">
        <HeaderOne />
      </div>

    {/* HeaderTwo */}
    <div className="fixed top-[48px] z-[20]  w-full bg-primary shadow-md">
      <HeaderTow   translations={{
              home: t('headerTow.home'),
              rent: t('headerTow.rent'),
              sale: t('headerTow.sale'),
              news: t('headerTow.news'),
              join: t('headerTow.join'),

            }}/>      
    </div>
    {/* Spacer for HeaderTwo height */}
    <div className="h-[65px]"></div>
      {children}
    </div>
  );
};

export default WebLayout;
