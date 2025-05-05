"use client"

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

// Standalone Select Field component to fix state preservation issues
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
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  
  // Update internal state when external value changes
  useEffect(() => {
    if (value) {
      setInternalValue(value);
    }
  }, [value]);
  
  const handleChange = (newValue) => {
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  
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
              handleChange(val);
            }}
            // Use internalValue as backup if field.value is empty
            value={field.value || internalValue || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              {options.map((option) => (
                <SelectItem 
                  className="text-primary hover:bg-primary-light" 
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
  const [showRentType, setShowRentType] = useState(false)
  const [direction, setDirection] = useState<string>("ltr")
  const previousFormData = useRef<AdInformationFormData | null>(null)
  const prevValidState = useRef<boolean | null>(null)
  const editModeDataApplied = useRef<boolean>(false)
  
  // Create explicit state for enum values to ensure they remain stable
  const [listingTypeValue, setListingTypeValue] = useState<ListingType | "">("");
  const [rentTypeValue, setRentTypeValue] = useState<RentType | null>(null);
  const [saveStatusValue, setSaveStatusValue] = useState<SaveStatus | "">("");

  const t = useTranslations("addProduct.enteredData")

  const listingTypeOptions = getListingTypeOptions(t)
  const rentTypeOptions = getRentTypeOptions(t)
  const saveStatusOptions = getSaveStatusOptions(t) 

  // Initialize form with temporary default values
  const form = useForm<AdInformationFormData>({
    resolver: zodResolver(adInformationSchema),
    defaultValues: defaultAdInfoData,
    mode: "onChange", // Validate on change
  })

  // Check if the form data is valid
  const checkFormValidity = (data: AdInformationFormData) => {
    // Use state values as fallbacks for enum fields
    const listingType = data.listingType || listingTypeValue;
    const saveStatus = data.saveStatus || saveStatusValue;
    const rentType = data.rentType || rentTypeValue;
    
    // Basic validation: check if required fields are filled
    let isValid = Boolean(
      data.title && 
      data.description && 
      data.contactNumber && 
      listingType &&
      saveStatus && 
      data.price
    );
    
    // Additional validation for rent type
    if (listingType === ListingType.FOR_RENT && !rentType) {
      isValid = false;
    }
    
    return isValid;
  }

  // Fix for listingType and saveStatus values not showing in form
  const mapApiEnumToFormEnum = (apiValue: string, enumType: any): any => {
    if (!apiValue) return Object.values(enumType)[0]; // Default if empty
    
    // If it's already a valid enum value, return it
    if (Object.values(enumType).includes(apiValue)) {
      return apiValue;
    }
    
    // Simple mapping function to handle potential case differences
    const normApiValue = apiValue.toUpperCase().replace(/\s+/g, '_');
    
    // Check each enum value
    for (const key in enumType) {
      const enumValue = enumType[key];
      const normEnumValue = key.toUpperCase().replace(/\s+/g, '_');
      
      // Try different matching strategies (exact match, normalized match, or substring match)
      if (
        apiValue === enumValue || 
        normApiValue === normEnumValue ||
        normApiValue.includes(normEnumValue) ||
        normEnumValue.includes(normApiValue)
      ) {
        return enumValue;
      }
    }
    
    // Return default if no match found
    console.warn(`Could not map API value "${apiValue}" to matching enum value`);
    return Object.values(enumType)[0]; // Return first enum value as default
  };

  // Function to directly apply edit data
  const applyEditData = (editData: AdInformationFormData) => {
    if (!editModeDataApplied.current) {
      console.log("Setting StepFour edit data:", editData);
      
      // Map string enum values to actual enum values if needed
      const mappedListingType = typeof editData.listingType === 'string' 
        ? mapApiEnumToFormEnum(editData.listingType, ListingType)
        : editData.listingType;
      
      const mappedSaveStatus = typeof editData.saveStatus === 'string'
        ? mapApiEnumToFormEnum(editData.saveStatus, SaveStatus)
        : editData.saveStatus;
      
      const mappedRentType = editData.rentType && typeof editData.rentType === 'string'
        ? mapApiEnumToFormEnum(editData.rentType, RentType)
        : editData.rentType;
      
      // Set our controlled state values
      setListingTypeValue(mappedListingType);
      setSaveStatusValue(mappedSaveStatus);
      setRentTypeValue(mappedRentType);
      
      // Create a new object with the processed values
      const processedData = {
        ...editData,
        listingType: mappedListingType,
        saveStatus: mappedSaveStatus,
        rentType: mappedRentType
      };
      
      // Set UI state for conditional fields
      if (mappedListingType === ListingType.FOR_RENT) {
        setShowRentType(true);
      }
      
      // Important: Reset the form with cleaned data
      form.reset(processedData);
      
      // Explicitly set values for the form fields
      form.setValue('listingType', mappedListingType);
      form.setValue('saveStatus', mappedSaveStatus);
      if (mappedRentType) {
        form.setValue('rentType', mappedRentType);
      }
      
      // Save initial data as previous to prevent losing it on field change
      previousFormData.current = { ...processedData };
      
      // Set validation state
      const isValid = checkFormValidity(processedData);
      prevValidState.current = isValid;
      if (onValidationChange) {
        onValidationChange(isValid);
      }
      
      editModeDataApplied.current = true;
      
      // Log after setting
      console.log("Applied form values:", form.getValues());
    }
  };

  // Handle initial edit data from props
  useEffect(() => {
    if (isEditMode && initialData && initialData.data && !editModeDataApplied.current) {
      // Transform API data to form data
      const formData: AdInformationFormData = {
        title: initialData.data.title || '',
        description: initialData.data.description || '',
        price: initialData.data.price?.toString() || '',
        contactNumber: initialData.data.contactNumber || '',
        listingType: initialData.data.listingType || ListingType.FOR_SALE,
        rentType: initialData.data.rentType || null,
        saveStatus: initialData.data.saveStatus || SaveStatus.DRAFT,
        publicationDate: initialData.data.publishedAt ? new Date(initialData.data.publishedAt) : null
      };
      
      applyEditData(formData);
    }
  }, [isEditMode, initialData]);

  // Initial setup effect - runs once on component mount
  useEffect(() => {
    const htmlDir = document.documentElement.dir || "ltr";
    setDirection(htmlDir);
    
    // Only load from localStorage in non-edit mode or as fallback
    if (!isEditMode || !editModeDataApplied.current) {
      const savedData = loadAdInfoData();
      
      // Set our controlled state values
      setListingTypeValue(savedData.listingType);
      setSaveStatusValue(savedData.saveStatus);
      setRentTypeValue(savedData.rentType);
      
      form.reset(savedData);
      previousFormData.current = savedData;
      
      if (savedData.listingType === ListingType.FOR_RENT) {
        setShowRentType(true);
      }
      
      // Initial validation of loaded data
      const isValid = checkFormValidity(savedData);
      prevValidState.current = isValid;
      
      if (onValidationChange && !editModeDataApplied.current) {
        onValidationChange(isValid);
      }
    }
  }, [form, isEditMode, onValidationChange]); 

  // Handle listing type changes
  const handleListingTypeChange = (value: ListingType) => {
    setListingTypeValue(value);
    form.setValue('listingType', value);
    
    // Toggle rent type visibility
    if (value === ListingType.FOR_RENT) {
      setShowRentType(true);
    } else {
      setShowRentType(false);
      // Reset rent type when not FOR_RENT
      setRentTypeValue(null);
      form.setValue('rentType', null);
    }
  };
  
  // Handle rent type changes
  const handleRentTypeChange = (value: RentType) => {
    setRentTypeValue(value);
    form.setValue('rentType', value);
  };
  
  // Handle save status changes
  const handleSaveStatusChange = (value: SaveStatus) => {
    setSaveStatusValue(value);
    form.setValue('saveStatus', value);
  };

  // Watch form changes and update validation
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      // Create a copy with our preserved enum values
      const currentData = {
        ...formValues as AdInformationFormData,
        listingType: formValues.listingType || listingTypeValue,
        saveStatus: formValues.saveStatus || saveStatusValue,
        rentType: formValues.rentType || rentTypeValue,
      };
      
      // Auto-save if key fields are present
      if (currentData.title && currentData.description) {
        autoSaveAdInfoData(currentData, previousFormData.current || undefined);
        previousFormData.current = { ...currentData };
      }

      // Check form validity
      const isValid = checkFormValidity(currentData);
      
      // Only notify parent if validation state has changed
      if (isValid !== prevValidState.current) {
        prevValidState.current = isValid;
        if (onValidationChange) {
          onValidationChange(isValid);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, onValidationChange, listingTypeValue, saveStatusValue, rentTypeValue]);

  const onSubmit = (data: AdInformationFormData) => {
    // Ensure enum values are preserved in the submitted data
    const submittedData = {
      ...data,
      listingType: data.listingType || listingTypeValue,
      saveStatus: data.saveStatus || saveStatusValue,
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
      saveStatus: submittedData.saveStatus
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
    <div className="w-full space-y-6" dir={direction}>
      <Card className="w-full bg-white mx-auto border-0 shadow-none">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center">
            {t("stepFour.title", { defaultValue: "Ad Information" })}
          </Text>
        </CardHeader>
        <CardContent className="pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6 md:col-span-1">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="text-primary">
                      <FormLabel className="text-primary">
                        {t("stepFour.adTitle")}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={t("stepFour.adTitle")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="text-primary">
                      <FormLabel className="text-primary">
                        {t("stepFour.adDescription")}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder={t("stepFour.adDescription")} className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Number Field */}
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem className="text-primary">
                      <FormLabel className="text-primary">
                        {t("stepFour.contactNumber")}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={t("stepFour.contactNumber")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Field */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="text-primary">
                      <FormLabel className="text-primary">
                        {t("stepFour.price", { defaultValue: "Price" })}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder={t("stepFour.price", { defaultValue: "Enter price" })} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6 md:col-span-1">
                {/* Listing Type Field */}
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

                {/* Conditional Rent Type Field */}
                {showRentType && (
                  <EnumSelect
                    name="rentType"
                    control={form.control}
                    label={t("stepFour.rentType")}
                    options={rentTypeOptions}
                    placeholder={t("stepFour.rentType")}
                    required={true}
                    onChange={handleRentTypeChange}
                    value={rentTypeValue}
                    isRtl={direction === "rtl"}
                  />
                )}

                {/* Save Status Field */}
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

                {/* Publication Date Field */}
                <FormField
                  control={form.control}
                  name="publicationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-primary">{t("stepFour.publicationDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal text-primary",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMMM do, yyyy")
                              ) : (
                                <span>{t("pickDate", { defaultValue: "Pick a date" })}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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