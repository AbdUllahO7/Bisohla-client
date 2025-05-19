"use client"

import { Heart, Home, Layers, LayoutDashboard, Menu, MenuIcon, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { useGetMyProfile } from "@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useSession } from "@/hooks/auth/use-session"
import { profileFormSchema, type ProfileFormValues } from "@/core/entities/models/users/users.dto"
import { useLocale } from "next-intl"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data } = useGetMyProfile()
  const [isClient, setIsClient] = useState(false)
  const session = useSession()
  const locale = useLocale()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()

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
      profileUrl: null,
    },
  })

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update form when profile data is loaded
  useEffect(() => {
    if (data?.data) {
      const profile = data.data
      profileForm.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phoneNumber,
        profileUrl: profile.profileUrl,
        // We don't populate password fields
        password: null,
        passwordConfirmation: null,
      })
    }
  }, [data, profileForm])

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Navigation items
  const navItems = [
    { href: "/userProfile", icon: LayoutDashboard, label: locale === "ar" ? "الرئيسية" : "Dashboard" },
    { href: "/userProfile/Products", icon: Home, label: locale === "ar" ? "سيارات" : "Cars" },
    { href: "/userProfile/Favorites", icon: Heart, label: locale === "ar" ? "المفضلة" : "Favorites" },
    { href: "/userProfile/Notification", icon: Heart, label: locale === "ar" ? "الإشعارات" : "Notifications" },
    { href: "/userProfile/UserInfo", icon: Settings, label: locale === "ar" ? "الإعدادات" : "Settings" },
  ]

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <Button
          className="fixed top-11 left-10 bg-transparent z-[99] md:hidden inline-flex items-center justify-center p-2 rounded-md text-white h transition-all focus:outline-none"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpenMobile(true)}
        >
        <MenuIcon className="h-14 w-14 size-8 text-4xl" />
          <span className="sr-only">Open menu</span>
        </Button>
      )}

      <Sidebar className="" collapsible={isMobile ? "offcanvas" : "icon"} dir={locale === "ar" ? "rtl" : "ltr"}>
        <SidebarHeader className="flex h-14 items-center pt-5 px-4 mt-20 bg-primary" dir="ltr">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold ">{locale === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 bg-primary pt-5">
          <SidebarMenu>
            {navItems.map(({ href, icon: Icon, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    pathname === href ? "bg-primary text-white" : "hover:bg-primary-light"
                  }`}
                  tooltip={label}
                  onClick={() => isMobile && setOpenMobile(false)}
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
              <p className="text-sm font-medium">{session.user.name}</p>
            </div>
          </div>
        </SidebarFooter>

        {!isMobile && <SidebarRail />}
      </Sidebar>
    </>
  )
}
