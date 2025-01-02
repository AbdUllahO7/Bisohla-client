import MainAppBar from '@/components/layouts/web/main-app-bar';
import { PropsWithChildren } from 'react';

const WebLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <MainAppBar />
      {children}
    </>
  );
};

export default WebLayout;
