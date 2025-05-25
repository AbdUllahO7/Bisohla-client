"use client"
import { useSession } from "@/hooks/auth/use-session"
import type { HeaderTowProps } from "@/types/homePageTypes"
import { MenuIcon, Home, Calendar, ShoppingBag, Grid3X3, Shield, LogIn, User, ChevronDown, X } from "lucide-react"
import { Link } from "@/i18n/routing"
import type React from "react"
import { useMenuToggle } from "./useMenuToggle"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const HeaderTow: React.FC<HeaderTowProps> = ({ translations }) => {
  const { isOpen, setIsOpen, toggleMenu } = useMenuToggle()
  const session = useSession()
  const locale = useLocale()
  const router = useRouter()

  const navigationItems = [
    {
      href: "/",
      label: translations.home,
      icon: Home,
      color: "text-blue-200 group-hover:text-blue-100",
    },
    {
      href: "/rentProducts",
      label: translations.rent,
      icon: Calendar,
      color: "text-green-200 group-hover:text-green-100",
    },
    {
      href: "/saleProducts",
      label: translations.sale,
      icon: ShoppingBag,
      color: "text-orange-200 group-hover:text-orange-100",
    },
    {
      href: "/products",
      label: translations.BrowseAll,
      icon: Grid3X3,
      color: "text-purple-200 group-hover:text-purple-100",
    },
    {
      href: "/Privacypolicy",
      label: translations.Privacypolicy,
      icon: Shield,
      color: "text-red-200 group-hover:text-red-100",
    },
  ]

  return (
    <nav className="bg-gradient-to-r  text-white relative shadow-lg border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center md:justify-center xs:justify-between h-12 sm:h-14">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1 lg:space-x-2">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex items-center gap-2 hover:bg-white/10 transition-all duration-300 px-3 py-2 text-sm rounded-lg hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/20"
                  >
                    <IconComponent className={`h-4 w-4 transition-colors duration-300 ${item.color}`} />
                    <span className="font-medium text-white/90 group-hover:text-white transition-colors duration-300">
                      {item.label}
                    </span>
                    {/* Subtle indicator dot */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/0 group-hover:bg-white/60 rounded-full transition-all duration-300" />
                  </Link>
                )
              })}

  


            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden mt-5">
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 transition-all duration-300 p-2 rounded-lg border border-transparent hover:border-white/20 backdrop-blur-sm"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5 transition-transform duration-300 rotate-0" />
              ) : (
                <MenuIcon className="h-5 w-5 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 visible" : "max-h-0 opacity-0 invisible overflow-hidden"
        }`}
      >
        <div className="bg-gradient-to-b border-white/10 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map((item, index) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20"
                >
                  <IconComponent className={`h-5 w-5 transition-colors duration-300 ${item.color}`} />
                  <span className="font-medium text-white/90 group-hover:text-white transition-colors duration-300">
                    {item.label}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/40 ml-auto group-hover:text-white/60 transition-colors duration-300" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </nav>
  )
}

export default HeaderTow
