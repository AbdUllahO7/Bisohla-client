import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return await generateSettingsBasedMetadata('products');
}

const ProductsPageLayout = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

export default ProductsPageLayout;
