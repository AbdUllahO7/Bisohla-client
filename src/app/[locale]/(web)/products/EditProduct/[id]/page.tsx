'use client';
import Box from '@/components/box/box';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useCarListingById } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import Steps from '@/components/web/ProductsPage/addProducts/main/Steps';
import { Skeleton } from '@/components/ui/skeleton';
import { EDIT_STORAGE_KEYS, STORAGE_KEYS } from '@/components/web/ProductsPage/addProducts/main/hooks/useLocalStorage';

const EditProductPage = () => {
    const { id } = useParams(); // Get the product ID from the URL params
    const router = useRouter();
    const [isInitialized, setIsInitialized] = useState(false);
    
    // Fetch car listing data
    const { data, isLoading, error } = useCarListingById(Number(id));
    
    // Prepare data and initialize local storage on component mount
    useEffect(() => {
        if (data && !isInitialized) {
            // Transform API data to match the format expected by Steps component
            console.log("edit car data", data.data);
            const stepOneData = {
                marka: data.data?.makeId.toString(),
                model: data.data?.modelId.toString(),
                trim: data.data?.trimId ? data.data.trimId?.toString() : '',
                year: data.data?.details?.year.toString() || '',
                story: data.data?.story || '',
                governorate: data.data?.governorate,
                city: data.data?.city,
                address: data.data?.address || ''
            };
            
            // Step 2: Car technical details and features
            const stepTwoData = {
                mileage: data.data?.details?.mileage?.toString() || '',
                fuelType: data.data?.details?.fuelType || '',
                transmission: data.data?.details?.transmission || '',
                engineSize: data.data?.details?.engineSize?.toString() || '',
                enginePower: data.data?.details?.enginePower?.toString() || '',
                bodyType: data.data?.details?.bodyType || '',
                doors: data.data?.details?.doors?.toString() || '',
                colorExterior: data.data?.details?.colorExterior || '',
                colorInterior: data.data?.details?.colorInterior || '',
                vin: data.data?.details?.vin || '',
                plateNumber: data.data?.details?.plateNumber || '',
                currency: data.data?.currency || 'SYP',
                // Transform features to match the expected format
                selectedFeatures: data.data?.features?.map(feature => ({
                    feature: { id: feature.featureId },
                    featureId: feature.featureId.toString()
                })) || []
            };
            
            // Step 3: Car images and damages
            const stepThreeData = {
                // Set cover image (primary image)
                coverImage: data.data?.images?.filter(img => img.isPrimary).map(img => img.url) || [],
                // Set car images (non-primary images)
                carImages: data.data?.images?.filter(img => !img.isPrimary).map(img => img.url) || [],
                // Transform damages to section status format expected by the component
                sectionStatus: transformDamagesToSectionStatus(data.data?.damages || [])
            };
            
            // Step 4: Listing details
            const stepFourData = {
                title: data.data?.title || '',
                description: data.data?.description || '',
                price: data.data?.price?.toString() || '',
                saveStatus: data.data?.saveStatus || 'DRAFT',
                listingType: data.data?.listingType || 'for_sale',
                rentType: data.data?.rentType || null,
                contactNumber: data.data?.contactNumber || '',
                publicationDate: data.data?.publishedAt ? new Date(data.data?.publishedAt).toISOString() : null
            };
            
            // Store data in localStorage with edit-specific keys
            localStorage.setItem(EDIT_STORAGE_KEYS.STEP_ONE, JSON.stringify(stepOneData));
            localStorage.setItem(EDIT_STORAGE_KEYS.STEP_TWO, JSON.stringify(stepTwoData));
            localStorage.setItem(EDIT_STORAGE_KEYS.STEP_THREE, JSON.stringify(stepThreeData));
            localStorage.setItem(EDIT_STORAGE_KEYS.STEP_FOUR, JSON.stringify(stepFourData));

            // Set edit mode flag
            localStorage.setItem(STORAGE_KEYS.EDIT_MODE_FLAG, id.toString());
            
            setIsInitialized(true);
        }
    }, [data, id, isInitialized]);

    // Clean up function to remove data when component unmounts
    useEffect(() => {
        return () => {
            // Only clear edit mode flag if user navigates away from edit page
            if (!window.location.pathname.includes('/edit')) {
                localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
            }
            // We don't clear the actual data here as that's handled by the submission process
        };
    }, []);

    // Helper function to transform damages from API format to section status format
    function transformDamagesToSectionStatus(damages) {
        const sectionStatus = {};
        
        damages.forEach(damage => {
            if (damage.damageZone && damage.damageType) {
                sectionStatus[damage.damageZone] = {
                    status: damage.damageType,
                    description: damage.description || ''
                };
            }
        });
        
        return sectionStatus;
    }

    // Show loading state
    if (isLoading) {
        return (
            <Box variant="column" className="mt-[50px] bg-background">
                <Box className="w-full mt-10 p-6" variant="column">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <Skeleton className="h-64 w-full mb-4" />
                    <Skeleton className="h-12 w-full mb-2" />
                    <Skeleton className="h-12 w-full" />
                </Box>
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box variant="column" className="mt-[50px] bg-background">
                <Box className="w-full mt-10 p-6" variant="column">
                    <div className="p-4 bg-red-50 text-red-600 rounded-md">
                        Error loading car listing. Please try again or contact support.
                        <button 
                            onClick={() => router.back()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Go Back
                        </button>
                    </div>
                </Box>
            </Box>
        );
    }

    return (
        <Box variant="column" className="mt-[50px] bg-background">
            <Box className="w-full mt-10" variant="column">
                {/* Pass isEditMode prop to Steps */}
                <Steps isEditMode={true} carId={Number(id)} initialData={data} />
            </Box>
        </Box>
    );
};

export default EditProductPage;