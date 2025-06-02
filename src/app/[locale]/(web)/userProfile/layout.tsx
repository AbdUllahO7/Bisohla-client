"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/web/UserProfilePage/dashboard-sidebar"
import { useCheckAuth } from "@/core/infrastructure-adapters/use-actions/auth/auth.use-actions";
import type { PropsWithChildren } from "react"
import { redirect } from 'next/navigation';

export default function Dashboard({ children }: PropsWithChildren) {


     const authResult =   useCheckAuth();
      console.log("authResult", authResult)
      // The logic was inverted - if NOT successful, delete session and redirect
      if (!authResult.data) {
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
