import Box from '@/components/box/box';
import AdminNavbar from '@/components/layouts/admin/admin-navbar';
import AdminSidebar from '@/components/layouts/admin/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { allRoutes } from '@/constants/routes.constant';
import { fetchAuth } from '@/lib/fetch-auth';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

const AdminDashboardLayout = async ({ children }: PropsWithChildren) => {
  // Check if user is authenticated and has admin privileges before rendering the layout
  const res = await fetchAuth({
    url: '/auth/check/admin',
    method: 'GET',
  });
  if (!res.success) {
    redirect(allRoutes.home.path);
  }

  return (
    <SidebarProvider>
      <Box className="w-full items-start">
        <AdminSidebar />
        <Box className="w-full flex-col items-start">
          <AdminNavbar />
          {children}
        </Box>
      </Box>
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
