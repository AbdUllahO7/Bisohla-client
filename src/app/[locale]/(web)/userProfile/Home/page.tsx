"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  User,
  Clock,
  Mail,
  Phone,
  Heart,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetMyProfile } from "@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"

const UserHomePage = () => {
  // Language state
  const t = useTranslations('UserProfile.home')
  const locale = useLocale()
  const [direction, setDirection] = useState("ltr")
  const [isClient, setIsClient] = useState(false)

  // Use the hook to fetch user profile data
  const { data, isLoading, error } = useGetMyProfile()
  const userProfile = data?.data

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setDirection(locale === "ar" ? "rtl" : "ltr")
  }, [locale])

  // Format date with proper timezone handling
  const formatDate = (dateString: string) => {
    if (!dateString || !isClient) return ""
    
    try {
      return new Date(dateString).toLocaleDateString(
        locale === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC" // Ensure consistent timezone
        }
      )
    } catch (error) {
      console.error("Date formatting error:", error)
      return dateString
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Calculate account age in months
  const getAccountAge = () => {
    if (!userProfile?.createdAt || !isClient) return 0
    
    try {
      return Math.floor(
        (new Date().getTime() - new Date(userProfile.createdAt).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
      )
    } catch (error) {
      console.error("Account age calculation error:", error)
      return 0
    }
  }

  // Calculate engagement percentage
  const getEngagementPercentage = () => {
    if (!userProfile || !isClient) return 0
    
    const totalListings = (userProfile.totalForSellCarListings || 0) + (userProfile.totalForRentCarListings || 0)
    const favorites = userProfile.totalFavoriteCarListings || 0
    
    if (totalListings === 0) return 0
    
    return Math.round((favorites / totalListings) * 100)
  }

  // Show loading skeleton on server-side and initial client render
  if (isLoading || !isClient) {
    return (
      <div className="flex h-full w-full flex-col">
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl h-full">
              <div className="grid gap-4">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-6 w-96" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-36" />
                  ))}
                </div>
                <Skeleton className="h-80" />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            {t('errorLoading')}
          </h2>
          <p className="mt-2">{t('errorMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-col mx-auto">
      {/* Main Content */}
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto container h-full" dir={direction}>
            <div className="grid grid-rows-[auto_auto_1fr] h-full gap-6">
              <div className="mb-2">
                <h1 className="text-3xl font-bold">
                  {t('welcome')}, {userProfile?.name || ""}
                </h1>
                <p className="text-muted-foreground">{t('overview')}</p>
              </div>

              {/* User Profile Card */}
              <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <Avatar className="h-24 w-24 border-4 border-[#ABDE3B]/20">
                      <AvatarImage
                        src={
                          userProfile?.profileUrl || `/placeholder.svg?height=96&width=96&query=${encodeURIComponent(userProfile?.name || "User")}`
                        }
                        alt={userProfile?.name || "User"}
                      />
                      <AvatarFallback className="text-2xl bg-[#198341] text-white">
                        {getUserInitials(userProfile?.name || "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-4 flex-1">
                      <div>
                        <h2 className="text-2xl font-bold">{userProfile?.name || ""}</h2>
                        <div className="flex flex-col sm:flex-row sm:gap-6 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{userProfile?.email || ""}</span>
                          </div>
                          {userProfile?.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{userProfile.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-[#ABDE3B]" />
                          <span className="text-sm">
                            {t('memberSince')} {formatDate(userProfile?.createdAt || "")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-[#ABDE3B]" />
                          <span className="text-sm">
                            {t('lastUpdated')} {formatDate(userProfile?.updatedAt || "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Stats Cards */}
              <div className="grid gap-4 h-fit md:grid-cols-3">
                <Card className="bg-white h-fit shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">{t('carsForSale')}</CardTitle>
                    <CardDescription>{t('activeListings')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userProfile?.totalForSellCarListings || 0}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <ArrowUpRight className="mr-1 h-4 w-4 text-[#ABDE3B]" />
                      <span className="text-[#ABDE3B]">{t('activeListings')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white h-fit shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">{t('carsForRent')}</CardTitle>
                    <CardDescription>{t('activeListings')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userProfile?.totalForRentCarListings || 0}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <ArrowUpRight className="mr-1 h-4 w-4 text-[#ABDE3B]" />
                      <span className="text-[#ABDE3B]">{t('activeListings')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white h-fit shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">{t('favorites')}</CardTitle>
                    <CardDescription>{t('savedListings')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userProfile?.totalFavoriteCarListings || 0}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <Heart className="mr-1 h-4 w-4 text-rose-500" />
                      <span className="text-rose-500">{t('savedListings')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Summary */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>{t('activitySummary')}</CardTitle>
                  <CardDescription>{t('recentActivity')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-[#2C3C39]/5">
                      <TrendingUp className="h-8 w-8 text-[#ABDE3B] mb-2" />
                      <h3 className="text-lg font-semibold">{t('totalListings')}</h3>
                      <p className="text-3xl font-bold">
                        {(userProfile?.totalForSellCarListings || 0) + (userProfile?.totalForRentCarListings || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('combinedSaleRental')}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-[#2C3C39]/5">
                      <User className="h-8 w-8 text-[#ABDE3B] mb-2" />
                      <h3 className="text-lg font-semibold">{t('accountAge')}</h3>
                      <p className="text-3xl font-bold">{getAccountAge()}</p>
                      <p className="text-sm text-muted-foreground">{t('months')}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-[#2C3C39]/5">
                      <DollarSign className="h-8 w-8 text-[#ABDE3B] mb-2" />
                      <h3 className="text-lg font-semibold">{t('engagement')}</h3>
                      <p className="text-3xl font-bold">{getEngagementPercentage()}%</p>
                      <p className="text-sm text-muted-foreground">{t('favoritesRatio')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}

export default UserHomePage