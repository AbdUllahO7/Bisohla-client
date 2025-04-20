"use client"

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useTranslations } from "next-intl"
import type { SelectDropdownProps } from "@/types/homePageTypes"

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  placeholder = "Select an option",
  className = "",
  SelectTriggerStyle,
  labelStyle,
  required = false,
  error,
  onChange,
  value,
  name,
  onBlur,
  disabled = false,
}) => {
  const t = useTranslations("homePage")

  const handleValueChange = (newValue: string) => {
    if (onChange) {
      // Call the onChange handler with field name and value
      // This matches the signature in useAddProductStepTwo: handleSelectChange(field, value)
      onChange(name || "", newValue)
    }
  }

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className={`mb-1 text-sm text-gray-700 font-cairo font-[700] ${labelStyle}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        value={value}
        disabled={disabled} 
        onValueChange={handleValueChange}
        required={required}
        onOpenChange={(open) => {
          // When dropdown closes and onBlur is provided, trigger validation
          if (!open && onBlur && name) {
            onBlur(name, value || "")
          }
        }}
      >
      <SelectTrigger
          className={`w-50 ${error ? "border-red-500 focus:ring-red-500" : ""} ${SelectTriggerStyle} p-1`}
          dir={`${t("lang") === "ar" ? "rtl" : "ltr"}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white text-primary border-0" dir={`${t("lang") === "ar" ? "rtl" : "ltr"}`}>
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
      {error && <p className="mt-1 text-sm text-red-500 font-cairo">{error}</p>}
    </div>
  )
}

export default SelectDropdown
