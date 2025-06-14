'use server'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/web/UserProfilePage/dashboard-sidebar"
import type { PropsWithChildren } from "react"
import { redirect } from 'next/navigation';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';

export default async function Dashboard({ children }: PropsWithChildren) {


   // Check authentication status
    const authResult = await checkAuth();
    
    // The logic was inverted - if NOT successful, delete session and redirect
    if (!authResult.success) {
        redirect('/auth/sign-in');
    }

  return (
    <SidebarProvider>
      {/* Account for the fixed headers (55px + 65px = 120px) */}
      <div className="flex pt-[20px] bg-background w-full" dir="ltr">
        <DashboardSidebar />
        <SidebarInset className="min-h-screen">
          <div className="">{children}</div>
          
        </SidebarInset>

      </div>

    </SidebarProvider>
  )
}
