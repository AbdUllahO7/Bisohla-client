'use server'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/web/UserProfilePage/dashboard-sidebar"
import type { PropsWithChildren } from "react"
import { redirect } from 'next/navigation';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import Footer from "@/components/web/UserProfilePage/Footer";
import HeaderOne from "@/components/web/Home/HeaderOne";
import HeaderTow from "@/components/web/Home/HeaderTow";
import { getTranslations } from "next-intl/server";

export default async function Dashboard({ children }: PropsWithChildren) {
    // Check authentication status
    const authResult = await checkAuth();
      const t = await getTranslations("homePage")

    // If not authenticated, redirect to sign-in
    if (!authResult.success) {
        redirect('/auth/sign-in');
    }

    return (
        <SidebarProvider className="bg-primary">
            <div className="min-h-screen flex flex-col bg-white w-full">
                {/* Main content area with sidebar */}
                <HeaderOne/>
                <HeaderTow 
                 translations={{
                      home: t("headerTow.home"),
                      rent: t("headerTow.rent"),
                      sale: t("headerTow.sale"),
                      join: t("headerTow.join"),
                      BrowseAll: t("headerTow.BrowseAll"),
                      Privacypolicy :t("headerTow.Privacypolicy"),
                    }}
                />
                <div className="flex flex-1 bg-primary" dir="ltr">
                    <DashboardSidebar />
                    
                    <SidebarInset className="flex-1 flex flex-col">
                        {/* Content area with proper spacing */}
                        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
                            <div className="max-w-7xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </div>
                

            </div>
        </SidebarProvider>
    )
}
