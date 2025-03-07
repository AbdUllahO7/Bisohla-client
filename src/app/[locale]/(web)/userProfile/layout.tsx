"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/web/UserProfilePage/dashboard-sidebar"
import { PropsWithChildren } from "react"


export default function Dashboard({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background w-full">
                <DashboardSidebar />
                {children}
            </div>
        </SidebarProvider>
    )
}

