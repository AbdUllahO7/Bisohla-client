"use client"

import type React from "react"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftRight, Heart, MessageCircle, PhoneCall } from "lucide-react"
import { useTranslations } from "next-intl"
import {Link} from "@/i18n/routing"
import { useState, useEffect, useRef } from "react"
import { toggleCarListingFavorite } from "@/core/infrastructure-adapters/actions/users/car.user.actions"

interface ProductHeaderProps {
  productName?: string
  ContactNumber?: string
  isLoading?: boolean
  productId?: number
  isMarkedFavorite?: boolean
  isAuthenticated?: boolean
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  productName = "",
  ContactNumber = "",
  isLoading = false,
  productId,
  isMarkedFavorite = false,
  isAuthenticated = false,
  onFavoriteToggle,
}) => {
  const t = useTranslations("product")
  const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite)
  const [isProcessing, setIsProcessing] = useState(false)

  // Update internal state when the favorite prop changes
  const prevFavoriteRef = useRef(isMarkedFavorite)
  useEffect(() => {
    if (prevFavoriteRef.current !== isMarkedFavorite) {
      setFavoriteStatus(isMarkedFavorite)
      prevFavoriteRef.current = isMarkedFavorite
    }
  }, [isMarkedFavorite])

  // Format phone number for WhatsApp link (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove all non-digit characters
    return phone.replace(/\D/g, "")
  }

  // Generate WhatsApp link with pre-filled message
  const generateWhatsAppLink = () => {
    const formattedPhone = formatPhoneForWhatsApp(ContactNumber)
    const message = encodeURIComponent(`Hi, I'm interested in your ${productName} listing.`)

    // If formattedPhone is empty, use a default fallback link
    if (!formattedPhone) {
      return "https://wa.me/?text=" + message
    }

    return `https://wa.me/${formattedPhone}?text=${message}`
  }

  // Handle favorite button click
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only allow favorite action if authenticated and product ID exists
    if (isAuthenticated && !isProcessing && productId) {
      setIsProcessing(true)

      try {
        // Store current state for comparison/reversion
        const currentState = favoriteStatus

        // Optimistically update UI
        const newStatus = !currentState
        setFavoriteStatus(newStatus)

        // Notify parent component if callback exists
        if (onFavoriteToggle) {
          onFavoriteToggle(productId, newStatus)
        }

        // Call API
        const response = await toggleCarListingFavorite({
          carListingId: Number(productId),
        })

        // Handle API response
        if (response.success) {
          // Determine the actual status from API
          let responseStatus: boolean

          if (typeof response.data === "boolean") {
            responseStatus = response.data
          } else if (response.data && typeof response.data === "object" && "isFavorite" in response.data) {
            responseStatus = response.data.isFavorite as boolean
          } else {
            // If response format is unexpected, keep optimistic update
            responseStatus = newStatus
          }

          // If API returned something different than our optimistic update
          if (responseStatus !== newStatus) {
            setFavoriteStatus(responseStatus)

            // Notify parent component if callback exists
            if (onFavoriteToggle) {
              onFavoriteToggle(productId, responseStatus)
            }
          }
        } else {
          // API call failed, revert to original state
          setFavoriteStatus(currentState)

          // Notify parent component if callback exists
          if (onFavoriteToggle) {
            onFavoriteToggle(productId, currentState)
          }
        }
      } catch (error) {
        // Exception occurred, revert to initial state
        setFavoriteStatus(isMarkedFavorite)

        // Notify parent component if callback exists
        if (onFavoriteToggle) {
          onFavoriteToggle(productId, isMarkedFavorite)
        }

        console.error("Failed to toggle favorite:", error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box variant="rowBetween" className="items-center justify-start w-full py-2 gap-2">
        <Box className="justify-start items-start" variant="center">
          <Skeleton className="h-8 w-[200px]" />
        </Box>

        <Box className="justify-end items-center flex-wrap gap-2 flex-1 sm:flex-nowrap" variant="row">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-[120px] rounded-md" />
          <Skeleton className="h-8 w-[100px] rounded-md" />
        </Box>
      </Box>
    )
  }

  return (
    <Box variant="rowBetween" className="items-center justify-start w-full py-2 gap-2">
      <Box className="justify-start items-start" variant="center">
        <Text variant="h5" className="line-clamp-1 font-bold">
          {productName}
        </Text>
      </Box>

      <Box className="justify-end items-center flex-wrap gap-2 flex-1 sm:flex-nowrap" variant="row">
        <button
          className="p-1.5 rounded-md bg-background hover:bg-white hover:shadow-md transition-all duration-300 group"
          onClick={handleFavoriteClick}
          disabled={!isAuthenticated || isProcessing}
        >
          <Heart
            className={`h-4 w-4 ${
              isProcessing
                ? "animate-pulse"
                : !isAuthenticated
                  ? "text-gray-400"
                  : favoriteStatus
                    ? "text-red-500 fill-red-500"
                    : "group-hover:text-red-500"
            }`}
          />
        </button>

        <Link
          href={`tel:${ContactNumber}`}
          className="flex items-center font-bold gap-1 text-sm px-2 py-1.5 border border-primary rounded-md hover:bg-primary hover:text-white transition-all duration-300 text-md"
        >
          <span className="hidden sm:inline">{ContactNumber}</span>
          <span className="sm:hidden">Call</span>
          <PhoneCall className="h-3 w-3" />
        </Link>

        <Link
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1.5  bg-primary-foreground text-white rounded-md hover:bg-primary transition-all duration-300 text-md"
        >
          <span className="text-black font-bold text-sm">{t("header.whatsApp")}</span>
          <MessageCircle className="h-3 w-3 text-black " />
        </Link>
      </Box>
    </Box>
  )
}

export default ProductHeader
