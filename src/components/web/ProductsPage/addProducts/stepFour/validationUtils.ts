import { ListingType } from "@/core/entities/enums/cars.enums"
import type { AdInfoState } from "./types"

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
 * Validates the price field and returns an error message if invalid
 */
export const getPriceErrorMessage = (price: string, direction: string): string => {
  if (!price.trim()) {
    return direction === "ltr" ? "Price is required" : "السعر مطلوب"
  }
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return direction === "ltr" ? "Price must be a positive number" : "يجب أن يكون السعر رقمًا موجبًا"
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
    return direction === "ltr" ? "Contact number must not exceed 20 digits" : "يجب ألا يتجاوز رقم الاتصال 20 رقمًا"
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
 * Validates the save status field and returns an error message if invalid
 */
export const getSaveStatusErrorMessage = (status: string, direction: string): string => {
  if (!status) {
    return direction === "ltr" ? "Save status is required" : "حالة الحفظ مطلوبة"
  }
  return ""
}

/**
 * Validates the currency field and returns an error message if invalid
 */
export const getCurrencyErrorMessage = (currency: string, direction: string): string => {
  if (!currency) {
    return direction === "ltr" ? "Currency is required" : "العملة مطلوبة"
  }
  return ""
}

/**
 * Validates the entire form and returns a boolean indicating if the form is valid
 */
export const validateForm = (formData: AdInfoState): boolean => {
  // Basic validation checks
  const isTitleValid = formData.title.trim().length >= 3
  const isDescriptionValid = formData.description.trim().length >= 10
  const isPriceValid = !!formData.price.trim() && !isNaN(Number(formData.price)) && Number(formData.price) > 0

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
  
  // Save status validation
  const isSaveStatusValid = !!formData.saveStatus

  // Currency validation
  const isCurrencyValid = !!formData.currency

  // Combined validation result
  const isValid =
    isTitleValid &&
    isDescriptionValid &&
    isPriceValid &&
    isContactValid &&
    isListingTypeValid &&
    isRentTypeValid &&
    isPublicationDateValid &&
    isSaveStatusValid &&
    isCurrencyValid

  return isValid
}