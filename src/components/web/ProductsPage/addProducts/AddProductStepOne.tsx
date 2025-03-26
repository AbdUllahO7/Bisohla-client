// Updated AddProductStepOne.tsx with location selectors and address field

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useLocale, useTranslations } from "next-intl"
import SelectableList from "./SelectableList"
import {
    useCarMakes,
    useCarModels,
    useCarTrims,
} from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions"
import { Filter } from "@/core/entities/api/api"
import { 
    SyriaGovernorate, 
    SyriaCity,
    SyriaGovernorate_ARABIC_NAMES, 
    SyriaCity_ARABIC_NAMES,
    SyriaGovernorate_TO_CITIES 
} from "@/core/entities/enums/syria.enums"

// Define the prop types for the component
interface AddProductStepOneProps {
    onValidationChange: (isValid: boolean) => void;
}

// Define the options state interface
interface SelectedOptions {
    marka: string;
    model: string;
    trim: string;
    year: string;
    story: string;
    governorate: string;
    city: string;
    address: string;
}

const STORAGE_KEY = "addProduct_stepOne_selections";

// Default empty state
const defaultOptions = {
    marka: "",
    model: "",
    trim: "",
    year: "",
    story: "",
    governorate: "",
    city: "",
    address: ""
};

const AddProductStepOne: React.FC<AddProductStepOneProps> = ({ onValidationChange }) => {
    const t = useTranslations("addProduct")
    const locale = useLocale()
    const direction = locale === "ar" ? "rtl" : "ltr"
    const isArabic = direction === "rtl"

    // Start with default empty state for server rendering
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(defaultOptions);
    const [isClient, setIsClient] = useState(false);
    const [prevValidationState, setPrevValidationState] = useState(false);
    
    // Create refs to track user interactions vs. initial load
    const isInitialLoad = useRef(true);
    const userChangedMarka = useRef(false);
    const userChangedModel = useRef(false);
    const userChangedGovernorate = useRef(false);
    
    // Set isClient to true once the component has mounted
    // This ensures hydration is complete before any client-specific code runs
    useEffect(() => {
        setIsClient(true);
        
        // After we know we're on the client, load from localStorage
        const savedSelections = localStorage.getItem(STORAGE_KEY);
        if (savedSelections) {
            setSelectedOptions(JSON.parse(savedSelections));
        }
        
        // Mark when the initial load is complete
        const timer = setTimeout(() => {
            isInitialLoad.current = false;
        }, 1000); // Give enough time for API calls to complete
        
        return () => clearTimeout(timer);
    }, []);

    // Save to localStorage whenever selections change, but only after client-side rendering is confirmed
    useEffect(() => {
        if (isClient) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedOptions));
        }
    }, [selectedOptions, isClient]);

    // Extract IDs only when needed
    const makeId = selectedOptions.marka ? Number.parseInt(selectedOptions.marka) : undefined
    const modelId = selectedOptions.model ? Number.parseInt(selectedOptions.model) : undefined

    // Build filters based on selected values
    const makeFilter: Filter[] | undefined = makeId ? [{ field: "makeId", operator: "eq", value: makeId }] : undefined
    const modelFilter: Filter[] | undefined = modelId ? [{ field: "modelId", operator: "eq", value: modelId }] : undefined

    // Data fetching with appropriate filters
    const { data: carMakesResponse, error: makesError } = useCarMakes({ page: 1 })
    const { data: carModelsResponse, error: modelsError } = useCarModels({ where: makeFilter })
    const { data: carTrimsResponse, error: trimsError } = useCarTrims({ where: modelFilter })

    // Transform data for SelectableList components
    const carMarka = useMemo(() => 
        carMakesResponse?.data?.data?.map(make => ({
            value: make.id.toString(),
            label: make.name,
        })) || [], 
        [carMakesResponse]
    )

    const carModel = useMemo(() => 
        carModelsResponse?.data?.data?.map(model => ({
            value: model.id.toString(),
            label: model.name,
        })) || [], 
        [carModelsResponse]
    )

    const carTrim = useMemo(() => 
        carTrimsResponse?.data?.data?.map(trim => ({
            value: trim.id.toString(),
            label: trim.name,
        })) || [], 
        [carTrimsResponse]
    )

    // Prepare governorate options with bilingual support
    const governorateOptions = useMemo(() => 
        Object.values(SyriaGovernorate).map(gov => ({
            value: gov,
            label: isArabic 
                ? SyriaGovernorate_ARABIC_NAMES[gov]
                : gov.replace(/-/g, ' ')
        })),
        [isArabic]
    );

    // Prepare city options based on selected governorate
    const cityOptions = useMemo(() => {
        if (!selectedOptions.governorate) return [];
        
        const selectedGov = selectedOptions.governorate as SyriaGovernorate;
        return SyriaGovernorate_TO_CITIES[selectedGov].map(city => ({
            value: city,
            label: isArabic
                ? SyriaCity_ARABIC_NAMES[city]
                : city.replace(/-/g, ' ')
        }));
    }, [selectedOptions.governorate, isArabic]);

    // Only reset dependent fields on user-initiated changes, not on initial load
    const handleSelectChange = useCallback((type: string, value: string) => {
        if (type === "marka") {
            userChangedMarka.current = true;
            
            // Only reset dependent fields if this is a user change, not initial load
            if (!isInitialLoad.current) {
                setSelectedOptions(prev => ({
                    ...prev,
                    [type]: value,
                    model: "",
                    trim: ""
                }));
            } else {
                setSelectedOptions(prev => ({
                    ...prev,
                    [type]: value
                }));
            }
        } else if (type === "model") {
            userChangedModel.current = true;
            
            // Only reset trim if this is a user change, not initial load
            if (!isInitialLoad.current) {
                setSelectedOptions(prev => ({
                    ...prev,
                    [type]: value,
                    trim: ""
                }));
            } else {
                setSelectedOptions(prev => ({
                    ...prev,
                    [type]: value
                }));
            }
        } else if (type === "governorate") {
            userChangedGovernorate.current = true;
            
            // Only reset city if this is a user change, not initial load
            if (!isInitialLoad.current) {
                setSelectedOptions(prev => ({
                    ...prev,
                    [type]: value,
                    city: ""
                }));
            } else {
                setSelectedOptions(prev => ({
                    ...prev,
                    [type]: value
                }));
            }
        } else {
            // For other fields, just update normally
            setSelectedOptions(prev => ({
                ...prev,
                [type]: value
            }));
        }
    }, []);

    // Handle address input change - Fixed to use HTMLTextAreaElement
    const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSelectedOptions(prev => ({ ...prev, address: e.target.value }));
    }, []);

    // Handle story text changes
    const handleStoryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSelectedOptions(prev => ({ ...prev, story: e.target.value }));
    }, []);

    // Validate and notify parent component
    useEffect(() => {
        const isValid = Boolean(
            selectedOptions.marka && 
            selectedOptions.model && 
            selectedOptions.trim && 
            selectedOptions.year &&
            selectedOptions.governorate &&
            selectedOptions.city &&
            selectedOptions.address
        );
        
        if (isValid !== prevValidationState && onValidationChange) {
            onValidationChange(isValid);
            setPrevValidationState(isValid);
        }
    }, [selectedOptions, onValidationChange, prevValidationState]);

    // Year options
    const madeYear = useMemo(() => 
        [2020, 2021, 2022, 2023, 2024].map(year => ({
            value: year.toString(),
            label: t(`enteredData.stepOne.madeYear.options.${year}`)
        })),
        [t]
    );
    
    // Check for errors
    const hasErrors = makesError || modelsError || trimsError;

    // Translated titles
    const titles = useMemo(() => ({
        trim: t("enteredData.stepOne.trims.title") || "Trim",
        model: t("enteredData.stepOne.model.title"),
        brand: t("enteredData.stepOne.branda.title"),
        year: t("enteredData.stepOne.madeYear.title"),
        governorate: isArabic ? "المحافظة" : "Governorate",
        city: isArabic ? "المدينة" : "City",
        address: isArabic ? "العنوان التفصيلي" : "Detailed Address",
        addressPlaceholder: isArabic ? "أدخل العنوان التفصيلي هنا" : "Enter detailed address here",
        story: isArabic ? "قصة السيارة" : "Story of car",
        placeholder: isArabic ? "اكتب رسالتك هنا" : "Write your message here",
        error: isArabic 
        ? "حدث خطأ أثناء تحميل بعض البيانات. الرجاء المحاولة مرة أخرى لاحقًا."
        : "There was an error loading some data. Please try again later."
    }), [t, isArabic]);

    return (
        <Box
            className="w-full justify-start items-center bg-white rounded-lg flex-wrap xs:justify-center"
            variant="column"
            dir={direction}
        >
            {hasErrors && (
                <Box className="w-full p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <Text className="text-red-600 font-semibold">{titles.error}</Text>
                </Box>
            )}

            <Box className="w-full justify-start items-center flex-wrap grid grid-cols-4 xs:justify-center" variant="row">
                {/* Car selection fields */}
                <SelectableList
                    title={titles.brand}
                    type="marka"
                    options={carMarka}
                    selectedValue={selectedOptions.marka}
                    direction={direction}
                    onSelect={handleSelectChange}
                    required={true}
                />

                <SelectableList
                    title={titles.model}
                    type="model"
                    options={selectedOptions.marka ? carModel : []}
                    selectedValue={selectedOptions.model}
                    direction={direction}
                    onSelect={handleSelectChange}
                    required={true}
                />

                <SelectableList
                    title={titles.trim}
                    type="trim"
                    options={selectedOptions.model ? carTrim : []}
                    selectedValue={selectedOptions.trim}
                    direction={direction}
                    onSelect={handleSelectChange}
                    required={true}
                />

                <SelectableList
                    title={titles.year}
                    type="year"
                    options={madeYear}
                    selectedValue={selectedOptions.year}
                    direction={direction}
                    onSelect={handleSelectChange}
                    required={true}
                />

                {/* Location selection fields */}
                <SelectableList
                    title={titles.governorate}
                    type="governorate"
                    options={governorateOptions}
                    selectedValue={selectedOptions.governorate}
                    direction={direction}
                    onSelect={handleSelectChange}
                    required={true}
                />

                <SelectableList
                    title={titles.city}
                    type="city"
                    options={selectedOptions.governorate ? cityOptions : []}
                    selectedValue={selectedOptions.city}
                    direction={direction}
                    onSelect={handleSelectChange}
                    required={true}
                />

                {/* Address field */}
                <Box className=" py-5 " variant="column">
                    <Text className="text-primary font-bold text-xl border-b border-primary-foreground pb-2">
                        {titles.address} <span className="text-red-500">*</span>
                    </Text>
                    <Box className="mt-4" variant="column">
                        <Textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={titles.addressPlaceholder}
                            value={selectedOptions.address}
                            onChange={handleAddressChange}
                            cols={30}
                            rows={13}
                            dir={direction}
                        />
                    </Box>
                </Box>

                {/* Story field */}
                <Box className="min-w-[250px] py-5 col-span-2 px-5" variant="column">
                    <Text className="text-primary font-bold text-xl border-b border-primary-foreground pb-2">
                        {titles.story}
                    </Text>
                    <Textarea
                        className="px-5 border-gray-100 mt-4"
                        placeholder={titles.placeholder}
                        id="message-2"
                        cols={20}
                        rows={17}
                        value={selectedOptions.story}
                        onChange={handleStoryChange}
                        dir={direction}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default React.memo(AddProductStepOne)