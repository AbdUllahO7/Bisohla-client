'use client';
import Box from '@/components/box/box';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useCarListingById } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import Steps from '@/components/web/ProductsPage/addProducts/main/Steps';
import { Skeleton } from '@/components/ui/skeleton';
import { EDIT_STORAGE_KEYS, STORAGE_KEYS, clearFormData } from '@/components/web/ProductsPage/addProducts/main/hooks/useLocalStorage';
import { useSession } from '@/hooks/auth/use-session';
import { useMyCarListings } from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
import { getMyCarListings } from '@/core/infrastructure-adapters/actions/users/car.user.actions';

const EditProductPage = () => {
    const { id } = useParams(); // Get the product ID from the URL params
    const router = useRouter();
    const [isInitialized, setIsInitialized] = useState(false);
    const userSession =  useSession();
    // Fetch car listing data
    const {data} = useMyCarListings({ id :Number(id),});



    // Prepare data and initialize local storage on component mount
    useEffect(() => {
        if (data && data.data && !isInitialized) {
            // Clear existing edit-mode data to prevent stale values
            clearFormData(true);

            // Transform API data to match the format expected by Steps component
            const stepOneData = {
                marka: data.data?.data[0].makeId?.toString() || '',
                model: data.data?.data[0].modelId?.toString() || '',
                trim: data.data?.data[0].trimId ? data.data.data[0].trimId?.toString() : '',
                year: data.data?.data[0].details?.year?.toString() || '',
                story: data.data?.data[0].story || '',
                governorate: data.data?.data[0].governorate || '',
                city: data.data?.data[0].city || '',
                address: data.data?.data[0].address || ''
            };

            const stepTwoData = {
                mileage: data.data?.data[0].details?.mileage?.toString() || '',
                fuelType: data.data?.data[0].details?.fuelType || '',
                transmission: data.data?.data[0].details?.transmission || '',
                engineSize: data.data?.data[0].details?.engineSize?.toString() || '',
                enginePower: data.data?.data[0].details?.enginePower?.toString() || '',
                bodyType: data.data?.data[0].details?.bodyType || '',
                doors: data.data?.data[0].details?.doors?.toString() || '',
                colorExterior: data.data?.data[0].details?.colorExterior || '',
                vin: data.data?.data[0].details?.vin || '',
                plateNumber: data.data?.data[0].details?.plateNumber || '',
                currency: data.data?.data[0].currency || 'SYP',
                selectedFeatures: data.data?.data[0].features?.map(feature => ({
                    feature: { id: feature.featureId },
                    featureId: feature.featureId.toString()
                })) || []
            };

            const stepThreeData = {
                coverImage: data.data?.data[0].images?.filter(img => img.isPrimary).map(img => img.url) || [],
                sectionStatus: transformDamagesToSectionStatus(data.data?.data[0].damages || [])
            };

            const stepFourData = {
                title: data.data?.data[0].title || '',
                description: data.data?.data[0].description || '',
                price: data.data?.data[0].price?.toString() || '',
                saveStatus: data.data?.data[0].saveStatus || 'PUBLISHED',
                listingType: data.data?.data[0].listingType || 'for_sale',
                rentType: data.data?.data[0].rentType || null,
                contactNumber: data.data?.data[0].contactNumber || '',
                publicationDate: data.data?.data[0].publishedAt ? new Date(data.data?.data[0].publishedAt).toISOString() : null
            };

            try {
                // Store data in localStorage with edit-specific keys
                localStorage.setItem(EDIT_STORAGE_KEYS.STEP_ONE, JSON.stringify(stepOneData));
                localStorage.setItem(EDIT_STORAGE_KEYS.STEP_TWO, JSON.stringify(stepTwoData));
                localStorage.setItem(EDIT_STORAGE_KEYS.STEP_THREE, JSON.stringify(stepThreeData));
                localStorage.setItem(EDIT_STORAGE_KEYS.STEP_FOUR, JSON.stringify(stepFourData));

                // Set edit mode flag
                if (id) {
                    localStorage.setItem(STORAGE_KEYS.EDIT_MODE_FLAG, id.toString());
                }

              
                setIsInitialized(true);
            } catch (error) {
                console.error('Error setting local storage:', error);
            }
        }
    }, [data, id, isInitialized]);

    // Clean up function to remove edit mode flag when component unmounts
    useEffect(() => {
        return () => {
            if (!window.location.pathname.includes('/edit')) {
                localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
                clearFormData(true); // Clear edit data on unmount
            }
        };
    }, []);

    // Helper function to transform damages from API format to section status format
    interface DamageStatus {
        status: string;
        description: string;
    }

    function transformDamagesToSectionStatus(damages: any[]): Record<string, DamageStatus> {
        const sectionStatus: Record<string, DamageStatus> = {};

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

    // // Show loading state
    // if (isLoading) {
    //     return (
    //         <Box variant="column" className="mt-[50px] bg-background">
    //             <Box className="w-full mt-10 p-6" variant="column">
    //                 <Skeleton className="h-8 w-1/3 mb-4" />
    //                 <Skeleton className="h-64 w-full mb-4" />
    //                 <Skeleton className="h-12 w-full mb-2" />
    //                 <Skeleton className="h-12 w-full" />
    //             </Box>
    //         </Box>
    //     );
    // }

    // // Show error state
    // if (error || !data) {
    //     return (
    //         <Box variant="column" className="mt-[50px] bg-background">
    //             <Box className="w-full mt-10 p-6" variant="column">
    //                 <div className="p-4 bg-red-50 text-red-600 rounded-md">
    //                     Error loading car listing. Please try again or contact support.
    //                     <button
    //                         onClick={() => router.back()}
    //                         className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
    //                     >
    //                         Go Back
    //                     </button>
    //                 </div>
    //             </Box>
    //         </Box>
    //     );
    // }

    return (
        <Box variant="column" className="mt-[50px] bg-background">
            <Box className="w-full mt-10" variant="column">
                <Steps isEditMode={true} carId={Number(id)} initialData={data?.data} />
            </Box>
        </Box>
    );
};

export default EditProductPage;