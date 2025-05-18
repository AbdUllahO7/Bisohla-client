"use client"

import { useSession } from "@/hooks/auth/use-session"
import type { HeaderTowProps } from "@/types/homePageTypes"
import { MenuIcon } from "lucide-react"
import {Link} from "@/i18n/routing"
import type React from "react"
import { useMenuToggle } from "./useMenuToggle"
import MobileMenu from "./MobileMenu"

const HeaderTow: React.FC<HeaderTowProps> = ({ translations }) => {
  const { isOpen, setIsOpen, toggleMenu } = useMenuToggle()
  const session = useSession()

  return (
    <nav className="bg-primary text-white relative  pt-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-10 sm:h-12">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex space-x-2 lg:space-x-4">
              <Link href="/" className="hover:bg-primary-light transition-all px-2 py-1 text-sm rounded">
                {translations.home}
              </Link>
              <Link href="/rentProducts" className="hover:bg-primary-light transition-all px-2 py-1 text-sm rounded">
                {translations.rent}
              </Link>
              <Link href="/saleProducts" className="hover:bg-primary-light transition-all px-2 py-1 text-sm rounded">
                {translations.sale}
              </Link>
              <Link href="/products" className="hover:bg-primary-light transition-all px-2 py-1 text-sm rounded">
                {translations.BrowseAll}
              </Link>
              {!session.user.id && (
                <Link href="auth/sign-in" className="hover:bg-primary-light transition-all px-2 py-1 text-sm rounded">
                  {translations.join}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex justify-center w-full">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-1.5 rounded-md text-white hover:bg-primary-light transition-all focus:outline-none"
              aria-expanded={isOpen}
              type="button"
              aria-label="Toggle menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Separate component for better organization */}
      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        translations={translations}
        isAuthenticated={!!session.user.id}
      />
    </nav>
  )
}

export default HeaderTow
