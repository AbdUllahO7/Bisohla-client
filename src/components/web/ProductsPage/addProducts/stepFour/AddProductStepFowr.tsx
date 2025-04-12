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

import { ListingType, RentType, getListingTypeOptions, getRentTypeOptions } from "@/core/entities/enums/cars.enums"
import type { AdInformationFormData } from "./schema"
import type { AddProductStepFourProps, AdInfoState } from "./types"
import {
  adInformationSchema,
  getContactErrorMessage,
  getDescriptionErrorMessage,
  getPublicationDateErrorMessage,
  getTitleErrorMessage,
  validateForm
} from "./validationUtils"
import {
  autoSaveAdInfoData,
  defaultAdInfoData,
  loadAdInfoData,
  saveAdInfoData
} from "./storageUtils"
import Text from "@/components/text/text"

const AddProductStepFour: React.FC<AddProductStepFourProps> = ({ onValidationChange }) => {
  const [showRentType, setShowRentType] = useState(false)
  const [direction, setDirection] = useState<string>("ltr")
  const previousFormData = useRef<AdInformationFormData | null>(null)
  const prevValidState = useRef<boolean | null>(null)

  const t = useTranslations("addProduct.enteredData")

  const listingTypeOptions = getListingTypeOptions(t)
  const rentTypeOptions = getRentTypeOptions(t)

  const form = useForm<AdInformationFormData>({
    resolver: zodResolver(adInformationSchema),
    defaultValues: defaultAdInfoData,
    mode: "onChange", // Validate on change
  })

  // Check if the form data is valid
  const checkFormValidity = (data: AdInformationFormData) => {
    // Basic validation: check if required fields are filled
    let isValid = Boolean(
      data.title && 
      data.description && 
      data.contactNumber && 
      data.listingType
    );
    
    // Additional validation for rent type
    if (data.listingType === ListingType.FOR_RENT && !data.rentType) {
      isValid = false;
    }
    
    return isValid;
  }

  // Initial setup effect - runs once on component mount
  useEffect(() => {
    const savedData = loadAdInfoData()
    form.reset(savedData)
    previousFormData.current = savedData

    if (savedData.listingType === ListingType.FOR_RENT) {
      setShowRentType(true)
    }

    // Initial validation of loaded data
    const isValid = checkFormValidity(savedData);
    prevValidState.current = isValid;
    
    // Only call onValidationChange once during initialization
    if (onValidationChange) {
      onValidationChange(isValid);
    }

    const htmlDir = document.documentElement.dir || "ltr"
    setDirection(htmlDir)
  }, [form]); // Remove onValidationChange from dependencies

  // Watch form changes and update validation
  useEffect(() => {
    const subscription = form.watch((formValues) => {
      const currentData = formValues as AdInformationFormData

      // Auto-save if key fields are present
      if (currentData.title && currentData.description) {
        autoSaveAdInfoData(currentData, previousFormData.current || undefined)
        previousFormData.current = { ...currentData }
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

      // Toggle rent type field visibility
      if (currentData.listingType === ListingType.FOR_RENT) {
        setShowRentType(true)
      } else {
        setShowRentType(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, onValidationChange]) // Keep onValidationChange in dependencies

  const onSubmit = (data: AdInformationFormData) => {

    const adInfoState: AdInfoState = {
      title: data.title,
      adStatus: "draft",
      description: data.description,
      contactNumber: data.contactNumber || "",
      listingType: data.listingType,
      rentType: data.rentType || "",
      publicationDate: data.publicationDate ? data.publicationDate.toISOString() : null,
    }

    const isValid = validateForm(adInfoState)

    if (isValid) {
      saveAdInfoData(data)
    } else {
      setFormErrors(adInfoState)
    }
  }

  const setFormErrors = (adInfoState: AdInfoState) => {
    const titleError = getTitleErrorMessage(adInfoState.title, direction)
    if (titleError) form.setError("title", { message: titleError })

    const descriptionError = getDescriptionErrorMessage(adInfoState.description, direction)
    if (descriptionError) form.setError("description", { message: descriptionError })

    const contactError = getContactErrorMessage(adInfoState.contactNumber, direction)
    if (contactError) form.setError("contactNumber", { message: contactError })

    const dateError = getPublicationDateErrorMessage(adInfoState.publicationDate, direction)
    if (dateError) form.setError("publicationDate", { message: dateError })
  }

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
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 md:col-span-1">
                            {/* Listing Type Field */}
                            <FormField
                            control={form.control}
                            name="listingType"
                            render={({ field }) => (
                                <FormItem className="text-primary">
                                <FormLabel className="text-primary">
                                    {t("stepFour.adType")}
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                    field.onChange(value as ListingType)
                                    // Reset rentType when switching away from FOR_RENT
                                    if (value !== ListingType.FOR_RENT) {
                                        form.setValue("rentType", null)
                                    }
                                    }}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("stepFour.adType")} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white ">
                                    {listingTypeOptions.map((option) => (
                                        <SelectItem className="text-primary  hover:bg-primary-light" key={option.value} value={option.value}>
                                                {option.label}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            {/* Conditional Rent Type Field */}
                            {showRentType && (
                            <FormField
                                control={form.control}
                                name="rentType"
                                render={({ field }) => (
                                <FormItem className="text-primary">
                                    <FormLabel className="text-primary">
                                    {t("stepFour.rentType")}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                    onValueChange={(value) => field.onChange(value as RentType)}
                                    defaultValue={field.value || undefined}
                                    value={field.value || undefined}

                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue className="text-primary" placeholder={t("stepFour.rentType")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-white">
                                        {rentTypeOptions.map((option) => (
                                        <SelectItem className="text-primary" key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            )}

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