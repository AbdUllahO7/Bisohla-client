"use client"

import Image from "next/image"
import { Button } from "../../ui/button"
import Box from "../../box/box"
import LocaleSwitcher from "../../local/LocalSwitcher"
import { Link } from "@/i18n/routing"
import { UserCheck2Icon, LogOut } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "@/hooks/auth/use-session"
import { useCheckAuth } from "@/core/infrastructure-adapters/use-actions/auth/auth.use-actions"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { deleteSession } from "@/lib/session"

const HeaderOne = () => {
  const t = useTranslations("homePage")
  const { user, accessToken, refetchSession, isLoading } = useSession()
  const authResult = useCheckAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Refresh session on mount and route changes
  useEffect(() => {
    refetchSession()
  }, [refetchSession, pathname]) // Added pathname dependency

  // Listen for storage events (useful if session is stored in localStorage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session' || e.key === 'accessToken') {
        refetchSession()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [refetchSession])

  // Listen for focus events to refresh session
  useEffect(() => {
    const handleFocus = () => {
      refetchSession()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchSession])

  // Periodic session check (optional - every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSession()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [refetchSession])

  // Handle logout
  const handleLogout = async () => {
    try {
      await deleteSession()
      // Force immediate session refresh
      await refetchSession()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Box className="flex justify-between items-center py-1.5 w-full px-2 sm:px-3 md:px-4">
      {/* Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
        <Image
          src="/assets/images/logo/bishola.png"
          alt="Logo"
          width={500}
          height={500}
          className="min-w-[60px] min-h-[14px] w-[60px] h-[14px] xs:w-[70px] xs:h-[16px] sm:w-[90px] sm:h-[20px] lg:w-[100px] lg:h-[22px]"
          priority
          onError={(e) => {
            console.error("Failed to load logo image")
            e.currentTarget.style.display = "none"
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-3">
        {/* Add Listing Button */}
        <Box className="flex-shrink-0">
          <Link href="/products/AddProducts">
            <Button
              variant="default"
              className="text-white rounded-full h-6 sm:h-7 lg:h-8 px-1.5 sm:px-2 md:px-3 text-[9px] xs:text-[10px] sm:text-xs flex items-center gap-0.5"
              size="sm"
            >
              <span className="whitespace-nowrap">{t("headerOne.adsButton")}</span>
              <Image
                src="/assets/icons/Glyph.png"
                alt="Glyph Icon"
                width={12}
                height={12}
                className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"
              />
            </Button>
          </Link>
        </Box>

        {/* Login/Profile/Logout Button */}
        <Box className="flex-shrink-0">
          {isClient && !accessToken ? (
            <Link href="/auth/sign-in">
              <Button
                variant="default"
                className="text-primary bg-transparent shadow-none rounded-full h-6 sm:h-7 lg:h-8 px-1.5 sm:px-2 md:px-3 border border-primary text-[9px] xs:text-[10px] sm:text-xs flex items-center gap-0.5"
                size="sm"
              >
                <span className="whitespace-nowrap">{t("headerOne.loginButton")}</span>
                <Image
                  src="/assets/icons/user.png"
                  alt="User Icon"
                  width={12}
                  height={12}
                  className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4"
                />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
              <Link href="/userProfile">
                <Button
                  variant="default"
                  className="text-primary bg-transparent shadow-none rounded-full h-6 sm:h-7 lg:h-8 px-1.5 sm:px-2 md:px-3 border border-primary text-[9px] xs:text-[10px] sm:text-xs flex items-center gap-0.5"
                  size="sm"
                >
                  <span className="hidden xs:inline whitespace-nowrap truncate max-w-[40px] xs:max-w-[50px] sm:max-w-[70px] md:max-w-[90px] lg:max-w-none">
                    {t("headerOne.profileButton")}
                    {user?.name && (
                      <>
                        {" / "}
                        <span className="font-medium">{user.name}</span>
                      </>
                    )}
                  </span>
                  <span className="xs:hidden">{t("headerOne.profileButton")}</span>
                  <UserCheck2Icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-primary bg-transparent shadow-none rounded-full h-6 sm:h-7 lg:h-8 px-1.5 sm:px-2 md:px-3 border border-primary text-[9px] xs:text-[10px] sm:text-xs flex items-center gap-0.5"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="whitespace-nowrap">{t("headerOne.logoutButton")}</span>
              </Button>
            </div>
          )}
        </Box>

        {/* Notification Icon - Only show when authenticated */}
        {isClient && accessToken && (
          <div className="flex-shrink-0 scale-75 xs:scale-85 sm:scale-90 lg:scale-100">
            <NotificationDropdown />
          </div>
        )}

        {/* Language Switcher */}
        <div className="flex-shrink-0 scale-75 xs:scale-85 sm:scale-90 lg:scale-100">
          <LocaleSwitcher />
        </div>
      </div>
    </Box>
  )
}

export default HeaderOne