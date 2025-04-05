// src/components/product/utils/formatErrorMessage.ts
export const formatErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    
    if (error.message) {
      return error.message
    }
    
    if (error.status && error.path) {
      return `Error ${error.status}: ${error.message || 'An error occurred'} (${error.path})`
    }
    
    return JSON.stringify(error, null, 2)
  }
  
  // src/components/product/utils/extractFeatureIds.ts
  export const extractFeatureIds = (selectedFeatures: any[]): number[] => {
    const featureIds: number[] = []
    
    if (!Array.isArray(selectedFeatures)) return featureIds
    
    for (const featureItem of selectedFeatures) {
      if (featureItem && typeof featureItem === 'object') {
        let featureId = null
        
        if (featureItem.feature && featureItem.feature.id) {
          featureId = featureItem.feature.id
        } else if (featureItem.featureId) {
          featureId = parseInt(featureItem.featureId, 10)
        }
        
        if (featureId) {
          featureIds.push(featureId)
        }
      }
    }
    
    return featureIds
  }