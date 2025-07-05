// MobileMenu.tsx - Simplified mobile menu
"use client"
import { Link } from "@/i18n/routing"
import { X } from "lucide-react"
import { useLocale } from "next-intl"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  translations: {
    home: string
    rent: string
    sale: string
    join: string
    BrowseAll: string
    Privacypolicy: string
  }
  isAuthenticated: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  translations,
  isAuthenticated,
}) => {
  const locale = useLocale()
  const isRTL = locale === 'ar'

  if (!isOpen) return null

  const navItems = [
    { href: "/", label: translations.home },
    { href: "/rentProducts", label: translations.rent },
    { href: "/saleProducts", label: translations.sale },
    { href: "/products", label: translations.BrowseAll },
    { href: "/Privacypolicy", label: translations.Privacypolicy },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 md:hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-emerald-600 text-white">
          <h2 className="text-lg font-semibold">
            {isRTL ? 'التصفح' : 'Navigation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors font-medium"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
          
          {!isAuthenticated && (
            <Link
              href="/auth/sign-in"
              className="block px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium border-t border-gray-200 mt-4 pt-4"
              onClick={onClose}
            >
              {translations.join}
            </Link>
          )}
        </nav>
      </div>
    </>
  )
}

export default MobileMenu