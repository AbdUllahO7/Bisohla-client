import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, FileText, Phone, DollarSign, MapPin, Sliders, CheckCircle2, Award, Info, Bookmark } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { ListingType, RentType, SaveStatus, getListingTypeOptions, getRentTypeOptions, getSaveStatusOptions } from "@/core/entities/enums/cars.enums"
import { adInformationSchema, type AdInformationFormData } from "./schema"
import type { AddProductStepFourProps, AdInfoState } from "./types"
import SelectableList from "../StepOne/SelectableList"
import { 
  SyriaGovernorate, 
  SyriaGovernorate_ARABIC_NAMES, 
  SyriaCity, 
  SyriaCity_ARABIC_NAMES, 
  SyriaGovernorate_TO_CITIES 
} from "@/core/entities/enums/syria.enums"
import {
  getContactErrorMessage,
  getDescriptionErrorMessage,
  getPublicationDateErrorMessage,
  getTitleErrorMessage,
  getSaveStatusErrorMessage,
  validateForm,
  getPriceErrorMessage
} from "./validationUtils"
import {
  autoSaveAdInfoData,
  combinePhoneNumber,
  defaultAdInfoData,
  getAdInfoStorageKey,
  loadAdInfoData,
  parsePhoneNumber,
  saveAdInfoData
} from "./storageUtils"
import Text from "@/components/ui/text"
import { Currency, getCurrencyOptions } from "@/core/entities/enums/currency.enum"
import { useProfile } from "@/providers/profile.provider"
import { useSettings } from "@/providers/settings.provider"
import { useSavedAddresses } from "@/core/infrastructure-adapters/use-actions/users/saved-address.use-actions"
import { SavedAddressPickerDialog } from "@/components/web/SavedAddresses/SavedAddressPickerDialog"
import { findMatchingSavedAddress } from "@/core/lib/saved-address-match"
import { UserAddress } from "@/core/entities/models/users/saved-address.dto"
import PhoneField from "@/components/forms/phone-field"
import { assemblePhone, splitPhone, repairPhone } from "@/core/lib/phone/phone.util"
import InstallmentsCard from "./InstallmentsCard"
import { ListingInstallmentOption, ListingInstallmentsMode } from "@/core/entities/models/listings/installments.dto"
import { EDIT_STORAGE_KEYS, getStorageKey, STORAGE_KEYS } from "../Main/hooks/useLocalStorage"

// Simplified EnumSelect component without internal state tracking
interface EnumSelectProps {
  name: string;
  control: any;
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  required?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  isRtl?: boolean;
  className?: string;
  disabled?: boolean;
  hint?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const EnumSelect = ({
  name,
  control,
  label,
  options,
  placeholder,
  required = false,
  onChange,
  value,
  isRtl = false,
  className = "",
  disabled = false,
  hint,
  headerAction,
}: EnumSelectProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`text-primary ${className}`}>
          <div className="flex items-center justify-between gap-2">
            <FormLabel className="text-primary dark:text-white">
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
            {headerAction}
          </div>
          <Select
            disabled={disabled}
            onValueChange={(val) => {
              field.onChange(val);
              if (onChange) {
                onChange(val);
              }
            }}
            value={field.value || value || ""}
            dir={`${isRtl ? "rtl" : "ltr"}`}
          >
            <FormControl>
              <SelectTrigger className="h-11 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white disabled:opacity-85 disabled:bg-slate-50 dark:disabled:bg-zinc-850">
                <SelectValue placeholder={placeholder} dir={`${isRtl ? "rtl" : "ltr"}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className="bg-white dark:bg-zinc-900 shadow-2xl text-primary dark:text-white border dark:border-zinc-800 !z-[99999]"
              dir={`${isRtl ? "rtl" : "ltr"}`}
              position="popper"
              sideOffset={4}
              style={{
                zIndex: 99999,
                position: 'fixed'
              }}
            >
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hint && <div className="mt-1">{hint}</div>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const AddProductStepFour: React.FC<AddProductStepFourProps> = ({
  onValidationChange,
  isEditMode = false,
  initialData = null
}) => {
  const [showRentType, setShowRentType] = useState(false);
  const [direction, setDirection] = useState<string>("ltr");
  const previousFormData = useRef<AdInformationFormData | null>(null);
  const prevValidState = useRef<boolean | null>(null);
  const editModeDataApplied = useRef<boolean>(false);
  const validationCheckRunning = useRef<boolean>(false);
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: 33.5138, lng: 36.2765 });

  const tListing = useTranslations("listing");
  const { getListingsSettings } = useSettings();
  const isSavedAddressesEnabled =
    getListingsSettings()?.location?.saved_addresses_enabled ?? true;

  const { data: savedAddressesResponse, isLoading: isLoadingSavedAddresses } =
    useSavedAddresses({ enabled: isSavedAddressesEnabled });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const autoPrefillDoneRef = useRef(false);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Create state for enum values as form backups
  const [listingTypeValue, setListingTypeValue] = useState<ListingType | "">("");
  const [rentTypeValue, setRentTypeValue] = useState<RentType | null>(null);
  const [saveStatusValue, setSaveStatusValue] = useState<SaveStatus | "">("");
  const [currencyValue, setCurrencyValue] = useState<Currency | "">("");
  const [countryDialCodeValue, setCountryDialCodeValue] = useState<string>("+963");
  const countryDialCodeRef = useRef<string>("+963");

  const [listingTypePolicy, setListingTypePolicy] = useState<{
    rentEnabled?: boolean;
    installmentsEnabled?: boolean;
    installmentsMode?: ListingInstallmentsMode;
    installmentOptions?: ListingInstallmentOption[];
  } | null>(null);

  useEffect(() => {
    countryDialCodeRef.current = countryDialCodeValue;
  }, [countryDialCodeValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stepOneKey = getStorageKey('STEP_ONE', isEditMode);
    const stepOneRaw = localStorage.getItem(stepOneKey) || localStorage.getItem(STORAGE_KEYS.STEP_ONE);
    if (stepOneRaw) {
      try {
        const parsed = JSON.parse(stepOneRaw);
        setListingTypePolicy({
          rentEnabled: parsed.rentEnabled,
          installmentsEnabled: parsed.installmentsEnabled,
          installmentsMode: parsed.installmentsMode,
          installmentOptions: parsed.installmentOptions,
        });
      } catch (e) {
        console.error("Failed to parse STEP_ONE policy in StepFour", e);
      }
    }
  }, [isEditMode]);

  // §7.5 Policy clamp — run whenever the policy resolves (e.g. admin disabled installments after draft was saved)
  useEffect(() => {
    if (!listingTypePolicy) return;

    // Clamp 1: rentEnabled === false → force for_sale, clear rentType
    if (listingTypePolicy.rentEnabled === false) {
      const currentOffer = form.getValues('listingType');
      if (currentOffer === 'for_rent') {
        form.setValue('listingType', 'for_sale' as any, { shouldValidate: true });
        form.setValue('rentType', null, { shouldValidate: true });
        setListingTypeValue(ListingType.FOR_SALE);
        setShowRentType(false);
        setRentTypeValue(null);
      }
    }

    // Clamp 2: installmentsEnabled === false → disable installments (keep plans in state)
    if (listingTypePolicy.installmentsEnabled === false) {
      const currentAvail = form.getValues('installmentsAvailable');
      if (currentAvail) {
        form.setValue('installmentsAvailable', false, { shouldValidate: true });
      }
    }
  }, [listingTypePolicy]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mapInstance: any = null;
    let markerInstance: any = null;

    const loadLeaflet = () => {
      if ((window as any).L) {
        initLeafletMap();
        return;
      }

      // Load Leaflet CSS dynamically
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      // Load Leaflet JS dynamically
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        initLeafletMap();
      };
      document.head.appendChild(script);
    };

    const initLeafletMap = () => {
      const L = (window as any).L;
      if (!mapRef.current || !L) return;

      const savedLat = form.getValues('latitude');
      const savedLng = form.getValues('longitude');
      const defaultLatLng = savedLat != null && savedLng != null
        ? [savedLat, savedLng]
        : [33.5138, 36.2765]; // Damascus

      // Initialize Leaflet map instance
      mapInstance = L.map(mapRef.current).setView(defaultLatLng, savedLat != null ? 14 : 13);

      // Add high-performance OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Create interactive draggable marker pin
      markerInstance = L.marker(defaultLatLng, { draggable: true }).addTo(mapInstance);

      mapInstanceRef.current = mapInstance;
      markerInstanceRef.current = markerInstance;

      // Move marker on map click
      mapInstance.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        markerInstance.setLatLng([lat, lng]);
        updateAddressFromCoords(lat, lng);
      });

      // Move marker on dragend
      markerInstance.on("dragend", () => {
        const { lat, lng } = markerInstance.getLatLng();
        updateAddressFromCoords(lat, lng);
      });
    };

    const updateAddressFromCoords = (lat: number, lng: number) => {
      setGpsCoords({ lat, lng });
      form.setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
      form.setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });
      
      // Query Nominatim in Arabic to get standard Syrian governorate and city names
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            const displayName = data.display_name || "";
            const addressObj = data.address || {};
            
            // Join everything to get a single, unified text to search for Arabic words
            const fullText = [
              displayName,
              ...Object.values(addressObj).map(v => String(v))
            ].join(" ");
            
            // 1. Match Governorate (المحافظة)
            let matchedGov: string | null = null;
            for (const [govKey, govArabic] of Object.entries(SyriaGovernorate_ARABIC_NAMES)) {
              if (fullText.includes(govArabic)) {
                matchedGov = govKey;
                break;
              }
            }
            
            // 2. Match City (المدينة)
            let matchedCity: string | null = null;
            for (const [cityKey, cityArabic] of Object.entries(SyriaCity_ARABIC_NAMES)) {
              if (fullText.includes(cityArabic)) {
                matchedCity = cityKey;
                break;
              }
            }
            
            // Set values and trigger form validation updates
            if (matchedGov) {
              form.setValue("governorate", matchedGov as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              form.setValue("detectedGovernorate", matchedGov, { shouldValidate: true, shouldDirty: true });
            } else {
              form.setValue("detectedGovernorate", null, { shouldValidate: true, shouldDirty: true });
            }
            
            if (matchedCity) {
              form.setValue("city", matchedCity as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            }

            // Force form to re-validate fields immediately to clear any error messages
            form.trigger(["governorate", "city"]);

            // 3. Set Detailed Address
            if (displayName) {
              form.setValue("address", displayName, { shouldValidate: true, shouldDirty: true });
            }
          } else {
            form.setValue("detectedGovernorate", null, { shouldValidate: true, shouldDirty: true });
            form.setValue("address", `${direction === "rtl" ? "موقع محدد" : "Selected location"} (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          }
        })
        .catch(() => {
          form.setValue("detectedGovernorate", null, { shouldValidate: true, shouldDirty: true });
          form.setValue("address", `${direction === "rtl" ? "موقع محدد" : "Selected location"} (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        });
    };

    loadLeaflet();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [direction]);

  const t = useTranslations("addProduct.enteredData");
  const { profile } = useProfile();

  const rawListingTypeOptions = getListingTypeOptions(t);
  const listingTypeOptions = rawListingTypeOptions.filter(opt => {
    if (opt.value === ListingType.FOR_RENT && listingTypePolicy?.rentEnabled === false) {
      return false;
    }
    return true;
  });
  const rentTypeOptions = getRentTypeOptions(t);
  const saveStatusOptions = getSaveStatusOptions(t);
  const currencyOptions = getCurrencyOptions(t);

  // Initialize form with temporary default values
  const form = useForm<AdInformationFormData>({
    resolver: zodResolver(adInformationSchema),
    defaultValues: defaultAdInfoData,
    mode: "onChange",
  });

  const applyAddressToForm = (address: UserAddress) => {
    const lat = address.latitude;
    const lng = address.longitude;

    if (lat != null && lng != null) {
      form.setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
      form.setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });
      form.setValue("detectedGovernorate", address.governorate, { shouldValidate: true, shouldDirty: true });
      setGpsCoords({ lat, lng });

      if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 14);
        markerInstanceRef.current.setLatLng([lat, lng]);
      }
    }

    if (address.governorate != null) {
      form.setValue("governorate", address.governorate as any, { shouldValidate: true, shouldDirty: true });
    }
    if (address.city != null) {
      form.setValue("city", address.city as any, { shouldValidate: true, shouldDirty: true });
    }
    if (address.address != null) {
      form.setValue("address", address.address, { shouldValidate: true, shouldDirty: true });
    }

    form.trigger(["governorate", "city", "address"]);

    // Persist to draft in localStorage
    const currentDraft = loadAdInfoData() || defaultAdInfoData;
    saveAdInfoData({
      ...currentDraft,
      governorate: address.governorate || '',
      city: address.city || '',
      address: address.address || '',
      latitude: lat,
      longitude: lng,
      detectedGovernorate: address.governorate,
    });
  };

  // Auto-prefill from default saved address (one-shot ABSENT gate)
  useEffect(() => {
    if (
      !isSavedAddressesEnabled ||
      isEditMode ||
      autoPrefillDoneRef.current ||
      isLoadingSavedAddresses ||
      !savedAddressesResponse?.data
    ) {
      return;
    }

    const currentGov = form.getValues('governorate');
    const currentCity = form.getValues('city');
    const currentAddr = form.getValues('address');

    if (currentGov || currentCity || currentAddr) {
      autoPrefillDoneRef.current = true;
      return;
    }

    const defaultAddress = savedAddressesResponse.data.find((a) => a.isDefault);
    if (defaultAddress) {
      autoPrefillDoneRef.current = true;
      applyAddressToForm(defaultAddress);
    }
  }, [isSavedAddressesEnabled, isEditMode, isLoadingSavedAddresses, savedAddressesResponse]);

  // Check whether current location matches an already saved address
  const matchingSavedAddress = findMatchingSavedAddress(
    savedAddressesResponse?.data,
    {
      governorate: form.watch('governorate'),
      city: form.watch('city'),
      address: form.watch('address'),
      latitude: form.watch('latitude') || gpsCoords?.lat,
      longitude: form.watch('longitude') || gpsCoords?.lng,
    }
  );

  // Force-clear "Save this address for next time" if the address becomes a known address
  useEffect(() => {
    if (matchingSavedAddress && form.getValues('saveAsSavedAddress')) {
      form.setValue('saveAsSavedAddress', false);
      form.setValue('savedAddressLabel', '');
    }
  }, [matchingSavedAddress]);
  // Helper function to map API enums to form enums
  const mapApiEnumToFormEnum = (apiValue: string, enumType: any): any => {
    if (!apiValue) return Object.values(enumType)[0];

    if (Object.values(enumType).includes(apiValue)) {
      return apiValue;
    }

    const normApiValue = apiValue.toUpperCase().replace(/\s+/g, '_');

    for (const key in enumType) {
      const enumValue = enumType[key];
      const normEnumValue = key.toUpperCase().replace(/\s+/g, '_');

      if (
        apiValue === enumValue ||
        normApiValue === normEnumValue ||
        normApiValue.includes(normEnumValue) ||
        normEnumValue.includes(normApiValue)
      ) {
        return enumValue;
      }
    }

    console.warn(`Could not map API value "${apiValue}" to matching enum value`);
    return Object.values(enumType)[0];
  };

  // Check if the form data is valid
  const checkFormValidity = (data: Partial<AdInformationFormData>) => {
    if (validationCheckRunning.current) return false;
    validationCheckRunning.current = true;

    try {
      const listingType = data.listingType || listingTypeValue;
      const saveStatus = data.saveStatus || saveStatusValue;
      const currency = data.currency || currencyValue;
      const rentType = listingType === ListingType.FOR_RENT
        ? (data.rentType || rentTypeValue)
        : null;

      let isValid = Boolean(
        data.title &&
        data.description &&
        data.contactNumber &&
        listingType &&
        saveStatus &&
        data.price &&
        currency &&
        data.governorate &&
        data.city &&
        data.address
      );

      if (listingType === ListingType.FOR_RENT && !rentType) {
        isValid = false;
      }

      if (listingType === ListingType.FOR_SALE && data.installmentsAvailable) {
        if (!data.installmentPlans || data.installmentPlans.length === 0) {
          isValid = false;
        } else {
          const hasInvalid = data.installmentPlans.some(p => !p.months || !p.monthlyAmount || Number(p.monthlyAmount) <= 0);
          if (hasInvalid) {
            isValid = false;
          }
        }
      }

      return isValid;
    } finally {
      validationCheckRunning.current = false;
    }
  };

  // Apply edit data once
  const applyEditData = (editData: AdInformationFormData) => {
    if (editModeDataApplied.current) return;
    let phoneOnly = editData.contactNumber || "";
    let extractedCountryCode = editData.countryDialCode || countryDialCodeValue;

    if (editData.contactNumber && (editData.contactNumber.startsWith('+') || !editData.countryDialCode)) {
      const { dialCode, localNumber } = splitPhone(editData.contactNumber);
      extractedCountryCode = dialCode;
      phoneOnly = localNumber;
    }

    const mappedListingType = typeof editData.listingType === 'string'
      ? mapApiEnumToFormEnum(editData.listingType, ListingType)
      : editData.listingType;

    const mappedSaveStatus = typeof editData.saveStatus === 'string'
      ? mapApiEnumToFormEnum(editData.saveStatus, SaveStatus)
      : editData.saveStatus;

    const mappedRentType = editData.rentType && typeof editData.rentType === 'string'
      ? mapApiEnumToFormEnum(editData.rentType, RentType)
      : editData.rentType;

    const mappedCurrency = typeof editData.currency === 'string'
      ? mapApiEnumToFormEnum(editData.currency, Currency)
      : editData.currency || Currency.USD;

    setListingTypeValue(mappedListingType);
    setSaveStatusValue(mappedSaveStatus);
    setCurrencyValue(mappedCurrency);
    if (mappedRentType) {
      setRentTypeValue(mappedRentType);
    }
    setCountryDialCodeValue(extractedCountryCode);
    countryDialCodeRef.current = extractedCountryCode;

    const processedData: AdInformationFormData = {
      ...editData,
      countryDialCode: extractedCountryCode,
      contactNumber: phoneOnly,
      listingType: mappedListingType,
      saveStatus: mappedSaveStatus,
      rentType: mappedRentType,
      currency: mappedCurrency,
      installmentsAvailable: Boolean(editData.installmentsAvailable),
      installmentPlans: editData.installmentPlans || []
    };

    if (mappedListingType === ListingType.FOR_RENT) {
      setShowRentType(true);
    }

    form.reset(processedData);
    previousFormData.current = { ...processedData };

    const isValid = checkFormValidity(processedData);
    prevValidState.current = isValid;

    if (onValidationChange && isValid !== undefined) {
      onValidationChange(isValid);
    }

    editModeDataApplied.current = true;
  };

  // Initialize data on mount
  useEffect(() => {
    const htmlDir = document.documentElement.dir || "ltr";
    setDirection(htmlDir);
    window.scrollTo(0, 0);

    // 1. Try to load from localStorage (respects edit mode)
    const savedData = loadAdInfoData();
    const isActuallySaved = !!localStorage.getItem(getAdInfoStorageKey());

    // 2. Fallback to initialData if localStorage is empty and we are in edit mode
    if (!isActuallySaved && isEditMode && initialData && !editModeDataApplied.current) {
      // Find listing object (handle both direct listing or data[0] wrapper)
      const listing = initialData.data?.[0] || (initialData.id ? initialData : null);
      
      if (listing) {
        const formData: AdInformationFormData = {
          title: listing.title || '',
          description: listing.description || '',
          price: listing.price?.toString() || '',
          countryDialCode: '+963',
          contactNumber: listing.contactNumber || '',
          listingType: listing.listingOfferType || listing.listingType || ListingType.FOR_SALE,
          rentType: listing.rentType || null,
          installmentsAvailable: Boolean(listing.installmentsAvailable),
          installmentPlans: Array.isArray(listing.installmentPlans)
            ? listing.installmentPlans.map((p: any) => ({
                months: Number(p.months),
                downPayment: p.downPayment !== null && p.downPayment !== undefined ? p.downPayment.toString() : '',
                monthlyAmount: p.monthlyAmount !== null && p.monthlyAmount !== undefined ? p.monthlyAmount.toString() : '',
                noteTranslations: p.noteTranslations || (p.note ? { en: p.note, ar: p.note } : undefined),
              }))
            : [],
          saveStatus: listing.saveStatus || SaveStatus.PUBLISHED,
          publicationDate: listing.publishedAt ? new Date(listing.publishedAt) : new Date(),
          currency: listing.currency || Currency.USD,
          governorate: listing.governorate || '',
          city: listing.city || '',
          address: listing.address || ''
        };
        applyEditData(formData);
        return;
      }
    }

    // 3. Apply savedData if available
    if (isActuallySaved && !editModeDataApplied.current) {
      let phoneOnly = savedData.contactNumber || "";
      let extractedCountryCode = savedData.countryDialCode || "+963";

      if (savedData.contactNumber && (savedData.contactNumber.startsWith('+') || !savedData.countryDialCode)) {
        const { dialCode, localNumber } = splitPhone(savedData.contactNumber);
        extractedCountryCode = dialCode;
        phoneOnly = localNumber;
      }
      
      setListingTypeValue(savedData.listingType || ListingType.FOR_SALE);
      if (savedData.listingType === ListingType.FOR_RENT) {
        setShowRentType(true);
      }
      setSaveStatusValue(savedData.saveStatus || SaveStatus.PUBLISHED);
      setRentTypeValue(savedData.rentType || null);
      setCurrencyValue(savedData.currency || Currency.USD);
      setCountryDialCodeValue(extractedCountryCode);
      countryDialCodeRef.current = extractedCountryCode;

      form.reset({
        ...savedData,
        countryDialCode: extractedCountryCode,
        contactNumber: phoneOnly,
        installmentsAvailable: Boolean(savedData.installmentsAvailable),
        installmentPlans: savedData.installmentPlans || []
      });
      previousFormData.current = savedData;

      const isValid = checkFormValidity(savedData);
      prevValidState.current = isValid;

      if (onValidationChange) {
        onValidationChange(isValid);
      }
      
      editModeDataApplied.current = true;
    }
  }, [isEditMode, initialData]);

  // Auto-fill phone number from profile if empty
  useEffect(() => {
    if (!isEditMode && profile?.phoneNumber && !form.getValues("contactNumber")) {
      const { dialCode: initialDial, localNumber: initialLocal } = splitPhone(profile.phoneNumber);
      const repaired = repairPhone(initialLocal || profile.phoneNumber, initialDial || "+963");
      const dialCode = repaired.isValid ? repaired.dialCode : initialDial;
      const localNumber = repaired.isValid ? repaired.localNumber : initialLocal;

      if (localNumber) {
        setCountryDialCodeValue(dialCode);
        countryDialCodeRef.current = dialCode;
        form.setValue("countryDialCode", dialCode, { shouldDirty: true });
        form.setValue("contactNumber", localNumber, { shouldValidate: true, shouldDirty: true });
        form.trigger("contactNumber");
      }
    }
  }, [profile, isEditMode, form]);

  const handleListingTypeChange = (value: string) => {
    const listingTypeValue = value as ListingType;
    setListingTypeValue(listingTypeValue);

    if (listingTypeValue === ListingType.FOR_RENT) {
      setShowRentType(true);
      form.setValue('installmentsAvailable', false);
      form.setValue('installmentPlans', []);
    } else {
      setShowRentType(false);
      setRentTypeValue(null);
      form.setValue('rentType', null);
    }
  };

  const handleRentTypeChange = (value: string) => {
    const rentType = value as RentType;
    setRentTypeValue(rentType);
  };

  const handleSaveStatusChange = (value: string) => {
    const saveStatus = value as SaveStatus;
    setSaveStatusValue(saveStatus);
  };

  const handleCurrencyChange = (value: string) => {
    const currency = value as Currency;
    setCurrencyValue(currency);
  };

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = form.watch((formValues) => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

      autoSaveTimeout.current = setTimeout(() => {
        if (!formValues) return;
        
        const phoneOnly = formValues.contactNumber || "";
        const currentCountryCode = formValues.countryDialCode || countryDialCodeRef.current || "+963";
        const fullContactNumber = currentCountryCode && phoneOnly
          ? assemblePhone(currentCountryCode, phoneOnly) || ""
          : phoneOnly;
          
        const currentData = {
          ...formValues,
          countryDialCode: currentCountryCode,
          contactNumber: fullContactNumber,
          listingType: formValues.listingType || listingTypeValue || ListingType.FOR_SALE,
          saveStatus: formValues.saveStatus || saveStatusValue || SaveStatus.PUBLISHED,
          currency: formValues.currency || currencyValue || Currency.USD,
          rentType: formValues.listingType === ListingType.FOR_RENT 
            ? (formValues.rentType || rentTypeValue)
            : null,
          installmentsAvailable: formValues.listingType === ListingType.FOR_RENT ? false : Boolean(formValues.installmentsAvailable),
          installmentPlans: formValues.listingType === ListingType.FOR_RENT ? [] : (formValues.installmentPlans || [])
        } as AdInformationFormData;

        // Auto-save any valid changes
        const prevData = previousFormData.current;
        if (JSON.stringify(currentData) !== JSON.stringify(prevData)) {
          autoSaveAdInfoData(currentData, prevData || undefined);
          previousFormData.current = currentData;
        }

        const isValid = checkFormValidity(currentData);
        if (isValid !== prevValidState.current) {
          prevValidState.current = isValid;
          if (onValidationChange) {
            onValidationChange(isValid);
          }
        }
      }, 500); // 500ms debounce for stability
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [form, onValidationChange, listingTypeValue, saveStatusValue, currencyValue, rentTypeValue]);

  const onSubmit = (data: AdInformationFormData) => {
    const fullContactNumber = assemblePhone(data.countryDialCode || "+963", data.contactNumber) || "";
    const submittedData = {
      ...data,
      contactNumber: fullContactNumber,
      listingType: data.listingType || listingTypeValue || ListingType.FOR_SALE,
      saveStatus: data.saveStatus || saveStatusValue || SaveStatus.PUBLISHED,
      currency: data.currency || currencyValue || Currency.USD,
      rentType: data.listingType === ListingType.FOR_RENT
        ? (data.rentType || rentTypeValue)
        : null,
      installmentsAvailable: data.listingType === ListingType.FOR_RENT ? false : Boolean(data.installmentsAvailable),
      installmentPlans: data.listingType === ListingType.FOR_RENT ? [] : (data.installmentPlans || [])
    };

    const adInfoState: AdInfoState = {
      title: submittedData.title,
      adStatus: submittedData.saveStatus === SaveStatus.PUBLISHED ? "published" : "draft",
      description: submittedData.description,
      contactNumber: submittedData.contactNumber || "",
      price: submittedData.price || "",
      listingType: submittedData.listingType,
      rentType: submittedData.rentType || "",
      publicationDate: submittedData.publicationDate ? submittedData.publicationDate.toISOString() : null,
      publishedAt: submittedData.publicationDate ? submittedData.publicationDate.toISOString() : null,
      saveStatus: submittedData.saveStatus,
      currency: submittedData.currency
    };

    const isValid = validateForm(adInfoState, data.countryDialCode || "+963");

    if (isValid) {
      saveAdInfoData(submittedData);
    } else {
      setFormErrors(adInfoState, data.countryDialCode || "+963");
    }
  };

  const setFormErrors = (adInfoState: AdInfoState, countryDialCode: string = "+963") => {
    const titleError = getTitleErrorMessage(adInfoState.title, direction);
    if (titleError) form.setError("title", { message: titleError });

    const descriptionError = getDescriptionErrorMessage(adInfoState.description, direction);
    if (descriptionError) form.setError("description", { message: descriptionError });

    const priceError = getPriceErrorMessage(adInfoState.price.toString(), direction);
    if (priceError) form.setError("price", { message: priceError });

    const contactError = getContactErrorMessage(adInfoState.contactNumber, direction, countryDialCode);
    if (contactError) form.setError("contactNumber", { message: contactError });

    const dateError = getPublicationDateErrorMessage(adInfoState.publicationDate, direction);
    if (dateError) form.setError("publicationDate", { message: dateError });

    const saveStatusError = getSaveStatusErrorMessage(adInfoState.saveStatus || "", direction);
    if (saveStatusError) form.setError("saveStatus", { message: saveStatusError });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6" dir={direction}>
      <Card className="w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xl overflow-hidden rounded-2xl transition-all duration-300">
        <CardHeader className="relative overflow-hidden bg-gradient-to-r from-slate-50 dark:from-zinc-900/50 via-white dark:via-zinc-900 to-slate-50 dark:to-zinc-900/50 py-6 sm:py-8 px-6 sm:px-8 border-b border-slate-100 dark:border-zinc-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/40 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {direction === "rtl" ? "الخطوة الأخيرة" : "Final Step"}
              </span>
              <Text className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                {t("stepFour.title", { defaultValue: "Ad Information" })}
              </Text>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
                {direction === "rtl" 
                  ? "يرجى مراجعة تفاصيل الإعلان والتسعير والموقع لإكمال النشر." 
                  : "Please review your ad details, pricing, and location to complete publishing."}
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div className="text-right sm:text-left">
                <div className="text-xs text-slate-400 dark:text-zinc-400 font-medium">
                  {direction === "rtl" ? "التقدم الحالي" : "Current Progress"}
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-white">
                  {direction === "rtl" ? "خطوة 4 من 4" : "Step 4 of 4"}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 lg:p-10 w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 sm:space-y-10">

              {/* 1. Basic Information Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {direction === "rtl" ? "المعلومات الأساسية" : "Basic Information"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400">
                      {direction === "rtl" ? "أدخل عنوان الإعلان ووصفه بالتفصيل" : "Provide a catchy title and clear description"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-slate-700 dark:text-white font-semibold flex items-center gap-1 text-sm">
                          {t("stepFour.adTitle")}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("stepFour.adTitle")}
                            className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary bg-white dark:bg-zinc-950 dark:text-white shadow-sm transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-slate-700 dark:text-white font-semibold flex items-center gap-1 text-sm">
                          {t("stepFour.adDescription")}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("stepFour.adDescription")}
                            className="min-h-[120px] resize-y rounded-xl border-slate-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary bg-white dark:bg-zinc-950 dark:text-white shadow-sm transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 2. Contact & Pricing Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {direction === "rtl" ? "الاتصال والتسعير" : "Contact & Pricing"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400">
                      {direction === "rtl" ? "حدد السعر المناسب وتفاصيل الاتصال" : "Set your price, currency, and primary contact number"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* PhoneField for contact number */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <PhoneField
                          dialCode={form.watch("countryDialCode") || countryDialCodeValue || "+963"}
                          onDialCodeChange={(code) => {
                            setCountryDialCodeValue(code);
                            countryDialCodeRef.current = code;
                            form.setValue("countryDialCode", code, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                            form.trigger("contactNumber");
                          }}
                          localNumber={field.value || ""}
                          onLocalNumberChange={(val) => {
                            field.onChange(val);
                          }}
                          onLocalNumberBlur={() => {
                            field.onBlur();
                            form.trigger("contactNumber");
                          }}
                          label={t("stepFour.contactNumber")}
                          required
                          error={
                            form.formState.errors.contactNumber ? (
                              form.formState.errors.contactNumber.message === "listing.errors.contact_number_required"
                                ? (direction === "rtl" ? "رقم الهاتف مطلوب" : "Phone number is required")
                                : form.formState.errors.contactNumber.message === "listing.errors.contact_number_invalid"
                                ? (direction === "rtl" ? "هذا ليس رقم هاتف صالحاً للدولة المختارة" : "This is not a valid phone number for the selected country")
                                : form.formState.errors.contactNumber.message
                            ) : undefined
                          }
                        />
                      )}
                    />
                  </div>

                  {/* Price field */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-slate-700 dark:text-white font-semibold flex items-center gap-1 text-sm">
                          {t("stepFour.price", { defaultValue: "Price" })}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("stepFour.price", { defaultValue: "Enter price" })}
                            className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary bg-white dark:bg-zinc-950 dark:text-white shadow-sm transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Currency field */}
                  <EnumSelect
                    name="currency"
                    control={form.control}
                    label={t("stepFour.currencyLabel")}
                    options={currencyOptions}
                    placeholder={t("stepFour.currencyLabel")}
                    required={true}
                    onChange={handleCurrencyChange}
                    value={currencyValue}
                    isRtl={direction === "rtl"}
                    className="rounded-xl"
                  />
                </div>

                {/* Installments Section */}
                <InstallmentsCard
                  form={form}
                  listingTypePolicy={listingTypePolicy}
                  listingOfferType={(form.watch("listingType") || listingTypeValue || "for_sale") as string}
                  price={parseFloat(String(form.watch("price") || '0').replace(/[^0-9.]/g, '')) || null}
                  currency={form.watch("currency") || currencyValue || "USD"}
                  direction={direction as "ltr" | "rtl"}
                />
              </div>

              {/* 3. Location Information Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {direction === "rtl" ? "معلومات الموقع" : "Location Information"}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-400">
                        {direction === "rtl" ? "حدد موقع السلعة أو الخدمة بدقة" : "Specify where the item is located"}
                      </p>
                    </div>
                  </div>

                  {isSavedAddressesEnabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPickerOpen(true)}
                      className="text-primary hover:text-primary hover:bg-primary/10 font-semibold gap-1.5 rounded-xl text-xs h-9 px-3"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{tListing('wizard.saved_address.choose_button')}</span>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(() => {
                    const governorateOptions = Object.values(SyriaGovernorate).map((gov) => ({
                      value: gov,
                      label: direction === "rtl"
                        ? SyriaGovernorate_ARABIC_NAMES[gov]
                        : gov.replace(/-/g, ' ')
                    }));

                    const detectedGov = form.watch("detectedGovernorate");
                    const isGovLocked = Boolean(detectedGov);

                    return (
                      <EnumSelect
                        name="governorate"
                        control={form.control}
                        label={direction === "rtl" ? "المحافظة" : "Governorate"}
                        options={governorateOptions}
                        placeholder={direction === "rtl" ? "اختر المحافظة" : "Select Governorate"}
                        required={true}
                        disabled={isGovLocked}
                        headerAction={
                          isGovLocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              {direction === 'rtl' ? 'تغيير على الخريطة' : 'Change on map'}
                            </button>
                          ) : null
                        }
                        hint={
                          isGovLocked ? (
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                              {direction === 'rtl' ? 'محدّدة من موقعك على الخريطة' : 'Set from your map pin'}
                            </span>
                          ) : form.watch("latitude") != null ? (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              {direction === 'rtl'
                                ? 'تعذّر تحديد المنطقة من موقعك على الخريطة — تأكد من مطابقة المحافظة له'
                                : "We couldn't work out the area from your pin — check the governorate matches it"}
                            </span>
                          ) : null
                        }
                        onChange={(val) => {
                          form.setValue("city", "");
                        }}
                        isRtl={direction === "rtl"}
                      />
                    );
                  })()}

                  {(() => {
                    const selectedGov = form.watch("governorate") as SyriaGovernorate;
                    const cityList = selectedGov && SyriaGovernorate_TO_CITIES[selectedGov]
                      ? SyriaGovernorate_TO_CITIES[selectedGov]
                      : [];
                    const cityOptions = cityList.map(city => ({
                      value: city,
                      label: direction === "rtl" ? SyriaCity_ARABIC_NAMES[city] : city.replace(/-/g, ' ')
                    }));

                    return (
                      <EnumSelect
                        name="city"
                        control={form.control}
                        label={direction === "rtl" ? "المدينة" : "City"}
                        options={cityOptions}
                        placeholder={direction === "rtl" ? "اختر المدينة" : "Select City"}
                        required={true}
                        isRtl={direction === "rtl"}
                      />
                    );
                  })()}
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="text-primary w-full">
                      <FormLabel className="text-slate-700 dark:text-white font-semibold flex items-center gap-1 text-sm">
                        {direction === "rtl" ? "العنوان التفصيلي" : "Detailed Address"}
                        <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={direction === "rtl" ? "العنوان بالتفصيل..." : "Enter detailed address..."}
                          className="min-h-[80px] resize-y rounded-xl border-slate-200 dark:border-zinc-800 focus-visible:ring-primary focus-visible:border-primary bg-white dark:bg-zinc-950 dark:text-white shadow-sm transition-all"
                          {...field}
                        />
                      </FormControl>
                      
                      {/* Interactive Map & Suggestions Widget */}
                      <div className="mt-4 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-900/50 relative p-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-emerald-500 animate-bounce" />
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                              {direction === "rtl" ? "تحديد الموقع على الخريطة" : "Interactive Map Location"}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-400">
                              {direction === "rtl" ? "اسحب المؤشر أو اختر من الاقتراحات لتحديد الموقع" : "Drag pin or choose from suggestions to pinpoint location"}
                            </p>
                          </div>
                        </div>

                        {/* Address Auto-Suggestions list when typing */}
                        {field.value && field.value.length > 2 && (
                          <div className="mb-4 bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-lg p-1 space-y-1 max-h-40 overflow-y-auto">
                            {[
                              direction === "rtl" ? `${form.watch("city") || "دمشق"}، وسط المدينة - شارع النصر` : `${form.watch("city") || "Damascus"} City Center, Al-Shaalan`,
                              direction === "rtl" ? `${form.watch("city") || "دمشق"}، أوتوستراد المزة - بجانب صيدلية ابن النفيس` : `${form.watch("city") || "Damascus"} Mezzeh Highway, Near Ibn Al-Nafees Pharmacy`,
                              direction === "rtl" ? `${form.watch("city") || "دمشق"}، ساحة السبع بحرات - بناية الأوقاف` : `${form.watch("city") || "Damascus"} Seven Fountains Square, Awqaf Building`,
                              direction === "rtl" ? `${form.watch("city") || "دمشق"}، مشروع دمر - الجزيرة الثانية` : `${form.watch("city") || "Damascus"} Dummar Project, Second District`
                            ].map((suggest, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  form.setValue("address", suggest);
                                }}
                                className="w-full text-left rtl:text-right px-3 py-2 text-xs text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 font-medium"
                              >
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                <span>{suggest}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Real Google Map Canvas container */}
                        <div 
                          ref={mapRef}
                          style={{ zIndex: 1 }}
                          className="relative h-64 w-full rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-md bg-slate-100 dark:bg-zinc-900 transition-all hover:border-emerald-500/50 !z-[1]"
                        />
                      </div>

                      <FormMessage className="text-xs text-rose-500 font-medium" />
                    </FormItem>
                  )}
                />

                {/* Save this address for next time (Reverse Save) */}
                {isSavedAddressesEnabled && !matchingSavedAddress && (
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id="saveAsSavedAddress"
                        checked={form.watch('saveAsSavedAddress')}
                        onCheckedChange={(checked) => {
                          form.setValue('saveAsSavedAddress', Boolean(checked), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                      <label
                        htmlFor="saveAsSavedAddress"
                        className="text-sm font-semibold text-slate-800 dark:text-zinc-200 cursor-pointer select-none"
                      >
                        {tListing('wizard.saved_address.save_checkbox')}
                      </label>
                    </div>

                    {form.watch('saveAsSavedAddress') && (
                      <FormField
                        control={form.control}
                        name="savedAddressLabel"
                        render={({ field }) => (
                          <FormItem className="ps-6">
                            <FormLabel className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                              {tListing('wizard.saved_address.label_field')}
                              <span className="text-rose-500 ms-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={tListing('wizard.saved_address.label_placeholder')}
                                className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* 4. Listing Configuration Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {direction === "rtl" ? "تكوين الإعلان" : "Listing Configuration"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400">
                      {direction === "rtl" ? "اختر نوع النشر وحالة الحفظ" : "Choose your listing type and save status"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <EnumSelect
                    name="listingType"
                    control={form.control}
                    label={t("stepFour.adType")}
                    options={listingTypeOptions}
                    placeholder={t("stepFour.adType")}
                    required={true}
                    onChange={handleListingTypeChange}
                    value={listingTypeValue}
                    isRtl={direction === "rtl"}
                  />

                  {showRentType && (
                    <EnumSelect
                      name="rentType"
                      control={form.control}
                      label={t("stepFour.rentType")}
                      options={rentTypeOptions}
                      placeholder={t("stepFour.rentType")}
                      required={true}
                      onChange={handleRentTypeChange}
                      value={rentTypeValue?.toString() || ""}
                      isRtl={direction === "rtl"}
                    />
                  )}

                  <EnumSelect
                    name="saveStatus"
                    control={form.control}
                    label={t("stepFour.saveStatus")}
                    options={saveStatusOptions}
                    placeholder={t("stepFour.saveStatus")}
                    required={true}
                    onChange={handleSaveStatusChange}
                    value={saveStatusValue}
                    isRtl={direction === "rtl"}
                  />
                </div>
              </div>

              {/* 5. Publication Settings Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {direction === "rtl" ? "جدولة النشر" : "Publication Settings"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400">
                      {direction === "rtl" ? "حدد تاريخ ووقت النشر التلقائي" : "Schedule when your listing goes live"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="text-slate-700 dark:text-white font-semibold text-sm">
                          {t("stepFour.publicationDate")}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-11 px-3 text-left font-normal text-slate-700 dark:text-white justify-between rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-all",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM do, yyyy")
                                ) : (
                                  <span>{t("pickDate", { defaultValue: "Pick a date" })}</span>
                                )}
                                <CalendarIcon className="h-4 w-4 opacity-50 text-slate-400" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900" align="start">
                            <Calendar
                               mode="single"
                               selected={field.value}
                               onSelect={field.onChange}
                               initialFocus
                               className="rounded-2xl"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Saved Address Picker Dialog */}
      <SavedAddressPickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        currentLocation={{
          governorate: form.watch('governorate'),
          city: form.watch('city'),
          address: form.watch('address'),
          latitude: form.watch('latitude') || gpsCoords?.lat,
          longitude: form.watch('longitude') || gpsCoords?.lng,
        }}
        onSelectAddress={applyAddressToForm}
      />
    </div>
  )
}

export default AddProductStepFour