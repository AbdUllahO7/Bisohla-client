'use client';
import Box from '@/components/ui/box';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Steps from '@/components/web/ProductsPage/addProducts/Main/Steps';
import { Skeleton } from '@/components/ui/skeleton';
import { EDIT_STORAGE_KEYS, STORAGE_KEYS, clearFormData } from '@/components/web/ProductsPage/addProducts/Main/hooks/useLocalStorage';
import { useGetListingById } from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';

const EditProductPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch generic listing data
    const { data, isLoading, error } = useGetListingById(Number(id));

    // Prepare data and initialize local storage on component mount
    useEffect(() => {
        if (data && data.data && !isInitialized) {
            // Clear existing edit-mode data to prevent stale values
            clearFormData(true);

            const listing = data.data;

            // Transform API data to match the format expected by Steps component
            // We initialize basic steps, DynamicFormStep will use initialData for the rest
            const stepOneData = {
                id: listing.listingTypeId,
            };

            // Initialize stepTwoData with flattened attribute values and their metadata
            const attributeValuesMap: Record<string, any> = {};
            const attributeMetaMap: Record<string, any> = {};

            if (listing.attributeValues && Array.isArray(listing.attributeValues)) {
                listing.attributeValues.forEach((av: any) => {
                    const slug = av.attribute?.slug;
                    if (slug) {
                        // Store metadata
                        attributeMetaMap[slug] = {
                            id: av.attribute.id,
                            type: av.attribute.type
                        };

                        // Store value
                        let val = null;
                        if (av.valueNumber !== null && av.valueNumber !== undefined) val = Number(av.valueNumber);
                        else if (av.valueJson !== null && av.valueJson !== undefined) val = av.valueJson;
                        else if (av.valueBoolean !== null && av.valueBoolean !== undefined) val = av.valueBoolean;
                        else if (av.valueText !== null && av.valueText !== undefined) val = av.valueText;
                        else if (av.valueDate !== null && av.valueDate !== undefined) val = av.valueDate;
                        attributeValuesMap[slug] = val;
                    }
                });
            }

            const stepTwoData = {
                ...attributeValuesMap,
                governorate: listing.governorate || null,
                city: listing.city || null,
                address: listing.address || null,
                // Fallbacks for critical fields
                make: listing.makeId || listing.make?.id || attributeValuesMap.make || null,
                model: listing.modelId || listing.model?.id || attributeValuesMap.model || null,
                trim: listing.trimId || listing.trim?.id || attributeValuesMap.trim || null,
                currency: listing.currency || 'USD',
                __attributeMap__: attributeMetaMap,
            };

            const stepThreeData = {
                coverImage: listing.images?.map((img: any) => img.url) || [],
                // Damages might be in different formats for different types, 
                // but for now we keep the existing logic if it's car-like
                sectionStatus: transformDamagesToSectionStatus(listing.damages || [])
            };

            const stepFourData = {
                title: listing.title || '',
                description: listing.description || '',
                price: listing.price?.toString() || '',
                saveStatus: listing.saveStatus || 'PUBLISHED',
                listingType: listing.listingOfferType || listing.listingType || 'for_sale',
                rentType: listing.rentType || null,
                contactNumber: listing.contactNumber || '',
                publicationDate: listing.publishedAt ? new Date(listing.publishedAt).toISOString() : null,
                currency: listing.currency || 'USD'
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
            if (!window.location.pathname.includes('/EditProduct')) {
                localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
                clearFormData(true); // Clear edit data on unmount
            }
        };
    }, []);

    // Helper function to transform damages from API format to section status format
    function transformDamagesToSectionStatus(damages: any[]): Record<string, any> {
        const sectionStatus: Record<string, any> = {};
        damages?.forEach(damage => {
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
    if (error || !data) {
        return (
            <Box variant="column" className="mt-[50px] bg-background">
                <Box className="w-full mt-10 p-6" variant="column">
                    <div className="p-4 bg-red-50 text-red-600 rounded-md">
                        {error?.message || 'Error loading listing. Please try again or contact support.'}
                        <button
                            onClick={() => router.back()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 block"
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
                {isInitialized && <Steps isEditMode={true} carId={Number(id)} initialData={data.data} />}
            </Box>
        </Box>
    );
};

export default EditProductPage;