// HeaderTwo.tsx - Simplified mobile design
"use client"
import { useSession } from "@/hooks/auth/use-session"
import type { HeaderTowProps } from "@/types/homePageTypes"
import { MenuIcon, ChevronDown } from "lucide-react"
import { Link } from "@/i18n/routing"
import type React from "react"
import { useState } from "react"
import { useLocale } from "next-intl"
import { Button } from "../../ui/button"

const HeaderTwo: React.FC<HeaderTowProps> = ({ translations }) => {
  const [showMobileNav, setShowMobileNav] = useState(false)
  const session = useSession()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const navItems = [
    { href: "/", label: translations.home },
    { href: "/rentProducts", label: translations.rent },
    { href: "/saleProducts", label: translations.sale },
    { href: "/products", label: translations.BrowseAll },
    { href: "/Privacypolicy", label: translations.Privacypolicy },
  ]

  return (
    <div className="bg-primary text-white relative">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="px-4 py-3">
          <nav className="flex justify-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-emerald-100 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            {!session.user.id && (
              <Link
                href="/auth/sign-in"
                className="text-white hover:text-emerald-100 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                {translations.join}
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-emerald-700 flex items-center justify-between py-2"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            <span className="flex items-center gap-2">
              <MenuIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{isRTL ? 'التصفح' : 'Browse'}</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileNav ? 'rotate-180' : ''}`} />
          </Button>

          {/* Mobile Dropdown */}
          {showMobileNav && (
            <div className="mt-2 bg-emerald-700 rounded-lg overflow-hidden">
              <nav className="py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-white hover:bg-emerald-800 transition-colors duration-200 text-sm"
                    onClick={() => setShowMobileNav(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {!session.user.id && (
                  <Link
                    href="/auth/sign-in"
                    className="block px-4 py-3 text-white hover:bg-emerald-800 transition-colors duration-200 text-sm"
                    onClick={() => setShowMobileNav(false)}
                  >
                    {translations.join}
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeaderTwo