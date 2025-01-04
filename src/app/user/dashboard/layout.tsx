import { allRoutes } from '@/constants/routes.constant';
import { fetchAuth } from '@/lib/fetch-auth';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

const UserDashboardLayout = async ({ children }: PropsWithChildren) => {
  const res = await fetchAuth({
    url: '/auth/check/user',
    method: 'GET',
  });
  if (!res.success) {
    redirect(allRoutes.home.path);
  }

  return <>{children}</>;
};

export default UserDashboardLayout;
