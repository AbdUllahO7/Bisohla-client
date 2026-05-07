import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, FileText, Phone, DollarSign, MapPin, Sliders, Calendar, CheckCircle2, Award, Info } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import Text from "@/components/text/text"
import { Currency, getCurrencyOptions } from "@/core/entities/enums/currency.enum"
import { CountryCode, getCountryCodeOptions } from "@/core/entities/enums/country-codes.enum"
import { SearchableCountrySelect } from "@/components/searchable-country-select"
import { useProfile } from "@/providers/profile.provider"

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
  className = ""
}: EnumSelectProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`text-primary ${className}`}>
          <FormLabel className="text-primary">
            {label}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <Select
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
              <SelectTrigger className="h-11">
                <SelectValue placeholder={placeholder} dir={`${isRtl ? "rtl" : "ltr"}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className="bg-white shadow-2xl text-primary border-none !z-[99999]"
              dir={`${isRtl ? "rtl" : "ltr"}`}
              position="popper"
              sideOffset={4}
              style={{
                zIndex: 99999,
                position: 'fixed'
              }}
            >
              {options.map((option) => (
                <SelectItem
                  className="focus:bg-primary-light focus:text-white transition-all duration-200 font-cairo font-[700]"
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

  // Create state for enum values as form backups
  const [listingTypeValue, setListingTypeValue] = useState<ListingType | "">("");
  const [rentTypeValue, setRentTypeValue] = useState<RentType | null>(null);
  const [saveStatusValue, setSaveStatusValue] = useState<SaveStatus | "">("");
  const [currencyValue, setCurrencyValue] = useState<Currency | "">("");
  const [countryCodeValue, setCountryCodeValue] = useState<CountryCode>(CountryCode.SY);
  const countryCodeRef = useRef<CountryCode>(CountryCode.SY);

  useEffect(() => {
    countryCodeRef.current = countryCodeValue;
  }, [countryCodeValue]);

  const t = useTranslations("addProduct.enteredData");
  const { profile } = useProfile();
  const countryCodeOptions = getCountryCodeOptions();

  const listingTypeOptions = getListingTypeOptions(t);
  const rentTypeOptions = getRentTypeOptions(t);
  const saveStatusOptions = getSaveStatusOptions(t);
  const currencyOptions = getCurrencyOptions(t);

  // Initialize form with temporary default values
  const form = useForm<AdInformationFormData>({
    resolver: zodResolver(adInformationSchema),
    defaultValues: defaultAdInfoData,
    mode: "onChange",
  });

  const handleCountryCodeChange = (value: string) => {
    const countryCode = value as CountryCode;
    setCountryCodeValue(countryCode);
  };
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

      return isValid;
    } finally {
      validationCheckRunning.current = false;
    }
  };

  // Apply edit data once
  const applyEditData = (editData: AdInformationFormData) => {
    if (editModeDataApplied.current) return;
    let phoneOnly = editData.contactNumber || "";
    let extractedCountryCode = countryCodeValue;

    if (editData.contactNumber) {
      const { countryCode, phoneNumber } = parsePhoneNumber(editData.contactNumber);
      extractedCountryCode = countryCode as CountryCode;
      phoneOnly = phoneNumber;
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
    setCountryCodeValue(extractedCountryCode);

    const processedData = {
      ...editData,
      contactNumber: phoneOnly,
      listingType: mappedListingType,
      saveStatus: mappedSaveStatus,
      rentType: mappedRentType,
      currency: mappedCurrency
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
          contactNumber: listing.contactNumber || '',
          listingType: listing.listingOfferType || listing.listingType || ListingType.FOR_SALE,
          rentType: listing.rentType || null,
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
      let extractedCountryCode = savedData.countryCode || CountryCode.SY;

      if (savedData.contactNumber) {
        const { countryCode, phoneNumber } = parsePhoneNumber(savedData.contactNumber);
        extractedCountryCode = countryCode as CountryCode;
        phoneOnly = phoneNumber;
      }
      
      setListingTypeValue(savedData.listingType || ListingType.FOR_SALE);
      if (savedData.listingType === ListingType.FOR_RENT) {
        setShowRentType(true);
      }
      setSaveStatusValue(savedData.saveStatus || SaveStatus.PUBLISHED);
      setRentTypeValue(savedData.rentType || null);
      setCurrencyValue(savedData.currency || Currency.USD);
      setCountryCodeValue(extractedCountryCode);

      form.reset({
        ...savedData,
        contactNumber: phoneOnly
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
      const { countryCode, phoneNumber } = parsePhoneNumber(profile.phoneNumber);

      if (phoneNumber) {
        form.setValue("contactNumber", phoneNumber, { shouldValidate: true });
        setCountryCodeValue(countryCode as CountryCode);

        // No need to manually call autoSaveAdInfoData here as the watch effect 
        // will handle it when form values change
      }
    }
  }, [profile, isEditMode, form]);

  const handleListingTypeChange = (value: string) => {
    const listingTypeValue = value as ListingType;
    setListingTypeValue(listingTypeValue);

    if (listingTypeValue === ListingType.FOR_RENT) {
      setShowRentType(true);
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
        const currentCountryCode = countryCodeRef.current;
        const fullContactNumber = currentCountryCode && phoneOnly
          ? combinePhoneNumber(currentCountryCode, phoneOnly)
          : phoneOnly;
          
        const currentData = {
          ...formValues,
          contactNumber: fullContactNumber,
          listingType: formValues.listingType || listingTypeValue || ListingType.FOR_SALE,
          saveStatus: formValues.saveStatus || saveStatusValue || SaveStatus.PUBLISHED,
          currency: formValues.currency || currencyValue || Currency.USD,
          countryCode: currentCountryCode,
          rentType: formValues.listingType === ListingType.FOR_RENT 
            ? (formValues.rentType || rentTypeValue)
            : null
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
    const submittedData = {
      ...data,
      listingType: data.listingType || listingTypeValue || ListingType.FOR_SALE,
      saveStatus: data.saveStatus || saveStatusValue || SaveStatus.PUBLISHED,
      currency: data.currency || currencyValue || Currency.USD,
      rentType: data.listingType === ListingType.FOR_RENT
        ? (data.rentType || rentTypeValue)
        : null
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

    const isValid = validateForm(adInfoState);

    if (isValid) {
      saveAdInfoData(submittedData);
    } else {
      setFormErrors(adInfoState);
    }
  };

  const setFormErrors = (adInfoState: AdInfoState) => {
    const titleError = getTitleErrorMessage(adInfoState.title, direction);
    if (titleError) form.setError("title", { message: titleError });

    const descriptionError = getDescriptionErrorMessage(adInfoState.description, direction);
    if (descriptionError) form.setError("description", { message: descriptionError });

    const priceError = getPriceErrorMessage(adInfoState.price.toString(), direction);
    if (priceError) form.setError("price", { message: priceError });

    const contactError = getContactErrorMessage(adInfoState.contactNumber, direction);
    if (contactError) form.setError("contactNumber", { message: contactError });

    const dateError = getPublicationDateErrorMessage(adInfoState.publicationDate, direction);
    if (dateError) form.setError("publicationDate", { message: dateError });

    const saveStatusError = getSaveStatusErrorMessage(adInfoState.saveStatus || "", direction);
    if (saveStatusError) form.setError("saveStatus", { message: saveStatusError });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6" dir={direction}>
      <Card className="w-full bg-white border border-slate-100 shadow-xl overflow-hidden rounded-2xl transition-all duration-300">
        <CardHeader className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 py-6 sm:py-8 px-6 sm:px-8 border-b border-slate-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {direction === "rtl" ? "الخطوة الأخيرة" : "Final Step"}
              </span>
              <Text className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                {t("stepFour.title", { defaultValue: "Ad Information" })}
              </Text>
              <p className="text-sm text-slate-500 max-w-md">
                {direction === "rtl" 
                  ? "يرجى مراجعة تفاصيل الإعلان والتسعير والموقع لإكمال النشر." 
                  : "Please review your ad details, pricing, and location to complete publishing."}
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
              <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div className="text-right sm:text-left">
                <div className="text-xs text-slate-400 font-medium">
                  {direction === "rtl" ? "التقدم الحالي" : "Current Progress"}
                </div>
                <div className="text-sm font-bold text-slate-700">
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
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {direction === "rtl" ? "المعلومات الأساسية" : "Basic Information"}
                    </h3>
                    <p className="text-xs text-slate-400">
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
                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-1 text-sm">
                          {t("stepFour.adTitle")}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("stepFour.adTitle")}
                            className="h-11 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary bg-white shadow-sm transition-all"
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
                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-1 text-sm">
                          {t("stepFour.adDescription")}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("stepFour.adDescription")}
                            className="min-h-[120px] resize-y rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary bg-white shadow-sm transition-all"
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
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {direction === "rtl" ? "الاتصال والتسعير" : "Contact & Pricing"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {direction === "rtl" ? "حدد السعر المناسب وتفاصيل الاتصال" : "Set your price, currency, and primary contact number"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Country Code + Contact Number */}
                  <div className="sm:col-span-2 lg:col-span-1 space-y-1.5">
                    <FormLabel className="text-slate-700 font-semibold flex items-center gap-1 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {t("stepFour.contactNumber")}
                      <span className="text-rose-500">*</span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <div className="w-32">
                        <SearchableCountrySelect
                          value={countryCodeValue}
                          onChange={handleCountryCodeChange}
                          options={countryCodeOptions}
                          placeholder="+963"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="5551234567"
                                className="h-11 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary bg-white shadow-sm transition-all"
                                {...field}
                                type="tel"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-rose-500 font-medium" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Price field */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-1 text-sm">
                          {t("stepFour.price", { defaultValue: "Price" })}
                          <span className="text-rose-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("stepFour.price", { defaultValue: "Enter price" })}
                            className="h-11 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary bg-white shadow-sm transition-all"
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
              </div>

              {/* 3. Location Information Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {direction === "rtl" ? "معلومات الموقع" : "Location Information"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {direction === "rtl" ? "حدد موقع السلعة أو الخدمة بدقة" : "Specify where the item is located"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(() => {
                    const governorateOptions = Object.values(SyriaGovernorate).map((gov) => ({
                      value: gov,
                      label: direction === "rtl"
                        ? SyriaGovernorate_ARABIC_NAMES[gov]
                        : gov.replace(/-/g, ' ')
                    }));

                    return (
                      <EnumSelect
                        name="governorate"
                        control={form.control}
                        label={direction === "rtl" ? "المحافظة" : "Governorate"}
                        options={governorateOptions}
                        placeholder={direction === "rtl" ? "اختر المحافظة" : "Select Governorate"}
                        required={true}
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
                      <FormLabel className="text-slate-700 font-semibold flex items-center gap-1 text-sm">
                        {direction === "rtl" ? "العنوان التفصيلي" : "Detailed Address"}
                        <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={direction === "rtl" ? "العنوان بالتفصيل..." : "Enter detailed address..."}
                          className="min-h-[80px] resize-y rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary bg-white shadow-sm transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              {/* 4. Listing Configuration Section */}
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {direction === "rtl" ? "تكوين الإعلان" : "Listing Configuration"}
                    </h3>
                    <p className="text-xs text-slate-400">
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
              <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/50 transition-all duration-300 space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {direction === "rtl" ? "جدولة النشر" : "Publication Settings"}
                    </h3>
                    <p className="text-xs text-slate-400">
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
                        <FormLabel className="text-slate-700 font-semibold text-sm">
                          {t("stepFour.publicationDate")}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-11 px-3 text-left font-normal text-slate-700 justify-between rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm transition-all",
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
                          <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
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
    </div>
  )
}

export default AddProductStepFour