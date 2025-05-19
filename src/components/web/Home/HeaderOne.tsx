"use client"
import Image from "next/image"
import { Button } from "../../ui/button"
import Box from "../../box/box"
import LocaleSwitcher from "../../local/LocalSwitcher"
import { Link } from "@/i18n/routing"
import { UserCheck2Icon } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/auth/use-session"
import { useCheckAuth } from "@/core/infrastructure-adapters/use-actions/auth/auth.use-actions"
import { useTranslations } from "next-intl"

const HeaderOne = () => {
  const t = useTranslations("homePage")
  const payload = useSession()
  const authResult = useCheckAuth()
  const router = useRouter()

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
            // Fallback to text if image fails to load
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

        {/* Login/Profile Button */}
        <Box className="flex-shrink-0">
          {!authResult ? (
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
            <Link href="/userProfile">
              <Button
                variant="default"
                className="text-primary bg-transparent shadow-none rounded-full h-6 sm:h-7 lg:h-8 px-1.5 sm:px-2 md:px-3 border border-primary text-[9px] xs:text-[10px] sm:text-xs flex items-center gap-0.5"
                size="sm"
              >
                <span className="hidden xs:inline whitespace-nowrap truncate max-w-[40px] xs:max-w-[50px] sm:max-w-[70px] md:max-w-[90px] lg:max-w-none">
                  {t("headerOne.profileButton")}
                  {payload?.user.name && (
                    <>
                      {" / "}
                      <span className="font-medium">{payload.user.name}</span>
                    </>
                  )}
                </span>
                <span className="xs:hidden">{t("headerOne.profileButton")}</span>
                <UserCheck2Icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              </Button>
            </Link>
          )}
        </Box>

        {/* Notification Icon - Only show when authenticated */}
        {authResult && (
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
