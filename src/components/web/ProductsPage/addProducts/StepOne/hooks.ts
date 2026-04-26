// hooks.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getInjection } from "@/di/container";
import { ListingTypeRefItemDto } from "@/core/entities/models/listing-type-refs/listing-type-refs.dto";
import { SchemaAttributeDto } from "@/core/entities/models/listing-types/listing-types.dto";
import { SelectedOptions } from "./types";
import { getGovernorateOptions, getCityOptions, getYearOptions, validateForm } from "./utils";
import { loadSelections, saveSelections } from "./StorageUtils";
import { STORAGE_KEYS } from "../main/hooks/useLocalStorage";

/**
 * Custom hook for managing the product step one form
 */
export const useProductStepOne = (
    onValidationChange: (isValid: boolean) => void,
    externalListingTypeId?: number | string
) => {
    const t = useTranslations("addProduct");
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    const isArabic = direction === "rtl";

    // Start with default empty state for server rendering
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(loadSelections());
    const [isClient, setIsClient] = useState(false);
    const [prevValidationState, setPrevValidationState] = useState(false);

    // Dynamic schema and reference data
    const [groupIds, setGroupIds] = useState({ make: 0, model: 0, trim: 0 });
    const [isTrimInSchema, setIsTrimInSchema] = useState(false);
    const [makes, setMakes] = useState<ListingTypeRefItemDto[]>([]);
    const [models, setModels] = useState<ListingTypeRefItemDto[]>([]);
    const [trims, setTrims] = useState<ListingTypeRefItemDto[]>([]);
    const [loading, setLoading] = useState({ schema: false, makes: false, models: false, trims: false });
    const [error, setError] = useState<string | null>(null);

    // Create refs to track user interactions vs. initial load
    const isInitialLoad = useRef(true);
    const userChangedMarka = useRef(false);
    const userChangedModel = useRef(false);
    const userChangedGovernorate = useRef(false);
    const editModeDataApplied = useRef(false);

    // Set isClient to true once the component has mounted
    useEffect(() => {
        setIsClient(true);
        window.scrollTo(0, 0);

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

    // 1. Get Listing Type ID from external prop, else localStorage, else default to 1 (Cars)
    const listingTypeId = useMemo(() => {
        if (externalListingTypeId) return Number(externalListingTypeId);
        if (typeof window === 'undefined') return 1; 
        const stored = localStorage.getItem(STORAGE_KEYS.STEP_ONE);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.id || 1;
            } catch (e) {
                return 1;
            }
        }
        return 1;
    }, [externalListingTypeId]);

    // 2. Fetch Schema to get Reference Group IDs
    useEffect(() => {
        const fetchSchema = async () => {
            setLoading(prev => ({ ...prev, schema: true }));
            try {
                const controller = getInjection('IListingTypesRepoController');
                const res = await controller.getActiveSchema(listingTypeId);
                if (res.success && res.data) {
                    const attrs: Record<string, SchemaAttributeDto> = res.data.attributes;
                    const newGroupIds = { make: 0, model: 0, trim: 0 };
                    let trimFound = false;

                    for (const [slug, attr] of Object.entries(attrs)) {
                        const lowSlug = slug.toLowerCase();
                        if (lowSlug === 'make' || lowSlug === 'branda') {
                            newGroupIds.make = attr.referenceGroupId || 0;
                        } else if (lowSlug === 'model') {
                            newGroupIds.model = attr.referenceGroupId || 0;
                        } else if (lowSlug === 'trim') {
                            newGroupIds.trim = attr.referenceGroupId || 0;
                            trimFound = true;
                        }
                    }
                    setGroupIds(newGroupIds);
                    setIsTrimInSchema(trimFound);
                }
            } catch (err) {
                console.error("Failed to fetch schema for ref groups", err);
                setError("Failed to fetch schema");
            } finally {
                setLoading(prev => ({ ...prev, schema: false }));
            }
        };
        fetchSchema();
    }, [listingTypeId]);

    // 3. Fetch Makes
    useEffect(() => {
        if (!groupIds.make) return;
        const fetchMakes = async () => {
            setLoading(prev => ({ ...prev, makes: true }));
            try {
                const controller = getInjection('IListingTypeRefsRepoController');
                const res = await controller.getItemsByGroupId(groupIds.make, undefined, 1000);
                if (res.success && res.data) {
                    setMakes(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch makes", err);
            } finally {
                setLoading(prev => ({ ...prev, makes: false }));
            }
        };
        fetchMakes();
    }, [groupIds.make]);

    // 4. Fetch Models (dependent on Make)
    useEffect(() => {
        if (!groupIds.model || !selectedOptions.marka) {
            setModels([]);
            return;
        }
        const fetchModels = async () => {
            setLoading(prev => ({ ...prev, models: true }));
            try {
                const controller = getInjection('IListingTypeRefsRepoController');
                const res = await controller.getItemsByGroupId(groupIds.model, Number(selectedOptions.marka), 1000);
                if (res.success && res.data) {
                    setModels(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch models", err);
            } finally {
                setLoading(prev => ({ ...prev, models: false }));
            }
        };
        fetchModels();
    }, [groupIds.model, selectedOptions.marka]);

    // 5. Fetch Trims (dependent on Model)
    useEffect(() => {
        if (!groupIds.trim || !selectedOptions.model) {
            setTrims([]);
            return;
        }
        const fetchTrims = async () => {
            setLoading(prev => ({ ...prev, trims: true }));
            try {
                const controller = getInjection('IListingTypeRefsRepoController');
                const res = await controller.getItemsByGroupId(groupIds.trim, Number(selectedOptions.model), 1000);
                if (res.success && res.data) {
                    setTrims(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch trims", err);
            } finally {
                setLoading(prev => ({ ...prev, trims: false }));
            }
        };
        fetchTrims();
    }, [groupIds.trim, selectedOptions.model]);

    // Helper for multilingual translation
    const getTranslation = useCallback((val: any) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            return val[locale] || val['en'] || val['ar'] || "";
        }
        return String(val);
    }, [locale]);

    // Transform data for SelectableList components
    const carMarka = useMemo(() =>
        makes.map(item => ({
            value: item.id.toString(),
            label: getTranslation(item.name),
            logoUrl: item.logoUrl || item.iconUrl || undefined,
        })).sort((a, b) => a.label.localeCompare(b.label)),
        [makes, getTranslation]
    );

    const carModel = useMemo(() =>
        models.map(item => ({
            value: item.id.toString(),
            label: getTranslation(item.name),
        })).sort((a, b) => a.label.localeCompare(b.label)),
        [models, getTranslation]
    );

    const carTrim = useMemo(() =>
        trims.map(item => ({
            value: item.id.toString(),
            label: getTranslation(item.name),
        })).sort((a, b) => a.label.localeCompare(b.label)),
        [trims, getTranslation]
    );

    const isTrimRequired = useMemo(() => {
        // If trim is in schema, we assume it's required for this step
        // In a more complex scenario, we could check attr.isRequired from schema
        return isTrimInSchema;
    }, [isTrimInSchema]);


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
                    trim: "",
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
                    trim: "",
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
        const isValid = validateForm(selectedOptions, isTrimRequired);

        if (isValid !== prevValidationState && onValidationChange) {
            onValidationChange(isValid);
            setPrevValidationState(isValid);
        }
    }, [selectedOptions, onValidationChange, prevValidationState, isTrimRequired]);

    // Check for errors
    const hasErrors = !!error;

    // Translated titles
    const titles = useMemo(() => ({
        model: t("enteredData.stepOne.model.title"),
        brand: t("enteredData.stepOne.branda.title"),
        trim: isArabic ? "الفئة" : "Trim",
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
        isTrimRequired,
        governorateOptions,
        cityOptions,
        madeYear,
        hasErrors,
        titles,
        handleSelectChange,
        handleAddressChange,
        handleStoryChange,
        setInitialEditData,
        loading,
    };
};