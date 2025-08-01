// src/components/product/hooks/useImageProcessor.ts

import { StepThreeData } from "../../step-types"

export const useImageProcessor = () => {
  const collectImageUrls = (data: StepThreeData): string[] => {
    const imageUrls: string[] = []
    
    // Add cover image
    if (data.coverImage?.length > 0) {
      imageUrls.push(data.coverImage[0])
    }
  
    
    return imageUrls
  }
  
  return { collectImageUrls }
}