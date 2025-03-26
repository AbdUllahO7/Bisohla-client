// hooks/useSubmitForm.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCarListing } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { Currency } from '@/core/entities/enums/currency.enum';
import { BodyType, FuelType, Transmission } from '@/core/entities/enums/cars.enums';
import { StepOneData, StepTwoData, StepThreeData, StepFourData, CreateCarListingDto } from '../types';

// Format error message for display
const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error.message) {
    return error.message;
  }
  
  if (error.status && error.path) {
    return `Error ${error.status}: ${error.message || 'An error occurred'} (${error.path})`;
  }
  
  return JSON.stringify(error, null, 2);
};

export const useSubmitForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTryAgain = useCallback(() => {
    setShowErrorDialog(false);
    setErrorMessage('');
  }, []);

  const submitForm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      // Get all form data from localStorage
      const data1 = localStorage.getItem('addProduct_stepOne_selections');
      const data2 = localStorage.getItem('addProduct_stepTwo_data');
      const data3 = localStorage.getItem('addProduct_stepThree_data');
      const data4 = localStorage.getItem('addProduct_stepFour_data');
    
      console.log("Parsed data from localStorage:");
      console.log("Step One:", data1);
      console.log("Step Two:", data2);
      console.log("Step Three:", data3);
      console.log("Step Four:", data4);

      // Check if we have all required data
      if (!data1 || !data2 || !data3 || !data4) {
        const errorMsg = 'Missing required data in localStorage';
        console.error(errorMsg, {
          stepOne: !!data1,
          stepTwo: !!data2,
          stepThree: !!data3,
          stepFour: !!data4
        });
        setErrorMessage(errorMsg);
        setShowErrorDialog(true);
        setIsSubmitting(false);
        return null;
      }

      // Parse all data
      const storedData1 = JSON.parse(data1) as StepOneData;
      const storedData2 = JSON.parse(data2) as StepTwoData;
      const storedData3 = JSON.parse(data3) as StepThreeData;
      const storedData4 = JSON.parse(data4) as StepFourData;
    
      // Extract ONLY feature IDs to send to the API
      const featureIds: number[] = [];
      
      if (storedData2.selectedFeatures && Array.isArray(storedData2.selectedFeatures)) {
        for (const featureItem of storedData2.selectedFeatures) {
          if (featureItem && typeof featureItem === 'object') {
            // Get the feature ID, whether it's directly available or inside a feature object
            let featureId = null;
            
            if (featureItem.feature && featureItem.feature.id) {
              featureId = featureItem.feature.id;
            } else if (featureItem.featureId) {
              featureId = parseInt(featureItem.featureId, 10);
            }
            
            if (featureId) {
              featureIds.push(featureId);
            }
          }
        }
      }

      console.log("Extracted feature IDs:", featureIds);

      // Process all images into a string array
      const imageUrls: string[] = [];
      
      // Add cover image
      if (storedData3.coverImage && Array.isArray(storedData3.coverImage) && storedData3.coverImage.length > 0) {
        imageUrls.push(storedData3.coverImage[0]);
        console.log("Added cover image:", storedData3.coverImage[0]);
      }
      
      // Add car images
      if (storedData3.carImages && Array.isArray(storedData3.carImages)) {
        storedData3.carImages.forEach((url: string) => {
          if (url) {
            imageUrls.push(url);
          }
        });
        console.log(`Added ${storedData3.carImages.length} car images`);
      }
      
      // Add additional images
      if (storedData3.additionalImages && Array.isArray(storedData3.additionalImages)) {
        storedData3.additionalImages.forEach((url: string) => {
          if (url) {
            imageUrls.push(url);
          }
        });
        console.log(`Added ${storedData3.additionalImages.length} additional images`);
      }
      
      // Add document images
      if (storedData3.documents && Array.isArray(storedData3.documents)) {
        storedData3.documents.forEach((url: string) => {
          if (url) {
            imageUrls.push(url);
          }
        });
        console.log(`Added ${storedData3.documents.length} document images`);
      }
      
      // Create the car listing submission with a FLATTENED structure
      const createCarListingDto: CreateCarListingDto = {
        // Basic vehicle details from step 1
        makeId: Number(storedData1.marka),
        modelId: Number(storedData1.model),
        trimId: Number(storedData1.trim) || null,
        year: Number(storedData1.year),
        
        // Location details from step 1
        address: storedData1.address,
        city: storedData1.city,
        governorate: storedData1.governorate,
        
        // Pricing from step 2
        // Convert currency string to Currency enum
        currency: Currency[storedData2.currency as keyof typeof Currency] || Currency.SYP,
        price: Number(storedData2.price),
        
        // Listing metadata
        status: 'ACTIVE',
        isFeatured: false,
        isSold: false,
        
        // Listing content from step 4
        title: storedData4.adTitle,
        description: storedData4.adDescription,
        
        // Using featureIds to match the schema
        featureIds: featureIds,
        
        // Images
        images: imageUrls,
        primaryImageIndex: imageUrls.length > 0 ? 0 : undefined,
        
        // Car details - FLATTENED structure
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
      };
      
      console.log("Submitting car listing with FLATTENED structure:", createCarListingDto);
      
      // Call the API with the flattened DTO
      const response = await createCarListing(createCarListingDto);
      console.log("API response:", response);
      
      if (response.success) {
        // Optional: Clear localStorage after successful submission
        // localStorage.removeItem('addProduct_stepOne_selections');
        // localStorage.removeItem('addProduct_stepTwo_data');
        // localStorage.removeItem('addProduct_stepThree_data');
        // localStorage.removeItem('addProduct_stepFour_data');


        // Alternatively, you can try this approach with router
        setTimeout(() => {
          router.push('/products/AddProducts/ProductSuccessPage');
        }, 0);
        
        return response;
      } else {
        // Show error dialog on unsuccessful response
        setErrorMessage(formatErrorMessage(response));
        setShowErrorDialog(true);
        return null;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(formatErrorMessage(error));
      setShowErrorDialog(true);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  return {
    isSubmitting,
    showErrorDialog,
    errorMessage,
    handleTryAgain,
    setShowErrorDialog,
    submitForm
  };
};