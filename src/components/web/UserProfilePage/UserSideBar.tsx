"use client"

import type React from "react"

import {
    MessageCircle,
    LayoutDashboard,
    Network,
    BarChartIcon as ChartNoAxesCombined,
    Heart,
    User,
    LogOut,
} from "lucide-react"
import { Fragment, JSX } from "react"
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { useRouter, usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface MenuItem {
    id: string
    label: string
    path: string
    icon: JSX.Element
    notifications?: number
}

interface MenuItemsProps {
  setOpen?: (open: boolean) => void
}

const MenuItems: React.FC<MenuItemsProps> = ({ setOpen }) => {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("UserProfile")

  const adminSideBarMenuItems: MenuItem[] = [
    {
      id: "home",
      label: t("SideBar.home"),
      path: "/userProfile/Home",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "products",
      label: t("SideBar.products"),
      path: "/userProfile/Products",
      icon: <Network size={20} />,
    },
    {
      id: "favorites",
      label: t("SideBar.favorites"),
      path: "/userProfile/Favorites",
      icon: <Heart size={20} />,
      notifications: 0,
    },
    {
      id: "messages",
      label: t("SideBar.messages"),
      path: "#",
      icon: <MessageCircle size={20} />,
      notifications: 3,
    },
    {
      id: "userInfo",
      label: t("SideBar.userInfo"),
      path: "/userProfile/UserInfo",
      icon: <User size={20} />,
      notifications: 0,
    },
    {
      id: "logout",
      label: t("SideBar.logout"),
      path: "#",
      icon: <LogOut size={20} />,
      notifications: 0,
    },
  ]

  return (
    <nav className="mt-0 flex flex-col gap-1.5">
      {adminSideBarMenuItems.map((menuItem) => {
        const isActive = pathname === menuItem.path

        return (
          <div
            key={menuItem.id}
            onClick={() => {
              router.push(menuItem.path)
              if (setOpen) setOpen(false)
            }}
            className={cn(
              "relative flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group",
              isActive ? "bg-white text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {/* Active indicator */}
            {isActive && <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />}

            <span
              className={cn(
                "flex items-center justify-center transition-transform duration-200",
                isActive ? "text-white" : "text-white/70 group-hover:text-white",
              )}
            >
              {menuItem.icon}
            </span>

            <span className="flex-1">{menuItem.label}</span>

            {/* Notification badge */}
            {menuItem.notifications && menuItem.notifications > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-primary">
                {menuItem.notifications}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

interface UserSideBarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const UserSideBar: React.FC<UserSideBarProps> = ({ open, setOpen }) => {
  const router = useRouter()
  const locale = useLocale()
  const direction = locale === "ar" ? "rtl" : "ltr"

  return (
    <Fragment>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 border-0">
          <div className="flex flex-col h-full bg-gradient-to-b from-primary to-primary-dark">
            <SheetHeader className="p-6 pb-2">
              <div
                onClick={() => router.push("/userProfile")}
                className="flex cursor-pointer items-center gap-3 transition-transform duration-200 hover:translate-x-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <ChartNoAxesCombined size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">{direction === "ltr" ? "User Panel" : "لوحة المستخدم"}</h1>
              </div>
            </SheetHeader>

            <div className="px-4">
              <div className="h-px w-full bg-white/10" />
            </div>

            <div className="flex-1 px-2">
              <MenuItems setOpen={setOpen} />
            </div>

            <div className="p-4">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-xs text-white/70">
                  {direction === "ltr" ? "Need help with your account?" : "هل تحتاج إلى مساعدة مع حسابك؟"}
                </p>
                <button className="mt-2 w-full rounded-md bg-white/10 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20">
                  {direction === "ltr" ? "Contact Support" : "اتصل بالدعم"}
                </button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col bg-gradient-to-b from-primary to-primary-dark w-72 min-h-[calc(100vh-50px)] mt-[50px] sticky top-[50px]">
        <div className="p-6 pb-2">
          <div
            onClick={() => router.push("/userProfile")}
            className="flex cursor-pointer items-center gap-3 transition-transform duration-200 hover:translate-x-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <ChartNoAxesCombined size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">{direction === "ltr" ? "User Panel" : "لوحة المستخدم"}</h1>
          </div>
        </div>

        <div className="px-4">
          <div className="h-px w-full bg-white/10" />
        </div>

        <div className="flex-1 px-2">
          <MenuItems />
        </div>

        <div className="p-4">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-xs text-white/70">
              {direction === "ltr" ? "Need help with your account?" : "هل تحتاج إلى مساعدة مع حسابك؟"}
            </p>
            <button className="mt-2 w-full rounded-md bg-white/10 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20">
              {direction === "ltr" ? "Contact Support" : "اتصل بالدعم"}
            </button>
          </div>
        </div>
      </aside>
    </Fragment>
  )
}

export default UserSideBar

