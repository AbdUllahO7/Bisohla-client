"use client"
import React, { useRef, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import FormField from "./FormField"
import type { CarInfoState, ValidationErrors } from "./types"
import { useTranslations } from "next-intl"
import SelectFieldWithSearch from "@/components/web/design/SelectFieldWithSearch"

interface CarInfoFormProps {
  carInfo: CarInfoState
  validationErrors: ValidationErrors
  labels: Record<string, string>
  options: any
  locale: string
  onTextFieldBlur: (field: string, value: string) => void
  onSelectChange: (field: string, value: string) => void
}

/**
 * Car information form component
 */
const CarInfoForm: React.FC<CarInfoFormProps> = ({
  carInfo,
  validationErrors,
  labels,
  options,
  onTextFieldBlur,
  onSelectChange,
}) => {
  // Get translations for next-intl
  const t = useTranslations("homePage")

  // Input refs for text fields
  const mileageInputRef = useRef<HTMLInputElement>(null)
  const enginePowerInputRef = useRef<HTMLInputElement>(null)
  const doorsInputRef = useRef<HTMLInputElement>(null)
  const vinInputRef = useRef<HTMLInputElement>(null)
  const plateInputRef = useRef<HTMLInputElement>(null)

  // Initialize refs with current values
  useEffect(() => {
    if (mileageInputRef.current) mileageInputRef.current.value = carInfo.mileage || ""
    if (enginePowerInputRef.current) enginePowerInputRef.current.value = carInfo.enginePower || ""
    if (doorsInputRef.current) doorsInputRef.current.value = carInfo.doors || ""
    if (vinInputRef.current) vinInputRef.current.value = carInfo.vin || ""
    if (plateInputRef.current) plateInputRef.current.value = carInfo.plateNumber || ""
  }, [carInfo])

  const handleMileageBlur = useCallback(() => {
    onTextFieldBlur("mileage", mileageInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handleEnginePowerBlur = useCallback(() => {
    onTextFieldBlur("enginePower", enginePowerInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handleDoorsBlur = useCallback(() => {
    onTextFieldBlur("doors", doorsInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handleVinBlur = useCallback(() => {
    onTextFieldBlur("vin", vinInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handlePlateBlur = useCallback(() => {
    onTextFieldBlur("plateNumber", plateInputRef.current?.value || "")
  }, [onTextFieldBlur])

  // Generate engine size options from 0.8 to 8.0
  const engineSizeOptions = Array.from({ length: 73 }, (_, i) => {
    const value = (0.8 + i * 0.1).toFixed(1)
    return { value, label: `${value} L` }
  })

  // Modified SelectField to use SelectFieldWithSearch
  const SelectField = useCallback(
    ({
      label,
      field,
      options,
      placeholder,
      required = false,
    }: {
      label: string
      field: string
      options: Array<{ value: string; label: string }>
      placeholder: string
      optionsLabel?: string
      required?: boolean
    }) => {
      const hasError =
        Object.prototype.hasOwnProperty.call(validationErrors, field) &&
        validationErrors[field as keyof ValidationErrors]
      const errorMessage = hasError ? validationErrors[field as keyof ValidationErrors] : ""

      // Access the current value from carInfo state
      const fieldValue = (carInfo[field as keyof CarInfoState] as string) || ""

      return (
        <FormField label={label} field={field} required={required}>
          <SelectFieldWithSearch
            options={options}
            placeholder={placeholder}
            name={field}
            value={fieldValue}
            onChange={onSelectChange}
            onBlur={onTextFieldBlur}
            SelectTriggerStyle={`${hasError ? "border-red-500" : ""}`}
            className="w-full text-primary"
            required={required}
            error={errorMessage}
          />
        </FormField>
      )
    },
    [validationErrors, carInfo, onSelectChange, onTextFieldBlur]
  )

  return (
    <div className="p-5 w-full">
      {/* Main grid with two columns - FormFields on left, SelectFields on right */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-6">
        {/* Left column - FormFields */}
          {/* Mileage */}
          <FormField label={labels.mileage} field="mileage" required>
            <Input
              type="text"
              ref={mileageInputRef}
              defaultValue={carInfo.mileage || ""}
              onBlur={handleMileageBlur}
              placeholder={labels.enterMileage}
              className="w-full text-primary"
              required
            />
          </FormField>
          {/* Doors */}
          <FormField label={labels.doors} field="doors" required error={validationErrors.doors}>
            <Input
              type="text"
              ref={doorsInputRef}
              defaultValue={carInfo.doors || ""}
              onBlur={handleDoorsBlur}
              placeholder={labels.enterDoors}
              className={`w-full ${validationErrors.doors ? "border-red-500" : ""} text-primary`}
              required
            />
          </FormField>

          {/* Engine Power */}
          <FormField label={labels.enginePower} field="enginePower">
            <Input
              type="text"
              ref={enginePowerInputRef}
              defaultValue={carInfo.enginePower || ""}
              onBlur={handleEnginePowerBlur}
              placeholder={labels.enterEnginePower}
              className="w-full text-primary"
            />
          </FormField>


          {/* Plate Number */}
          <FormField label={labels.plateNumber} field="plateNumber" >
            <Input
              type="text"
              ref={plateInputRef}
              defaultValue={carInfo.plateNumber || ""}
              placeholder={labels.enterPlateNumber}
              onBlur={handlePlateBlur}
              className="w-full text-primary"
              required
            />
          </FormField>

          {/* VIN */}
          <FormField label={labels.vin} field="vin">
            <Input
              type="text"
              ref={vinInputRef}
              defaultValue={carInfo.vin || ""}
              placeholder={labels.enterVin}
              onBlur={handleVinBlur}
              className="w-full text-primary"
            />
          </FormField>

               {/* Exterior Color */}
          <SelectField
            label={labels.colorExterior}
            field="colorExterior"
            options={options.colors}
            placeholder={labels.selectColorExterior}
            optionsLabel={labels.extColors}
            required
          />
      <SelectField
            label={labels.engineSize}
            field="engineSize"
            options={engineSizeOptions}
            placeholder={labels.enterEngineSize}
            required
          />
          {/* Fuel Type */}
          <SelectField
            label={labels.fuelType}
            field="fuelType"
            options={options.fuelType}
            placeholder={labels.selectFuelType}
            optionsLabel={labels.fuelTypes}
            required
          />

          {/* Transmission */}
          <SelectField
            label={labels.transmission}
            field="transmission"
            options={options.transmission}
            placeholder={labels.selectTransmission}
            optionsLabel={labels.transmissions}
            required
          />

          {/* Body Type */}
          <SelectField
            label={labels.bodyType}
            field="bodyType"
            options={options.bodyType}
            placeholder={labels.selectBodyType}
            optionsLabel={labels.bodyTypes}
            required
          />

        {/* Right column - SelectFields */}
        <div className="space-y-6">
        </div>
      </div>
    </div>
  )
}

export default React.memo(CarInfoForm)
