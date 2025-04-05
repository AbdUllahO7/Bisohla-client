// src/components/product/hooks/useImageProcessor.ts

import { StepThreeData } from "../../step-types"

export const useImageProcessor = () => {
  const collectImageUrls = (data: StepThreeData): string[] => {
    const imageUrls: string[] = []
    
    // Add cover image
    if (data.coverImage?.length > 0) {
      imageUrls.push(data.coverImage[0])
    }
    
    // Add car images
    if (data.carImages && Array.isArray(data.carImages)) {
      data.carImages.forEach((url: string) => {
        if (url) imageUrls.push(url)
      })
    }
    
    // Add additional images
    if (data.additionalImages?.length > 0) {
      data.additionalImages.forEach(url => {
        if (url) imageUrls.push(url)
      })
    }
    
    // Add document images
    if (data.documents?.length > 0) {
      data.documents.forEach(url => {
        if (url) imageUrls.push(url)
      })
    }
    
    return imageUrls
  }
  
  return { collectImageUrls }
}