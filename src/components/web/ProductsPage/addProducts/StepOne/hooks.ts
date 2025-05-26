// hooks.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
    useCarMakes,
    useCarModels,
    useCarTrims,
} from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions";
import { Filter } from "@/core/entities/api/api";
import { SelectedOptions } from "./types";
import { getGovernorateOptions, getCityOptions, getYearOptions, validateForm } from "./utils";
import { loadSelections, saveSelections } from "./StorageUtils";

/**
 * Custom hook for managing the product step one form
 */
export const useProductStepOne = (onValidationChange: (isValid: boolean) => void) => {
    const t = useTranslations("addProduct");
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    const isArabic = direction === "rtl";

    // Start with default empty state for server rendering
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(loadSelections());
    const [isClient, setIsClient] = useState(false);
    const [prevValidationState, setPrevValidationState] = useState(false);
    
    // Create refs to track user interactions vs. initial load
    const isInitialLoad = useRef(true);
    const userChangedMarka = useRef(false);
    const userChangedModel = useRef(false);
    const userChangedGovernorate = useRef(false);
    const editModeDataApplied = useRef(false);
    
    // Set isClient to true once the component has mounted
    useEffect(() => {
        setIsClient(true);
        
        // Mark when the initial load is complete
        const timer = setTimeout(() => {
            isInitialLoad.current = false;
        }, 1000); // Give enough time for API calls to complete
        
        return () => clearTimeout(timer);
    }, []);

    // Save to localStorage whenever selections change, but only after client-side rendering is confirmed
    useEffect(() => {
        if (isClient) {
            saveSelections(selectedOptions);
        }
    }, [selectedOptions, isClient]);

    // Function to set initial data for edit mode
    const setInitialEditData = useCallback((editData: SelectedOptions) => {
        // Only apply edit data once
        if (!editModeDataApplied.current) {
            
            setSelectedOptions(editData);
            editModeDataApplied.current = true;
            
            // Set validation based on provided data
            if (onValidationChange && validateForm(editData)) {
                onValidationChange(true);
                setPrevValidationState(true);
            }
        }
    }, [onValidationChange]);

    // Extract IDs only when needed
    const makeId = selectedOptions.marka ? Number.parseInt(selectedOptions.marka) : undefined;
    const modelId = selectedOptions.model ? Number.parseInt(selectedOptions.model) : undefined;

    // Build filters based on selected values
    const makeFilter: Filter[] | undefined = makeId ? [{ field: "makeId", operator: "eq", value: makeId }] : undefined;
    const modelFilter: Filter[] | undefined = modelId ? [{ field: "modelId", operator: "eq", value: modelId }] : undefined;

    // Data fetching with appropriate filters
    const { data: carMakesResponse, error: makesError } = useCarMakes({ pageSize: 200 });
    const { data: carModelsResponse, error: modelsError } = useCarModels({ where: makeFilter , pageSize: 200 });
    const { data: carTrimsResponse, error: trimsError } = useCarTrims({ where: modelFilter , pageSize: 200 });

    console.log("Car Makes Response:", carMakesResponse);

    // Transform data for SelectableList components
    const carMarka = useMemo(() => 
        carMakesResponse?.data?.data?.map(make => ({
            value: make.id.toString(),
            label: make.name,
            logoUrl: make.logoUrl,
        })).sort((a, b) => a.label.localeCompare(b.label)) || [] ,
        [carMakesResponse]
    );

    const carModel = useMemo(() => 
        carModelsResponse?.data?.data?.map(model => ({
            value: model.id.toString(),
            label: model.name,
        })).sort((a, b) => a.label.localeCompare(b.label)) || [], 
        [carModelsResponse]
    );

    const carTrim = useMemo(() => 
        carTrimsResponse?.data?.data?.map(trim => ({
            value: trim.id.toString(),
            label: trim.name,
        })).sort((a, b) => a.label.localeCompare(b.label)) || [],
        [carTrimsResponse]
    );

    // Location options
    const governorateOptions = useMemo(() => getGovernorateOptions(isArabic), [isArabic]);
    const cityOptions = useMemo(() => getCityOptions(selectedOptions.governorate, isArabic), [selectedOptions.governorate, isArabic]);
    const madeYear = useMemo(() => getYearOptions(t), [t]);

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

    // Handle address input change
    const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSelectedOptions(prev => ({ ...prev, address: e.target.value }));
    }, []);

    // Handle story text changes
    const handleStoryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSelectedOptions(prev => ({ ...prev, story: e.target.value }));
    }, []);

    // Validate and notify parent component
    useEffect(() => {
        const isValid = validateForm(selectedOptions);
        
        if (isValid !== prevValidationState && onValidationChange) {
            onValidationChange(isValid);
            setPrevValidationState(isValid);
        }
    }, [selectedOptions, onValidationChange, prevValidationState]);

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

    return {
        selectedOptions,
        direction,
        carMarka,
        carModel,
        carTrim,
        governorateOptions,
        cityOptions,
        madeYear,
        hasErrors,
        titles,
        handleSelectChange,
        handleAddressChange,
        handleStoryChange,
        setInitialEditData, // Export this function to be used by the component
    };
};