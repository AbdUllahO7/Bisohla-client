"use client"

import {
  Heart,
  Home,
  Inbox,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useGetMyProfile } from "@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { profileFormSchema, ProfileFormValues } from "@/app/[locale]/(web)/userProfile/UserInfo/page"
import { useEffect, useState } from "react"
import { useSession } from "@/hooks/auth/use-session"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data, isLoading: isProfileLoading, error, refetch } = useGetMyProfile();
    const [isClient, setIsClient] = useState(false);
    const session = useSession()
 // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: null,
      bio: "",
      password: null,
      passwordConfirmation: null,
      profileUrl: null
    },
  });
  
  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Update form when profile data is loaded
  useEffect(() => {
    if (data?.data) {
      const profile = data.data;
      profileForm.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phoneNumber,
        profileUrl: profile.profileUrl,
        // We don't populate password fields
        password: null,
        passwordConfirmation: null,
      });
    }
  }, [data, profileForm]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Sidebar className="" collapsible='icon'>
      <SidebarHeader className="flex h-14 items-center px-4 mt-20 bg-primary" dir="ltr">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 bg-primary">
        <SidebarMenu>
          {[
            { href: "/userProfile", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/userProfile/Products", icon: Home, label: "Products" },
            { href: "/userProfile/Favorites", icon: Heart, label: "Favorites" },
            { href: "/userProfile/Notification", icon: Heart, label: "Notifications" },
            { href: "/userProfile/UserInfo", icon: Settings, label: "Settings" },
          ].map(({ href, icon: Icon, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  pathname === href ? "bg-primary text-white" : "hover:bg-primary-light"
                }`}
              >
                <Link href={href}>
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
              
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-primary">
        <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 border-2 border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
                    {profileForm.getValues("profileUrl") ? (
                      <AvatarImage src={profileForm.getValues("profileUrl") ?? undefined} alt="Profile" />
                    ) : (
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(profileForm.getValues("name"))}
                    </AvatarFallback>
                  </Avatar>
          <div>
            <p className="text-sm font-medium"> {session.user.name}</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
