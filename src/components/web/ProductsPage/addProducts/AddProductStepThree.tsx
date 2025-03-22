"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Circle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import ImageUploader, { ImageUploaderRef } from "@/components/image-uploader/image-uploader"
import Text from "@/components/text/text"
import { 
  CarConditionType, 
  CarSection,
  getCarSectionOptions,
  getCarConditionOptions
} from "@/core/entities/enums/car-condition.enum"

// Storage key for localStorage
const STORAGE_KEY = "addProduct_stepThree_data"

// Define our state type
interface CarConditionState {
  sectionStatus: {
    [sectionId: number]: CarConditionType
  };
  coverImage: string[];
  carImages: string[];
  documents: string[];
  additionalImages: string[];
}

// Default state
const defaultState: CarConditionState = {
  sectionStatus: {},
  coverImage: [],
  carImages: [],
  documents: [],
  additionalImages: []
}

interface AddProductStepThreeProps {
  onValidationChange: (isValid: boolean) => void
}

const AddProductStepThree: React.FC<AddProductStepThreeProps> = ({ onValidationChange }) => {
    const locale = useLocale()
    const isRTL = locale === "ar"
    const direction = isRTL ? "rtl" : "ltr"
    const t = useTranslations("addProduct.enteredData.stepThree")
    const [isFormDisabled, setIsFormDisabled] = useState(false)
    const [isClient, setIsClient] = useState(false)
    
    // References to ImageUploader components to call reset() if needed
    const coverImageRef = useRef<ImageUploaderRef>(null)
    const carImagesRef = useRef<ImageUploaderRef>(null)
    const documentsRef = useRef<ImageUploaderRef>(null)
    const additionalImagesRef = useRef<ImageUploaderRef>(null)
    
    // Use ref to track previous validation state to prevent unnecessary updates
    const prevValidState = useRef<boolean | null>(null)
    
    // Combined state for all form data
    const [carCondition, setCarCondition] = useState<CarConditionState>(defaultState)

    // Text labels
    const labels = useMemo(
      () => ({
        carInfo: isRTL ? "معلومات حالة السيارة" : "Car Condition Information",
        carPhotos: isRTL ? "صور السيارة" : "Car Photos",
        carSectionName: isRTL ? "أقسام السيارة" : "Car Section Name",
        coverImage: isRTL ? "صورة الغلاف" : "Cover Image",
        carImages: isRTL ? "صور السيارة" : "Car Images",
        documents: isRTL ? "المستندات" : "Documents",
        additionalImages: isRTL ? "صور إضافية" : "Additional Images",
        oneImage: isRTL ? "صورة واحدة" : "One image",
        tenImages: isRTL ? "10 صور كحد أقصى" : "Maximum 10 images",
        tenFiles: isRTL ? "10 ملفات كحد أقصى" : "Maximum 10 files",
        required: isRTL ? "مطلوب" : "Required",
      }),
      [isRTL],
    )

    // Memoized options
    const options = useMemo(() => ({
      carSections: getCarSectionOptions(t),
      conditionTypes: getCarConditionOptions(t)
    }), [t]);

    // Load data from localStorage on client-side
    useEffect(() => {
        setIsClient(true)
        try {
            const savedData = localStorage.getItem(STORAGE_KEY)
            if (savedData) {
                const parsed = JSON.parse(savedData)
                setCarCondition(parsed)
            }
        } catch (e) {
            console.error("Failed to parse saved data:", e)
        }
    }, [])

    // Save to localStorage whenever the state changes
    useEffect(() => {
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(carCondition))
        }
    }, [carCondition, isClient])

    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Handle checkbox selection for car section status
    const handleSectionStatusChange = useCallback((sectionId: CarSection, status: CarConditionType) => {
        setCarCondition(prev => {
            const newSectionStatus = { ...prev.sectionStatus }
            
            // If clicking the same status again, remove it
            if (newSectionStatus[sectionId] === status) {
                delete newSectionStatus[sectionId]
            } else {
                // Otherwise set to the new status
                newSectionStatus[sectionId] = status
            }
            
            return {
                ...prev,
                sectionStatus: newSectionStatus
            }
        })
    }, [])

    // Check if a checkbox should be checked
    const isStatusSelected = useCallback((sectionId: CarSection, status: CarConditionType) => {
        return carCondition.sectionStatus[sectionId] === status
    }, [carCondition.sectionStatus])

    // Handle image uploads for each section
    const handleCoverImageChange = useCallback((urls: string[]) => {
        setCarCondition(prev => ({
            ...prev,
            coverImage: urls
        }))
    }, [])

    const handleCarImagesChange = useCallback((urls: string[]) => {
        setCarCondition(prev => ({
            ...prev,
            carImages: urls
        }))
    }, [])

    const handleDocumentsChange = useCallback((urls: string[]) => {
        setCarCondition(prev => ({
            ...prev,
            documents: urls
        }))
    }, [])

    const handleAdditionalImagesChange = useCallback((urls: string[]) => {
        setCarCondition(prev => ({
            ...prev,
            additionalImages: urls
        }))
    }, [])

    // Validation effect
    useEffect(() => {
        // Check if all required sections have a status
        const allSectionsHaveStatus = options.carSections.every(section => 
            Boolean(carCondition.sectionStatus[section.id])
        )

        // Check if at least cover image is provided
        const hasCoverImage = carCondition.coverImage.length > 0

        // Check if at least one car image is provided
        const hasCarImages = carCondition.carImages.length > 0

        // Overall validation
        const isValid = allSectionsHaveStatus && hasCoverImage && hasCarImages

        // Only call onValidationChange if validation state changed
        if (isValid !== prevValidState.current) {
            prevValidState.current = isValid
            onValidationChange(isValid)
        }
    }, [carCondition, options.carSections, onValidationChange])

    // Car Condition Table component
    const CarConditionTable = useCallback(() => (
        <div className="w-full overflow-x-auto p-4">
            <Table className="min-w-[800px] w-full text-center">
                <TableHeader>
                    <TableRow className="text-center hover:bg-transparent border-gray-200 border-1">
                        {/* Table Heads */}
                        <TableHead className="min-w-[150px] text-start">{labels.carSectionName}</TableHead>
                        {options.conditionTypes.map((conditionType) => (
                            <TableHead key={conditionType.value} className="min-w-[160px]">
                                <div className={`${conditionType.colorClass} text-white justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base`}>
                                    <Circle size={20} className="text-primary" />
                                    {conditionType.label}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {options.carSections.map((section) => (
                        <TableRow
                            key={section.id}
                            className="text-center hover:bg-transparent border-gray-300 hover:bg-background group duration-300"
                        >
                            <TableCell className="font-medium text-sm md:text-base text-start">{section.name}</TableCell>
                            {options.conditionTypes.map((conditionType) => (
                                <TableCell key={`${section.id}-${conditionType.value}`}>
                                    <Checkbox 
                                        id={`${conditionType.value}-${section.id}`} 
                                        className="rounded-full h-5 w-5"
                                        checked={isStatusSelected(section.id, conditionType.value)}
                                        onCheckedChange={() => handleSectionStatusChange(section.id, conditionType.value)}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    ), [labels.carSectionName, options.conditionTypes, options.carSections, isFormDisabled, isStatusSelected, handleSectionStatusChange]);

    // Car Photos component
    const CarPhotosSection = useCallback(() => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Cover Image */}
            <div>
                <Text className="text-lg font-semibold mb-2">
                    {labels.coverImage} <span className="text-red-500">*</span>
                </Text>
                <Text className="text-sm text-gray-500 mb-3">
                    {labels.oneImage}
                </Text>
                <ImageUploader
                    ref={coverImageRef}
                    maxImages={1}
                    onChange={handleCoverImageChange}
                    setDisableForm={setIsFormDisabled}
                    value={carCondition.coverImage}
                    dropzoneClassName="min-h-[200px]"
                    name="coverImage"
                />
            </div>

            {/* Car Images */}
            <div>
                <Text className="text-lg font-semibold mb-2">
                    {labels.carImages} <span className="text-red-500">*</span>
                </Text>
                <Text className="text-sm text-gray-500 mb-3">
                    {labels.tenImages}
                </Text>
                <ImageUploader
                    ref={carImagesRef}
                    maxImages={10}
                    onChange={handleCarImagesChange}
                    setDisableForm={setIsFormDisabled}
                    value={carCondition.carImages}
                    dropzoneClassName="min-h-[200px]"
                    name="carImages"
                />
            </div>

            {/* Documents */}
            <div>
                <Text className="text-lg font-semibold mb-2">
                    {labels.documents}
                </Text>
                <Text className="text-sm text-gray-500 mb-3">
                    {labels.tenFiles}
                </Text>
                <ImageUploader
                    ref={documentsRef}
                    maxImages={10}
                    onChange={handleDocumentsChange}
                    setDisableForm={setIsFormDisabled}
                    value={carCondition.documents}
                    acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                    dropzoneClassName="min-h-[200px]"
                    name="documents"
                />
            </div>

            {/* Additional Images */}
            <div>
                <Text className="text-lg font-semibold mb-2">
                    {labels.additionalImages}
                </Text>
                <Text className="text-sm text-gray-500 mb-3">
                    {labels.tenImages}
                </Text>
                <ImageUploader
                    ref={additionalImagesRef}
                    maxImages={10}
                    onChange={handleAdditionalImagesChange}
                    setDisableForm={setIsFormDisabled}
                    value={carCondition.additionalImages}
                    dropzoneClassName="min-h-[200px]"
                    name="additionalImages"
                />
            </div>
        </div>
    ), [
        labels, 
        handleCoverImageChange, 
        handleCarImagesChange, 
        handleDocumentsChange, 
        handleAdditionalImagesChange,
        carCondition.coverImage,
        carCondition.carImages,
        carCondition.documents,
        carCondition.additionalImages,
        isFormDisabled
    ]);

    return (
        <div className="w-full space-y-6" dir={direction}>
            {/* Car Information Section */}
            <Card className="w-full shadow-sm">
                <CardHeader className="bg-gray-100 py-4">
                    <Text className="text-xl font-bold text-primary text-center">{labels.carInfo}</Text>
                </CardHeader>
                <CardContent className="p-0">
                    <CarConditionTable />
                </CardContent>
            </Card>

            {/* Car Photos Section */}
            <Card className="w-full shadow-sm">
                <CardHeader className="bg-gray-100 py-4">
                    <Text className="text-xl font-bold text-primary text-center px-4">{labels.carPhotos}</Text>
                </CardHeader>
                <CardContent>
                    <CarPhotosSection />
                </CardContent>
            </Card>
        </div>
    )
}

export default React.memo(AddProductStepThree)