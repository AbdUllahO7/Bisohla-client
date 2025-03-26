import { useState } from 'react'
import { createCarListing } from '@/core/infrastructure-adapters/actions/users/car.user.actions'
import { Currency } from '@/core/entities/enums/currency.enum'
import { BodyType, FuelType, Transmission } from '@/core/entities/enums/cars.enums'

import { useImageProcessor } from './useImageProcessor'
import { CarListingSubmission, StepFourData, StepOneData, StepThreeData, StepTwoData } from '../step-types'
import { extractFeatureIds, formatErrorMessage } from '../utils/formatErrorMessage'

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const { collectImageUrls } = useImageProcessor()
  
  const handleSubmission = async () => {
    try {
      setIsSubmitting(true)
      
      // Get data from localStorage
      const data1 = localStorage.getItem('addProduct_stepOne_selections')
      const data2 = localStorage.getItem('addProduct_stepTwo_data')
      const data3 = localStorage.getItem('addProduct_stepThree_data')
      const data4 = localStorage.getItem('addProduct_stepFour_data')
    
      // Check if all data exists
      if (!data1 || !data2 || !data3 || !data4) {
        const errorMsg = 'Missing required data in localStorage'
        console.error(errorMsg, {
          stepOne: !!data1,
          stepTwo: !!data2,
          stepThree: !!data3,
          stepFour: !!data4
        })
        setErrorMessage(errorMsg)
        setShowErrorDialog(true)
        return null
      }

      // Parse data
      const storedData1 = JSON.parse(data1) as StepOneData
      const storedData2 = JSON.parse(data2) as StepTwoData
      const storedData3 = JSON.parse(data3) as StepThreeData
      const storedData4 = JSON.parse(data4) as StepFourData
    
      // Extract feature IDs
      const featureIds = extractFeatureIds(storedData2.selectedFeatures)
      
      // Process images
      const imageUrls = collectImageUrls(storedData3)
      
      // Create submission DTO
      const carListingDto: CarListingSubmission = {
        // Basic vehicle details
        makeId: Number(storedData1.marka),
        modelId: Number(storedData1.model),
        trimId: Number(storedData1.trim) || null,
        year: Number(storedData1.year),
        
        // Location details
        address: storedData1.address,
        city: storedData1.city,
        governorate: storedData1.governorate,
        
        // Pricing
        currency: Currency[storedData2.currency as keyof typeof Currency] || Currency.SYP,
        price: Number(storedData2.price),
        
        // Listing metadata
        status: 'ACTIVE',
        isFeatured: false,
        isSold: false,
        
        // Listing content
        title: storedData4.adTitle,
        description: storedData4.adDescription,
        
        // Features and images
        featureIds,
        images: imageUrls,
        primaryImageIndex: imageUrls.length > 0 ? 0 : undefined,
        
        // Car details
        mileage: Number(storedData2.mileage) || 0,
        fuelType: storedData2.fuelType as FuelType || null,
        transmission: storedData2.transmission as Transmission || null,
        engineSize: Number(storedData2.engineSize) || 0,
        enginePower: Number(storedData2.enginePower) || 0,
        bodyType: storedData2.bodyType as BodyType || null,
        doors: Number(storedData2.doors) || 0,
        colorExterior: storedData2.colorExterior || null,
        colorInterior: storedData2.colorInterior || null,
        vin: storedData2.vin?.toString() || null,
        plateNumber: storedData2.plateNumber?.toString() || null
      }
      
      // Submit to API
      const response = await createCarListing(carListingDto)
      
      if (response.success) {
        // Clear localStorage on success
        localStorage.removeItem('addProduct_stepOne_selections')
        localStorage.removeItem('addProduct_stepTwo_data')
        localStorage.removeItem('addProduct_stepThree_data')
        localStorage.removeItem('addProduct_stepFour_data')
        setShowSuccessDialog(true)
      } else {
        setErrorMessage(formatErrorMessage(response))
        setShowErrorDialog(true)
      }
      
      return response
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrorMessage(formatErrorMessage(error))
      setShowErrorDialog(true)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return {
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    handleSubmission
  }
}