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

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="">
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
            { href: "#1", icon: Users, label: "Customers" },
            { href: "#2", icon: Inbox, label: "Inbox", badge: 3 },
            { href: "#3", icon: MessageSquare, label: "Messages" },
            { href: "/userProfile/UserInfo", icon: Settings, label: "Settings" },
          ].map(({ href, icon: Icon, label, badge }) => (
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
                  {badge && (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-primary">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
