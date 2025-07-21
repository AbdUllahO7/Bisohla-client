'use server';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { getTranslations } from 'next-intl/server';
import { ProfileProvider } from '@/providers/profile.provider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Check authentication status
  const authResult = await checkAuth();
  const t = await getTranslations('homePage');

  // If not authenticated, redirect to sign-in
  if (!authResult.success) {
    redirect('/auth/sign-in');
  }

  return (
    <SidebarProvider className="bg-background">
      <ProfileProvider>
        <div className="min-h-screen flex bg-background w-full">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main content area */}
          <SidebarInset className="flex-1 flex flex-col w-full">
            {/* Dashboard Header */}
            <div className="container">
              <DashboardHeader
                translations={{
                  home: t('headerTow.home'),
                  rent: t('headerTow.rent'),
                  sale: t('headerTow.sale'),
                  join: t('headerTow.join'),
                  BrowseAll: t('headerTow.BrowseAll'),
                  Privacypolicy: t('headerTow.Privacypolicy'),
                }}
              />
            </div>

            {/* Page content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </ProfileProvider>
    </SidebarProvider>
  );
}
