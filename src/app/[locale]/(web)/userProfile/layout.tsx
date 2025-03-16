"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/web/UserProfilePage/dashboard-sidebar"
import type { PropsWithChildren } from "react"

export default function Dashboard({ children }: PropsWithChildren) {
  return (
        <SidebarProvider>
        {/* Account for the fixed headers (55px + 65px = 120px) */}
        <div className="flex pt-[120px] min-h-screen bg-background w-full" dir="ltr">
            <DashboardSidebar />
            <SidebarInset>{children}</SidebarInset>
        </div>
        </SidebarProvider>
    )
}

