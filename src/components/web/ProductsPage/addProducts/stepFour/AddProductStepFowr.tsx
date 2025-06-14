import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { ListingType, RentType, SaveStatus, getListingTypeOptions, getRentTypeOptions, getSaveStatusOptions } from "@/core/entities/enums/cars.enums"
import { adInformationSchema, type AdInformationFormData } from "./schema"
import type { AddProductStepFourProps, AdInfoState } from "./types"
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
  loadAdInfoData,
  saveAdInfoData
} from "./storageUtils"
import Text from "@/components/text/text"
import { Currency, getCurrencyOptions } from "@/core/entities/enums/currency.enum"

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
              <SelectTrigger>
                <SelectValue placeholder={placeholder} dir={`${isRtl ? "rtl" : "ltr"}`}/>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white shadow-2xl text-primary border-none absolute z-[99]" dir={`${isRtl ? "rtl" : "ltr"}`}>
              {options.map((option) => (
                <SelectItem
                  className="focus:bg-primary-light hover:text-white transition-all duration-200 font-cairo font-[700]"
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

  const t = useTranslations("addProduct.enteredData");

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
        currency
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
    
    const processedData = {
      ...editData,
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

  useEffect(() => {
    if (isEditMode && initialData?.data && !editModeDataApplied.current) {
      const formData: AdInformationFormData = {
        title: initialData.data[0].title || '',
        description: initialData.data[0].description || '',
        price: initialData.data[0].price?.toString() || '',
        contactNumber: initialData.data[0].contactNumber || '',
        listingType: initialData.data[0].listingType || ListingType.FOR_SALE,
        rentType: initialData.data[0].rentType || null,
        saveStatus: initialData.data[0].saveStatus || SaveStatus.DRAFT,
        publicationDate: initialData.data[0].publishedAt ? new Date(initialData.data[0].publishedAt) : new Date(),
        currency: initialData.data[0].currency || Currency.USD
      };
      
      applyEditData(formData);
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    const htmlDir = document.documentElement.dir || "ltr";
    setDirection(htmlDir);
    
    if (!isEditMode && !editModeDataApplied.current) {
      const savedData = loadAdInfoData();
      
      if (savedData.listingType) {
        setListingTypeValue(savedData.listingType);
        if (savedData.listingType === ListingType.FOR_RENT) {
          setShowRentType(true);
        }
      }
      
      if (savedData.saveStatus) {
        setSaveStatusValue(savedData.saveStatus);
      }
      
      if (savedData.rentType) {
        setRentTypeValue(savedData.rentType);
      }
      
      if (savedData.currency) {
        setCurrencyValue(savedData.currency);
      }
      
      form.reset(savedData);
      previousFormData.current = savedData;
      
      const isValid = checkFormValidity(savedData);
      prevValidState.current = isValid;
      
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }
  }, []);

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

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const subscription = form.watch((formValues) => {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (!formValues) return;
        
        const currentData = {
          ...(formValues as Partial<AdInformationFormData>),
          listingType: formValues.listingType || listingTypeValue || ListingType.FOR_SALE,
          saveStatus: formValues.saveStatus || saveStatusValue || SaveStatus.DRAFT,
          currency: formValues.currency || currencyValue || Currency.USD,
          rentType: formValues.listingType === ListingType.FOR_RENT || listingTypeValue === ListingType.FOR_RENT
            ? (formValues.rentType || rentTypeValue)
            : null
        };
        
        if (currentData.title && currentData.description) {
          const prevData = previousFormData.current || undefined;
          if (JSON.stringify(currentData) !== JSON.stringify(prevData)) {
            autoSaveAdInfoData(currentData as AdInformationFormData, prevData);
            previousFormData.current = currentData as AdInformationFormData;
          }
        }

        const isValid = checkFormValidity(currentData);
        
        if (isValid !== prevValidState.current) {
          prevValidState.current = isValid;
          if (onValidationChange) {
            onValidationChange(isValid);
          }
        }
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [form, onValidationChange, listingTypeValue, saveStatusValue, rentTypeValue, currencyValue]);

  const onSubmit = (data: AdInformationFormData) => {
    const submittedData = {
      ...data,
      listingType: data.listingType || listingTypeValue || ListingType.FOR_SALE,
      saveStatus: data.saveStatus || saveStatusValue || SaveStatus.DRAFT,
      currency: data.currency || currencyValue || Currency.USD,
      rentType: data.listingType === ListingType.FOR_RENT 
        ? (data.rentType || rentTypeValue) 
        : null
    };
    
    const adInfoState: AdInfoState = {
      title: submittedData.title,
      adStatus: "draft",
      description: submittedData.description,
      contactNumber: submittedData.contactNumber || "",
      price: submittedData.price || "",
      listingType: submittedData.listingType,
      rentType: submittedData.rentType || "",
      publicationDate: submittedData.publicationDate ? submittedData.publicationDate.toISOString() : null,
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
    <div className="w-full  mx-auto space-y-6" dir={direction}>
      <Card className=" min-w-7xl bg-white border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 py-6 rounded-t-lg">
          <Text className="text-2xl font-bold text-primary text-center">
            {t("stepFour.title", { defaultValue: "Ad Information" })}
          </Text>
        </CardHeader>
        <CardContent className="p-8 w-[900px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Information Section */}
              <div className="space-y-6 w-full">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-4 lg:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="text-primary lg:col-span-2">
                        <FormLabel className="text-primary font-medium">
                          {t("stepFour.adTitle")}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("stepFour.adTitle")} 
                            className="h-11" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="text-primary lg:col-span-2">
                        <FormLabel className="text-primary font-medium">
                          {t("stepFour.adDescription")}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t("stepFour.adDescription")} 
                            className="min-h-[120px] resize-y" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact & Pricing Section */}
              <div className="space-y-6 w-full">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-primary">Contact & Pricing</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-primary font-medium">
                          {t("stepFour.contactNumber")}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("stepFour.contactNumber")} 
                            className="h-11" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="text-primary">
                        <FormLabel className="text-primary font-medium">
                          {t("stepFour.price", { defaultValue: "Price" })}
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder={t("stepFour.price", { defaultValue: "Enter price" })} 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                  />
                </div>
              </div>

              {/* Listing Configuration Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-primary">Listing Configuration</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Publication Settings Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-primary">Publication Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-primary font-medium">
                          {t("stepFour.publicationDate")}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-11 pl-3 text-left font-normal text-primary justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MMMM do, yyyy")
                                ) : (
                                  <span>{t("pickDate", { defaultValue: "Pick a date" })}</span>
                                )}
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar 
                              mode="single" 
                              selected={field.value} 
                              onSelect={field.onChange} 
                              initialFocus 
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
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