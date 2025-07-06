"use client"

import Image from "next/image"
import { Button } from "../../ui/button"
import Box from "../../box/box"
import LocaleSwitcher from "../../local/LocalSwitcher"
import { Link } from "@/i18n/routing"
import { UserCheck2Icon, LogOut, Plus, Menu, X, Bell } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/auth/use-session"
import { useTranslations, useLocale } from "next-intl"
import { useEffect, useState, useRef } from "react"
import { deleteSession } from "@/lib/session"
import { logoutAction } from "@/app/[locale]/auth/actions"

const HeaderOne = () => {
  const t = useTranslations("homePage")
  const locale = useLocale()
  const isRTL = locale === 'ar'
  const { user, accessToken, isLoading, invalidateSession, refetchSession } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isAuthChanging, setIsAuthChanging] = useState(false)
  const prevAuthState = useRef<boolean | null>(null)

  // Determine if user is authenticated
  const isAuthenticated = !!accessToken && !!user

  // Track authentication state changes
  useEffect(() => {
    // Skip first render when prevAuthState is null
    if (prevAuthState.current !== null && prevAuthState.current !== isAuthenticated) {
      setIsAuthChanging(true)
      
      // Reset the changing state after a short delay
      const timer = setTimeout(() => {
        setIsAuthChanging(false)
      }, 1000) // Adjust timing as needed
      
      return () => clearTimeout(timer)
    }
    
    // Update previous state
    prevAuthState.current = isAuthenticated
  }, [isAuthenticated])

  // Listen for logout completion to ensure skeleton is hidden
  useEffect(() => {
    const handleLogoutSuccess = () => {
      setTimeout(() => {
        setIsAuthChanging(false)
      }, 300)
    }

    window.addEventListener('logout-success', handleLogoutSuccess)
    return () => window.removeEventListener('logout-success', handleLogoutSuccess)
  }, [])

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Refetch session on component mount and when route changes
  useEffect(() => {
    if (isClient) {
      refetchSession()
    }
  }, [isClient, refetchSession])

  // Listen for login success events
  useEffect(() => {
    const handleLoginSuccess = () => {
      invalidateSession()
      refetchSession()
    }

    window.addEventListener('login-success', handleLoginSuccess)
    return () => window.removeEventListener('login-success', handleLoginSuccess)
  }, [invalidateSession, refetchSession])

  // Handle logout
  const handleLogout = async () => {
    try {
      await deleteSession()
      invalidateSession()
      window.dispatchEvent(new CustomEvent('logout-success'))
      window.dispatchEvent(new CustomEvent('auth-changed'))
      await logoutAction()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  // Show loading state during hydration, session loading, or auth changing
  if (!isClient || isLoading || isAuthChanging) {
    return (
      <Box className="flex justify-between items-center py-3  w-full px-4 ≈ß border-b border-gray-100 bg-white">
        {/* Logo Skeleton */}
        <div className="flex items-center">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse sm:h-6 sm:w-28"></div>
        </div>

        {/* Right side skeleton */}
        <div className="flex items-center gap-2  justify-start w-full container">
          {/* Desktop skeleton */}
          <div className="hidden md:flex items-center gap-3 justify-end  w-full">
            <div className="h-9 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          
          {/* Mobile skeleton */}
          <div className="flex md:hidden items-center gap-2 justify-start container  w-full">
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </Box>
    )
  }

  return (
    <>
      <Box className="flex justify-between items-center py-3 w-full px-4 container border-b border-gray-100 bg-white">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/assets/images/logo/bishola.png"
            alt="Logo"
            width={100}
            height={24}
            className="h-5 w-auto sm:h-6"
            priority
            onError={(e) => {
              console.error("Failed to load logo image")
              e.currentTarget.style.display = "none"
            }}
          />
        </div>

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Add Listing Button */}
          <Link href="/products/AddProducts">
            <Button
              variant="default"
              className="text-white rounded-full h-9 px-4 text-sm font-medium flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <span className="whitespace-nowrap">{t("headerOne.adsButton")}</span>
              <Plus className="w-4 h-4" />
            </Button>
          </Link>

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <Link href="/auth/sign-in">
              <Button
                variant="outline"
                className="text-emerald-600 bg-transparent rounded-full h-9 px-4 border border-emerald-600 text-sm font-medium flex items-center gap-2 hover:bg-primary-light"
                size="sm"
              >
                <span className="whitespace-nowrap">{t("headerOne.loginButton")}</span>
                <Image
                  src="/assets/icons/user.png"
                  alt="User Icon"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/userProfile">
                <Button
                  variant="outline"
                  className="text-primarybg-transparent rounded-full h-9 px-4 border border-primary text-sm font-medium flex items-center gap-2 hover:bg-primary-light"
                  size="sm"
                >
                  <span className="whitespace-nowrap truncate max-w-[120px]">
                    {user?.name || t("headerOne.profileButton")}
                  </span>
                  <UserCheck2Icon className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-red-600 bg-transparent rounded-full h-9 px-4 border border-red-300 text-sm font-medium flex items-center gap-2 hover:bg-red-900"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span className="whitespace-nowrap">{t("headerOne.logoutButton")}</span>
              </Button>
            </div>
            
          )}

          {/* Notification Icon */}
          {isAuthenticated && (
            <div className="flex-shrink-0">
              <NotificationDropdown />
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex-shrink-0">
            <LocaleSwitcher />
          </div>
        </div>

        {/* Mobile Actions - Compact design */}
        <div className="flex md:hidden items-center gap-2">
      {isAuthenticated && (
            <div className="flex-shrink-0">
              <NotificationDropdown />
            </div>
          )}

           <Link href="/products/AddProducts">
            <Button
              variant="default"
              className="text-white rounded-full h-9 px-4 text-sm font-medium flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
    
          {/* Language Switcher - Minimal */}
          <div className="flex-shrink-0">
            <LocaleSwitcher />
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 rounded-lg text-gray-600"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </Box>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300`}>
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("headerOne.menuTitle") || "القائمة"}
              </h2>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-4">
              {/* Add Listing Button */}
              <Link href="/products/AddProducts" onClick={() => setShowMobileMenu(false)}>
                <Button
                  variant="default"
                  className="w-full text-white rounded-lg h-12 text-base font-medium flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t("headerOne.adsButton")}</span>
                </Button>
              </Link>

              {/* Auth Section */}
              <div className="space-y-3">
                {!isAuthenticated ? (
                  <Link href="/auth/sign-in" onClick={() => setShowMobileMenu(false)}>
                    <Button
                      variant="outline"
                      className="w-full text-emerald-600 bg-transparent rounded-lg h-12 border border-emerald-600 text-base font-medium flex items-center justify-center gap-3 hover:bg-emerald-50"
                    >
                      <Image
                        src="/assets/icons/user.png"
                        alt="User Icon"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      <span>{t("headerOne.loginButton")}</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <UserCheck2Icon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.name || t("headerOne.profileButton")}
                          </p>
                         
                        </div>
                      </div>
                    </div>

                    {/* Profile Button */}
                    <Link href="/userProfile" onClick={() => setShowMobileMenu(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-emerald-600 bg-transparent rounded-lg h-11 border border-emerald-600 text-base font-medium flex items-center justify-center gap-3 hover:bg-emerald-50"
                      >
                        <UserCheck2Icon className="w-5 h-5" />
                        <span>{t("headerOne.profileButton")}</span>
                      </Button>
                    </Link>

                    {/* Logout Button */}
                    <Button
                      variant="outline"
                      className="w-full text-red-600 bg-transparent rounded-lg h-11 border border-red-300 text-base font-medium flex items-center justify-center gap-3 hover:bg-red-50"
                      onClick={() => {
                        setShowMobileMenu(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t("headerOne.logoutButton")}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default HeaderOne