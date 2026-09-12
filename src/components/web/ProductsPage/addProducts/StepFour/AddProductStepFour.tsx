import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, FileText, Phone, DollarSign, MapPin, Sliders, CheckCircle2, Award, Info, Bookmark, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useTranslations, useLocale } from "next-intl"

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
import { getAdInformationSchema, adInformationSchema, type AdInformationFormData } from "./schema"
import type { AddProductStepFourProps, AdInfoState } from "./types"
import SelectableList from "../StepOne/SelectableList"
import { 
  SyriaGovernorate, 
  SyriaGovernorate_ARABIC_NAMES, 
  SyriaCity_ARABIC_NAMES, 
  SyriaGovernorate_TO_CITIES,
  normalizeGovernorate,
  normalizeAddress,
  cleanArabic,
  stripArabicNoise
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
  defaultAdInfoData,
  hasSavedAdInfoData,
  loadAdInfoData,
  saveAdInfoData
} from "./storageUtils"
import { commonFieldsStore } from "../Main/context/common-fields.store"
import { getListingConditionOptions } from "@/core/entities/enums/listing-condition.enum"
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
import type { LocationPickerResult } from "@/components/web/Map/GoogleMapPicker"
import { matchGovernorate, resolveCityValue } from "@/utils/geocodeToSyria"

const GoogleMapPicker = dynamic(() => import('@/components/web/Map/GoogleMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-md bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ),
})

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
      render={({ field }) => {
        const rawVal = (field.value !== undefined && field.value !== null && String(field.value) !== "")
          ? String(field.value)
          : (value !== undefined && value !== null ? String(value) : "");
        let selectValue = "";
        if (rawVal) {
          const directMatch = options.find((opt) => opt.value === rawVal);
          if (directMatch) {
            selectValue = directMatch.value;
          } else {
            const cleanRaw = cleanArabic(rawVal);
            const strippedRaw = stripArabicNoise(rawVal);
            const noSpaceRaw = cleanRaw.replace(/\s+/g, '');
            const fuzzyMatch = options.find((opt) =>
              opt.value.toLowerCase() === rawVal.toLowerCase() ||
              opt.label.toLowerCase() === rawVal.toLowerCase() ||
              cleanArabic(opt.label) === cleanRaw ||
              cleanArabic(opt.value) === cleanRaw ||
              stripArabicNoise(opt.label) === strippedRaw ||
              stripArabicNoise(opt.value) === strippedRaw ||
              cleanArabic(opt.label).replace(/\s+/g, '') === noSpaceRaw ||
              opt.value.replace(/[-_\s]/g, '').toLowerCase() === rawVal.replace(/[-_\s]/g, '').toLowerCase() ||
              (strippedRaw.length >= 3 && stripArabicNoise(opt.label).includes(strippedRaw)) ||
              (strippedRaw.length >= 3 && strippedRaw.includes(stripArabicNoise(opt.label)))
            );
            if (fuzzyMatch) {
              selectValue = fuzzyMatch.value;
            }
          }
        }

        const selectedOption = options.find((opt) => opt.value === selectValue);

        return (
          <FormItem className={`text-primary ${className}`}>
            <div className="flex items-center justify-between gap-2">
              <FormLabel className="text-primary dark:text-white">
                {label}
                {required && <span className="text-red-500">*</span>}
              </FormLabel>
              {headerAction}
            </div>
            <Select
              key={`${name}-${selectValue}-${options.length}`}
              disabled={disabled}
              onValueChange={(val) => {
                field.onChange(val);
                if (onChange) {
                  onChange(val);
                }
              }}
              value={selectValue || undefined}
              dir={`${isRtl ? "rtl" : "ltr"}`}
            >
              <FormControl>
                <SelectTrigger className="h-11 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-white disabled:opacity-85 disabled:bg-slate-50 dark:disabled:bg-zinc-850">
                  <SelectValue placeholder={placeholder} dir={`${isRtl ? "rtl" : "ltr"}`}>
                    {selectedOption ? selectedOption.label : undefined}
                  </SelectValue>
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
        );
      }}
    />
  );
};

const AddProductStepFour: React.FC<AddProductStepFourProps> = ({
  onValidationChange,
  isEditMode = false,
}) => {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [showRentType, setShowRentType] = useState(false);
  const [direction, setDirection] = useState<string>(isRtl ? "rtl" : "ltr");
  const previousFormData = useRef<AdInformationFormData | null>(null);
  const prevValidState = useRef<boolean | null>(null);
  const editModeDataApplied = useRef<boolean>(false);
  const validationCheckRunning = useRef<boolean>(false);
  const [pinPosition, setPinPosition] = useState<{ x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: 33.5138, lng: 36.2765 });
  const [isGeocoding, setIsGeocoding] = useState(false);
  // Initial map coords for edit mode pre-seeding
  const [mapInitLat, setMapInitLat] = useState<number | null>(null);
  const [mapInitLng, setMapInitLng] = useState<number | null>(null);

  const tListing = useTranslations("listing");
  const { getListingsSettings, getGoogleMapsApiKey, getGoogleGeocodingApiKey } = useSettings();
  const googleMapsApiKey = getGoogleGeocodingApiKey() || getGoogleMapsApiKey();
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
  } | null>(() => commonFieldsStore.getPolicy());

  useEffect(() => {
    countryDialCodeRef.current = countryDialCodeValue;
  }, [countryDialCodeValue]);

  // The listing type's policy lives in the wizard state; follow it (an admin may change it mid-draft).
  useEffect(() => {
    const sync = () => setListingTypePolicy(commonFieldsStore.getPolicy());
    sync();
    return commonFieldsStore.subscribe(sync);
  }, []);

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

  // Handle confirmed location from GoogleMapPicker (after user reviews and confirms)
  const handleLocationConfirm = (result: LocationPickerResult) => {
    const lat = result.latitude;
    const lng = result.longitude;
    setGpsCoords({ lat, lng });
    form.setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
    form.setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });

    const normGov = normalizeGovernorate(result.governorate) || matchGovernorate(result.governorate) || result.governorate || '';
    const normCity = resolveCityValue(result.city, normGov, lat, lng) || result.city || '';
    const normAddress = normalizeAddress(result.address) || result.address || '';

    if (normGov) {
      form.setValue("governorate", normGov as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      form.setValue("detectedGovernorate", normGov, { shouldValidate: true, shouldDirty: true });
    } else {
      form.setValue("detectedGovernorate", null, { shouldValidate: true, shouldDirty: true });
    }

    if (normCity) {
      form.setValue("city", normCity as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }

    if (normAddress) {
      form.setValue("address", normAddress, { shouldValidate: true, shouldDirty: true });
    }

    // Small delay so governorate is committed before city Select renders options
    setTimeout(() => {
      if (normCity) {
        form.setValue("city", normCity as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }
      form.trigger(["governorate", "city", "address"]);
    }, 50);

    const currentDraft = loadAdInfoData() || defaultAdInfoData;
    const nextDraft: AdInformationFormData = {
      ...currentDraft,
      governorate: normGov || '',
      city: normCity || '',
      address: normAddress || '',
      latitude: lat,
      longitude: lng,
      detectedGovernorate: normGov || null,
    };
    saveAdInfoData(nextDraft);
    previousFormData.current = nextDraft;
  };

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
  const conditionOptions = getListingConditionOptions((key) => t(`stepFour.${key}`));
  const [conditionValue, setConditionValue] = useState<string>("");
  const [phonePrefilledFromProfile, setPhonePrefilledFromProfile] = useState(false);
  const currencyOptions = getCurrencyOptions(t);

  // Initialize form with temporary default values
  const form = useForm<AdInformationFormData>({
    resolver: zodResolver(getAdInformationSchema(isRtl)),
    defaultValues: defaultAdInfoData,
    mode: "onChange",
  });

  const applyAddressToForm = (address: UserAddress) => {
    const lat = address.latitude != null && !isNaN(Number(address.latitude)) ? Number(address.latitude) : null;
    const lng = address.longitude != null && !isNaN(Number(address.longitude)) ? Number(address.longitude) : null;

    const normGov = normalizeGovernorate(address.governorate) || matchGovernorate(address.governorate) || address.governorate || '';
    const normCity = resolveCityValue(address.city, normGov, lat, lng) || address.city || '';
    const normAddress = normalizeAddress(address.address) || address.address || '';

    if (lat != null && lng != null) {
      form.setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
      form.setValue("longitude", lng, { shouldValidate: true, shouldDirty: true });
      form.setValue("detectedGovernorate", normGov || address.governorate || null, { shouldValidate: true, shouldDirty: true });
      setGpsCoords({ lat, lng });

      if (mapInstanceRef.current && markerInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 14);
        markerInstanceRef.current.setLatLng([lat, lng]);
      }
    } else {
      form.setValue("latitude", undefined as any, { shouldValidate: true, shouldDirty: true });
      form.setValue("longitude", undefined as any, { shouldValidate: true, shouldDirty: true });
      form.setValue("detectedGovernorate", null, { shouldValidate: true, shouldDirty: true });
    }

    if (normGov) {
      form.setValue("governorate", normGov as any, { shouldValidate: true, shouldDirty: true });
    }
    if (normCity) {
      form.setValue("city", normCity as any, { shouldValidate: true, shouldDirty: true });
    }
    form.setValue("address", normAddress || '', { shouldValidate: true, shouldDirty: true });

    setTimeout(() => {
      if (normCity) {
        form.setValue("city", normCity as any, { shouldValidate: true, shouldDirty: true });
      }
      form.trigger(["governorate", "city", "address"]);
    }, 50);

    const currentDraft = loadAdInfoData() || defaultAdInfoData;
    const nextDraft: AdInformationFormData = {
      ...currentDraft,
      governorate: normGov || '',
      city: normCity || '',
      address: normAddress || '',
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
      detectedGovernorate: normGov || null,
    };
    saveAdInfoData(nextDraft);
    previousFormData.current = nextDraft;
  };

  // Auto-prefill from default saved address (one-shot ABSENT gate mirroring mobile useSavedAddressWizardBinding)
  useEffect(() => {
    if (autoPrefillDoneRef.current) return;
    if (!isSavedAddressesEnabled || isEditMode) return;
    if (isLoadingSavedAddresses || !savedAddressesResponse?.data) return;

    autoPrefillDoneRef.current = true;

    // Guard: check if form already has an existing location (persisted draft or user input)
    const currentGov = form.getValues('governorate');
    const currentCity = form.getValues('city');
    const currentAddress = form.getValues('address');
    const currentLat = form.getValues('latitude');
    const hasExistingLocation = Boolean(
      (currentGov && currentGov.trim() !== '') ||
      (currentCity && currentCity.trim() !== '') ||
      (currentAddress && currentAddress.trim() !== '') ||
      currentLat != null
    );

    if (hasExistingLocation) return;

    const defaultAddress = savedAddressesResponse.data.find((a) => a.isDefault);
    if (!defaultAddress) return;

    applyAddressToForm(defaultAddress);
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
      const cur = loadAdInfoData();
      saveAdInfoData({
        ...cur,
        saveAsSavedAddress: false,
        savedAddressLabel: '',
      });
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

      const condition = data.condition || conditionValue;
      let isValid = Boolean(
        data.title &&
        data.contactNumber &&
        listingType &&
        saveStatus &&
        condition &&
        data.price &&
        currency &&
        data.governorate &&
        data.city
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

  // Initialize from the wizard state (hydrated edit, restored draft, or a previous visit to this step)
  useEffect(() => {
    const htmlDir = document.documentElement.dir || "ltr";
    setDirection(htmlDir);
    window.scrollTo(0, 0);

    if (!hasSavedAdInfoData() || editModeDataApplied.current) return;
    const savedData = loadAdInfoData();

    let phoneOnly = savedData.contactNumber || "";
    let extractedCountryCode = savedData.countryDialCode || "+963";
    if (savedData.contactNumber && (savedData.contactNumber.startsWith('+') || !savedData.countryDialCode)) {
      const { dialCode, localNumber } = splitPhone(savedData.contactNumber);
      extractedCountryCode = dialCode;
      phoneOnly = localNumber;
    }

    const lat = savedData.latitude != null && !isNaN(Number(savedData.latitude)) ? Number(savedData.latitude) : undefined;
    const lng = savedData.longitude != null && !isNaN(Number(savedData.longitude)) ? Number(savedData.longitude) : undefined;

    setListingTypeValue(savedData.listingType || ListingType.FOR_SALE);
    if (savedData.listingType === ListingType.FOR_RENT) {
      setShowRentType(true);
    }
    setSaveStatusValue(savedData.saveStatus || SaveStatus.PUBLISHED);
    setRentTypeValue(savedData.rentType || null);
    setCurrencyValue(savedData.currency || Currency.USD);
    setConditionValue(savedData.condition || "");
    setCountryDialCodeValue(extractedCountryCode);
    countryDialCodeRef.current = extractedCountryCode;

    if (lat !== undefined && lng !== undefined) {
      setGpsCoords({ lat, lng });
      setMapInitLat(lat);
      setMapInitLng(lng);
    }

    const resolvedGov = normalizeGovernorate(savedData.governorate) || matchGovernorate(savedData.governorate) || savedData.governorate || '';
    const resolvedCity = resolveCityValue(savedData.city, resolvedGov, lat, lng) || savedData.city || '';
    const resolvedAddress = normalizeAddress(savedData.address) || savedData.address || '';

    const mergedData = {
      ...savedData,
      countryDialCode: extractedCountryCode,
      contactNumber: phoneOnly,
      governorate: resolvedGov,
      city: resolvedCity,
      address: resolvedAddress,
      latitude: lat,
      longitude: lng,
      detectedGovernorate: resolvedGov || (savedData as any).detectedGovernorate || null,
      installmentsAvailable: Boolean(savedData.installmentsAvailable),
      installmentPlans: savedData.installmentPlans || []
    };

    form.reset(mergedData);
    previousFormData.current = mergedData;

    // Explicit setValue calls with small delay to ensure Select components re-render
    setTimeout(() => {
      if (mergedData.governorate) {
        form.setValue("governorate", mergedData.governorate, { shouldValidate: true, shouldDirty: false });
        form.setValue("detectedGovernorate", mergedData.governorate, { shouldValidate: false });
      }
      if (mergedData.city) {
        form.setValue("city", mergedData.city, { shouldValidate: true, shouldDirty: false });
      }
      if (mergedData.address) {
        form.setValue("address", mergedData.address, { shouldValidate: true, shouldDirty: false });
      }
      form.clearErrors(["governorate", "city", "address"]);
    }, 100);

    const isValid = checkFormValidity(mergedData);
    prevValidState.current = isValid;
    if (onValidationChange) {
      onValidationChange(isValid);
    }

    editModeDataApplied.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

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
        form.setValue("saveAsProfileNumber", false);
        setPhonePrefilledFromProfile(true);
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

  const handleConditionChange = (value: string) => {
    setConditionValue(value);
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
          condition: (formValues.condition || conditionValue || undefined) as AdInformationFormData["condition"],
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
  }, [form, onValidationChange, listingTypeValue, saveStatusValue, currencyValue, rentTypeValue, conditionValue]);

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

              {/* 2. Listing Type, Pricing & Contact Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {direction === "rtl" ? "نوع الإعلان والتسعير والاتصال" : "Listing Type, Pricing & Contact"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400">
                      {direction === "rtl" ? "حدد نوع العرض والسعر والعملة وتفاصيل الاتصال" : "Specify listing type, price, currency, and contact details"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Listing Type (For Sale / For Rent / etc.) */}
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

                  {/* Rent Type (conditionally rendered when FOR_RENT) */}
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

                  {/* Condition */}
                  <EnumSelect
                    name="condition"
                    control={form.control}
                    label={t("stepFour.condition")}
                    options={conditionOptions}
                    placeholder={t("stepFour.condition")}
                    required={true}
                    onChange={handleConditionChange}
                    value={conditionValue}
                    isRtl={direction === "rtl"}
                  />

                  {/* Price field */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-slate-700 dark:text-white font-semibold flex items-center gap-1 text-sm">
                          {form.watch("listingType") === ListingType.FOR_RENT
                            ? (direction === "rtl" ? "سعر الإيجار" : "Rental Price")
                            : t("stepFour.price", { defaultValue: "Price" })}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={
                              form.watch("listingType") === ListingType.FOR_RENT
                                ? (direction === "rtl" ? "أدخل سعر الإيجار" : "Enter rental price")
                                : t("stepFour.price", { defaultValue: "Enter price" })
                            }
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

                  {/* PhoneField for contact number */}
                  <div className={cn(
                    "sm:col-span-2",
                    showRentType ? "lg:col-span-2" : "lg:col-span-2"
                  )}>
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
                    {!phonePrefilledFromProfile && !isEditMode && (
                      <div className="flex items-center gap-2.5 mt-3">
                        <Checkbox
                          id="saveAsProfileNumber"
                          checked={Boolean(form.watch('saveAsProfileNumber'))}
                          onCheckedChange={(checked) => form.setValue('saveAsProfileNumber', Boolean(checked), { shouldDirty: true })}
                        />
                        <label htmlFor="saveAsProfileNumber" className="text-sm font-medium text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                          {tListing('wizard.save_as_profile_number')}
                        </label>
                      </div>
                    )}
                    {phonePrefilledFromProfile && (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">{tListing('wizard.contact_prefilled')}</p>
                    )}
                  </div>
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
                    const currentGov = form.watch("governorate");
                    const isGovLocked = Boolean(detectedGov && currentGov);

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
                          if (form.getValues("governorate") !== val) {
                            form.setValue("city", "");
                          }
                        }}
                        value={form.watch("governorate")}
                        isRtl={direction === "rtl"}
                      />
                    );
                  })()}

                  {(() => {
                    const rawGov = form.watch("governorate");
                    const selectedGov = (normalizeGovernorate(rawGov) || rawGov) as SyriaGovernorate;
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
                        disabled={!selectedGov}
                        value={form.watch("city")}
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

                        {/* Google Maps Picker — same two-step UX as the mobile app */}
                        <GoogleMapPicker
                          apiKey={googleMapsApiKey}
                          initialLat={mapInitLat}
                          initialLng={mapInitLng}
                          onConfirm={handleLocationConfirm}
                          locale={locale === 'ar' ? 'ar' : 'en'}
                          height="420px"
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
                          const isChecked = Boolean(checked);
                          form.setValue('saveAsSavedAddress', isChecked, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          let currentLabel = form.getValues('savedAddressLabel');
                          if (isChecked && (!currentLabel || !currentLabel.trim())) {
                            currentLabel =
                              form.getValues('address')?.trim() ||
                              [form.getValues('governorate'), form.getValues('city')].filter(Boolean).join(' - ') ||
                              (direction === 'rtl' ? 'عنوان محفوظ' : 'Saved Address');
                            form.setValue('savedAddressLabel', currentLabel, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                          const cur = loadAdInfoData();
                          saveAdInfoData({
                            ...cur,
                            saveAsSavedAddress: isChecked,
                            savedAddressLabel: isChecked ? (currentLabel || '') : '',
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
                                onChange={(e) => {
                                  field.onChange(e);
                                  const cur = loadAdInfoData();
                                  saveAdInfoData({
                                    ...cur,
                                    savedAddressLabel: e.target.value,
                                  });
                                }}
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
              {/* 4. Publication & Status Settings Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {direction === "rtl" ? "إعدادات وحالة النشر" : "Publication & Status Settings"}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-400">
                      {direction === "rtl" ? "حدد حالة الحفظ وتاريخ ووقت النشر" : "Choose save status and publication schedule"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                  {(form.watch("saveStatus") || saveStatusValue) === SaveStatus.PUBLISHED && (
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
                  )}
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