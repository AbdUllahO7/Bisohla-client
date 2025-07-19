import { PropsWithChildren } from 'react';

interface ProductDetailsLayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

const ProductDetailsLayout = ({ children }: ProductDetailsLayoutProps) => {
  return <div>{children}</div>;
};

export default ProductDetailsLayout;
