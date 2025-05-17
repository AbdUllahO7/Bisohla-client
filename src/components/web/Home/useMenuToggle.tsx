"use client"

import { useEffect, useState } from "react"

export function useMenuToggle() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Toggle body class to prevent scrolling when menu is open
    if (isOpen) {
      document.body.classList.add("menu-open")
    } else {
      document.body.classList.remove("menu-open")
    }

    return () => {
      document.body.classList.remove("menu-open")
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  return {
    isOpen,
    setIsOpen,
    toggleMenu,
  }
}
