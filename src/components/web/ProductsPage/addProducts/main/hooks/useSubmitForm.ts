// hooks/useSubmitForm.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCarListing } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { Currency } from '@/core/entities/enums/currency.enum';
import { BodyType, DamageType, DamageZone, FuelType, ListingType, RentType, SaveStatus, Transmission } from '@/core/entities/enums/cars.enums';
import { StepOneData, StepTwoData, StepThreeData, StepFourData, CreateCarListingDto } from '../types';
import { transformDamages } from '../../stepThree/utils';
import { STORAGE_KEY } from '../../stepFour/types';
import { SyriaCity, SyriaGovernorate } from '@/core/entities/enums/syria.enums';

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
      
      // Import the clearAllFormData function from your storageUtils
      // alternatively, you can use the version below if you can't import it
      
      // Get all form data from localStorage
      const data1 = localStorage.getItem('addProduct_stepOne_selections');
      const data2 = localStorage.getItem('addProduct_stepTwo_data');
      const data3 = localStorage.getItem('addProduct_stepThree_data');
      const data4 = localStorage.getItem('addProduct_stepFour_data');
    

  
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
        setIsSubmitting(false);
        return null;
      }
  
      // Make copies of the data
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
  
  
      // Process all images into a string array
      const imageUrls: string[] = [];
      
      // Add cover image
      if (storedData3.coverImage && Array.isArray(storedData3.coverImage) && storedData3.coverImage.length > 0) {
        imageUrls.push(storedData3.coverImage[0]);
      }
      
      // Add car images
      if (storedData3.carImages && Array.isArray(storedData3.carImages)) {
        storedData3.carImages.forEach((url: string) => {
          if (url) {
            imageUrls.push(url);
          }
        });
      }
      
    
     
      
      // Transform car damages from sectionStatus to the backend format with snake_case keys
      const damages = transformDamages(storedData3.sectionStatus || {});
      
      // Create the car listing submission with a FLATTENED structure
      const createCarListingDto: CreateCarListingDto = {
        // Basic vehicle details from step 1
        makeId: Number(storedData1.marka),
        modelId: Number(storedData1.model),
        trimId: Number(storedData1.trim) || null,
        year: Number(storedData1.year),
        story: storedData1.story || null,
        
        // Location details from step 1 - cast to enum types
        address: storedData1.address,
        city: storedData1.city as SyriaCity,
        governorate: storedData1.governorate as SyriaGovernorate,
        
        // Pricing from step 2
        currency: Currency[storedData2.currency as keyof typeof Currency] || Currency.SYP,
        price: Number(storedData2.price) || null,
        
        // Listing metadata
        isFeatured: false,
        isSold: false,
        saveStatus: storedData4.saveStatus,
        
        // Listing content from step 4
        title: storedData4.title,
        description: storedData4.description,
        
        // Using featureIds to match the schema
        featureIds: featureIds,
        
        // Images
        images: imageUrls,
        primaryImageIndex: imageUrls.length > 0 ? 0 : undefined,
        
        // Car details - FLATTENED structure
        mileage: Number(storedData2.mileage) || null,
        fuelType: storedData2.fuelType as FuelType || null,
        transmission: storedData2.transmission as Transmission || null,
        engineSize: Number(storedData2.engineSize) || null,
        enginePower: Number(storedData2.enginePower) || null,
        bodyType: storedData2.bodyType as BodyType || null,
        doors: Number(storedData2.doors) || null,
        colorExterior: storedData2.colorExterior || null,
        colorInterior: storedData2.colorInterior || null,
        vin: storedData2.vin?.toString() || null,
        plateNumber: storedData2.plateNumber?.toString() || null,
        listingType: storedData4.listingType as ListingType,
        rentType: storedData4.rentType as RentType || null,
        contactNumber: storedData4.contactNumber || null,
        publishedAt: storedData4.publicationDate || null,
        damages: damages?.map(d => ({
          damageZone: d.damageZone as DamageZone,
          damageType: d.damageType as DamageType,
          description: d.description
        })),
};
      
      // Call the API with the flattened DTO
      const response = await createCarListing(createCarListingDto);
      console.log("API response:", response);
      
      if (response.success) {
        // Clear all form data properly
        // Use the imported clearAllFormData function or implement it inline:
        const keysToRemove = [
          'addProduct_stepOne_selections',
          'addProduct_stepTwo_data',
          'addProduct_stepThree_data',
          'addProduct_stepFour_data',
        ];
        
        // Important: Remove items one by one
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Redirect to success page or next step
        router.replace('/products/AddProducts/ProductSuccessPage');
        
        return response;
      } else {
        // Show error dialog on unsuccessful response
        setErrorMessage(formatErrorMessage(response));
        return null;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(formatErrorMessage(error));
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