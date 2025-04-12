import { ListingType, RentType } from "@/core/entities/enums/cars.enums"
import type { AdInfoState } from "./types"
import { z } from "zod"

/**
 * Validates the title field and returns an error message if invalid
 */
export const getTitleErrorMessage = (title: string, direction: string): string => {
  if (!title.trim()) {
    return direction === "ltr" ? "Title is required" : "العنوان مطلوب"
  }
  if (title.trim().length < 3) {
    return direction === "ltr" ? "Title must be at least 3 characters" : "يجب أن يكون العنوان 3 أحرف على الأقل"
  }
  return ""
}

/**
 * Validates the description field and returns an error message if invalid
 */
export const getDescriptionErrorMessage = (description: string, direction: string): string => {
  if (!description.trim()) {
    return direction === "ltr" ? "Description is required" : "الوصف مطلوب"
  }
  if (description.trim().length < 10) {
    return direction === "ltr" ? "Description must be at least 10 characters" : "يجب أن يكون الوصف 10 أحرف على الأقل"
  }
  return ""
}

/**
 * Validates the contact number field and returns an error message if invalid
 */
export const getContactErrorMessage = (contactNumber: string, direction: string): string => {
  if (!contactNumber.trim()) {
    return direction === "ltr" ? "Contact number is required" : "رقم الاتصال مطلوب"
  }
  if (contactNumber.trim().length < 10) {
    return direction === "ltr"
      ? "Contact number must be at least 10 digits"
      : "يجب أن يكون رقم الاتصال 10 أرقام على الأقل"
  }
  if (contactNumber.trim().length > 20) {
    return direction === "ltr" ? "Contact number must not exceed 20 digits" : "يجب ألا يتجاوز رقم الاتصال 20 رقماً"
  }
  return ""
}

/**
 * Validates the publication date field and returns an error message if invalid
 */
export const getPublicationDateErrorMessage = (date: string | null, direction: string): string => {
  if (!date) {
    return direction === "ltr" ? "Publication date is required" : "تاريخ النشر مطلوب"
  }
  return ""
}

/**
 * Validates the entire form and returns a boolean indicating if the form is valid
 */
export const validateForm = (formData: AdInfoState): boolean => {
  // Log the entire form data to debug
  console.log("Validating form data:", formData)

  // Basic validation checks
  const isTitleValid = formData.title.trim().length >= 3
  const isDescriptionValid = formData.description.trim().length >= 10

  // Contact number validation, allowing for optional contact (matching the Zod schema)
  const isContactValid =
    !formData.contactNumber ||
    (formData.contactNumber.trim().length >= 10 && formData.contactNumber.trim().length <= 20)

  // Listing type validation
  const isListingTypeValid = formData.listingType !== ""

  // Rent type validation (only needed if listing type is FOR_RENT)
  const isRentTypeValid =
    formData.listingType !== ListingType.FOR_RENT ||
    (formData.listingType === ListingType.FOR_RENT && formData.rentType !== "")

  // Publication date validation
  const isPublicationDateValid = !!formData.publicationDate

  // Log each validation check result for debugging
  console.log("Validation checks:", {
    isTitleValid,
    isDescriptionValid,
    isContactValid,
    isListingTypeValid,
    isRentTypeValid,
    isPublicationDateValid,

    title: formData.title,
    description: formData.description,
    contactNumber: formData.contactNumber,
    listingType: formData.listingType,
    rentType: formData.rentType,
    publicationDate: formData.publicationDate,
  })

  // Combined validation result
  const isValid =
    isTitleValid &&
    isDescriptionValid &&
    isContactValid &&
    isListingTypeValid &&
    isRentTypeValid &&
    isPublicationDateValid

  console.log("Final validation result:", isValid)

  return isValid
}


export const adInformationSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    contactNumber: z.string().min(10).max(20).nullable().optional(),
    listingType: z.nativeEnum(ListingType),
    rentType: z.nativeEnum(RentType).nullable().optional(),
    publicationDate: z.date(),
})