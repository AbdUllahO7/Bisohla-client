"use client"

import LocaleSwitcher from "@/components/local/LocalSwitcher"
import {Link} from "@/i18n/routing"
import { XIcon } from "lucide-react"
import { useEffect, useRef } from "react"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  translations: {
    home: string
    rent: string
    sale: string
    BrowseAll: string
    join?: string
  }
  isAuthenticated: boolean
}

export default function MobileMenu({ isOpen, onClose, translations, isAuthenticated }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("button[aria-expanded]")
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" aria-modal="true" role="dialog">
      <div
        ref={menuRef}
        className="fixed top-[74px] left-0 right-0 bg-primary-dark shadow-lg max-h-[calc(100vh-74px)] overflow-y-auto"
        role="menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col items-center">
          <button
            onClick={onClose}
            className="self-end p-2 text-white hover:bg-primary-light rounded-full mb-2"
            aria-label="Close menu"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="hover:bg-primary-light transition-all px-3 py-2 text-sm w-full text-center rounded"
            onClick={onClose}
            role="menuitem"
          >
            {translations.home}
          </Link>
          <Link
            href="/rentProducts"
            className="hover:bg-primary-light transition-all px-3 py-2 text-sm w-full text-center rounded"
            onClick={onClose}
            role="menuitem"
          >
            {translations.rent}
          </Link>
          <Link
            href="/saleProducts"
            className="hover:bg-primary-light transition-all px-3 py-2 text-sm w-full text-center rounded"
            onClick={onClose}
            role="menuitem"
          >
            {translations.sale}
          </Link>
          <Link
            href="/products"
            className="hover:bg-primary-light transition-all px-3 py-2 text-sm w-full text-center rounded"
            onClick={onClose}
            role="menuitem"
          >
            {translations.BrowseAll}
          </Link>
          {!isAuthenticated && (
            <Link
              href="auth/sign-in"
              className="hover:bg-primary-light transition-all px-3 py-2 text-sm w-full text-center rounded"
              onClick={onClose}
              role="menuitem"
            >
              {translations.join}
            </Link>
          )}
          <div className="py-2 w-full flex justify-center">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </div>
  )
}
