// hooks/useSubmitForm.ts
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCarListing, updateCarListing } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { Currency } from '@/core/entities/enums/currency.enum';
import { BodyType, DamageType, DamageZone, FuelType, ListingType, RentType, SaveStatus, Transmission } from '@/core/entities/enums/cars.enums';
import { StepOneData, StepTwoData, StepThreeData, StepFourData, CreateCarListingDto } from '../types';
import { transformDamages } from '../../stepThree/utils';
import { SyriaCity, SyriaGovernorate } from '@/core/entities/enums/syria.enums';
import { 
  STORAGE_KEYS, 
  EDIT_STORAGE_KEYS, 
  getAllFormData, 
  clearFormData 
} from './useLocalStorage';

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
  const [isEditMode, setIsEditMode] = useState(false);

  // Determine if we're in edit mode on mount
  useEffect(() => {
    const editModeId = localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
    setIsEditMode(!!editModeId);
  }, []);

  const handleTryAgain = useCallback(() => {
    setShowErrorDialog(false);
    setErrorMessage('');
  }, []);

  const submitForm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      // Check if we're in edit mode
      const carIdToEdit = localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
      const isEditMode = !!carIdToEdit;
      
      // Get all form data with awareness of edit mode
      const formData = getAllFormData(isEditMode);
      
      if (!formData) {
        const errorMsg = 'Missing required data in localStorage';
        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return null;
      }
      
      const { stepOne: storedData1, stepTwo: storedData2, stepThree: storedData3, stepFour: storedData4 } = formData;

      console.log("Stored Data:", {storedData3})
      
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
      
      // Transform car damages from sectionStatus to the backend format
      const damages = transformDamages(storedData3.sectionStatus || {});
      
      // Create the car listing submission with a FLATTENED structure
      const carListingDto: CreateCarListingDto = {
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
        price: Number(storedData4.price) || null,
        
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
      
      // Call the API - use different methods for create vs update
      let response;
      if (isEditMode) {
        // Update existing car listing
        console.log("Editing car listing with ID:", carIdToEdit);
        response = await updateCarListing(Number(carIdToEdit), carListingDto);
        console.log("Update API response:", response);
      } else {
        // Create new car listing
        response = await createCarListing(carListingDto);
        console.log("Create API response:", response);
      }
      
      if (response.success) {
        // Clear all form data properly - both edit and normal data
        clearFormData(true);
        
        // Redirect to success page or next step
        const successPath = '/products/AddProducts/ProductSuccessPage';
        router.replace(successPath);
        
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
    submitForm,
    isEditMode
  };
};