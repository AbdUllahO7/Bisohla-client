'use client'
import React, { useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import FormField from "./FormField";
import { CarInfoState, ValidationErrors } from "./types";
import { useTranslations } from 'next-intl';
import SelectDropdown from "@/components/SelectDropdown";

interface CarInfoFormProps {
  carInfo: CarInfoState;
  validationErrors: ValidationErrors;
  labels: Record<string, string>;
  options: any;
  locale: string;
  onTextFieldBlur: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
}

/**
 * Car information form component
 */
const CarInfoForm: React.FC<CarInfoFormProps> = ({
  carInfo,
  validationErrors,
  labels,
  options,
  locale,
  onTextFieldBlur,
  onSelectChange,
}) => {
  // Get translations for next-intl
  const t = useTranslations('homePage');
  // Input refs for text fields
  const priceInputRef = useRef<HTMLInputElement>(null);
  const mileageInputRef = useRef<HTMLInputElement>(null);
  const enginePowerInputRef = useRef<HTMLInputElement>(null);
  const engineSizeInputRef = useRef<HTMLInputElement>(null);
  const doorsInputRef = useRef<HTMLInputElement>(null);
  const vinInputRef = useRef<HTMLInputElement>(null);
  const plateInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize refs with current values
  useEffect(() => {
    if (priceInputRef.current) priceInputRef.current.value = carInfo.price;
    if (mileageInputRef.current) mileageInputRef.current.value = carInfo.mileage;
    if (enginePowerInputRef.current) enginePowerInputRef.current.value = carInfo.enginePower;
    if (engineSizeInputRef.current) engineSizeInputRef.current.value = carInfo.engineSize;
    if (doorsInputRef.current) doorsInputRef.current.value = carInfo.doors;
    if (vinInputRef.current) vinInputRef.current.value = carInfo.vin;
    if (plateInputRef.current) plateInputRef.current.value = carInfo.plateNumber;
  }, [carInfo]);
  
  // Handle blur events for text fields
  const handlePriceBlur = useCallback(() => {
    onTextFieldBlur('price', priceInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  const handleMileageBlur = useCallback(() => {
    onTextFieldBlur('mileage', mileageInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  const handleEnginePowerBlur = useCallback(() => {
    onTextFieldBlur('enginePower', enginePowerInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  const handleEngineSizeBlur = useCallback(() => {
    onTextFieldBlur('engineSize', engineSizeInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  const handleDoorsBlur = useCallback(() => {
    onTextFieldBlur('doors', doorsInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  const handleVinBlur = useCallback(() => {
    onTextFieldBlur('vin', vinInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  const handlePlateBlur = useCallback(() => {
    onTextFieldBlur('plateNumber', plateInputRef.current?.value || "");
  }, [onTextFieldBlur]);
  
  // Modified SelectField to use SelectDropdown
  const SelectField = useCallback(
    ({
      label,
      field,
      options,
      placeholder,
      required = false,
    }: {
      label: string;
      field: string;
      options: any[];
      placeholder: string;
      optionsLabel: string;
      required?: boolean;
    }) => {
    
      const hasError = Object.prototype.hasOwnProperty.call(validationErrors, field) && validationErrors[field as keyof ValidationErrors];
      
      return (
        <FormField label={label} field={field} required={required}>
          <SelectDropdown
            label=""
            options={options}
            placeholder={placeholder}
            SelectTriggerStyle={`${hasError ? "border-red-500" : ""}`}
            className="w-full text-primary"
          />
        </FormField>
      );
    },
    [validationErrors]
  );

  // Function to handle select changes from SelectDropdown
  const handleSelectDropdownChange = useCallback((field: string, value: string) => {
    onSelectChange(field, value);
  }, [onSelectChange]);

  return (
    <div className="grid gap-5 p-5 w-full">
      {/* Price and Currency - Grid for these two fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <FormField 
          label={labels.price} 
          field="price" 
          required
          error={validationErrors.price}
        >
          <Input
            type="text"
            ref={priceInputRef}
            defaultValue={carInfo.price || ""}
            onBlur={handlePriceBlur}
            placeholder={labels.enterPrice}
            className={`w-full ${validationErrors.price ? "border-red-500" : ""} text-primary`}
          />
        </FormField>

        <SelectField
          label={labels.currency}
          field="currency"
          options={options.currency}
          placeholder={labels.selectCurrency}
          optionsLabel={labels.currencies}
          required
        />
      </div>

      {/* Mileage and Engine Power */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" >
        <FormField label={labels.mileage} field="mileage" required>
          <Input
            type="text"
            ref={mileageInputRef}
            defaultValue={carInfo.mileage || ""}
            onBlur={handleMileageBlur}
            placeholder={labels.enterMileage}
            className="w-full text-primary"
          />
        </FormField>

        <FormField label={labels.enginePower} field="enginePower" required>
          <Input
            type="text"
            ref={enginePowerInputRef}
            defaultValue={carInfo.enginePower || ""}
            onBlur={handleEnginePowerBlur}
            placeholder={labels.enterEnginePower}
            className="w-full text-primary"
          />
        </FormField>
      </div>

      {/* Engine Size and Doors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <FormField 
          label={labels.engineSize} 
          field="engineSize" 
          required
          error={validationErrors.engineSize}
        >
          <Input
            type="text"
            ref={engineSizeInputRef}
            defaultValue={carInfo.engineSize || ""}
            onBlur={handleEngineSizeBlur}
            placeholder={labels.enterEngineSize}
            className={`w-full ${validationErrors.engineSize ? "border-red-500" : ""} text-primary`}
          />
        </FormField>

        <FormField 
          label={labels.doors} 
          field="doors" 
          required
          error={validationErrors.doors}
        >
          <Input
            type="text"
            ref={doorsInputRef}
            defaultValue={carInfo.doors || ""}
            onBlur={handleDoorsBlur}
            placeholder={labels.enterDoors}
            className={`w-full ${validationErrors.doors ? "border-red-500" : ""} text-primary`}
          />
        </FormField>
      </div>

      {/* Plate Number and VIN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" >
        <FormField label={labels.plateNumber} field="plateNumber" required>
          <Input
            type="text"
            ref={plateInputRef}
            defaultValue={carInfo.plateNumber || ""}
            placeholder={labels.enterPlateNumber}
            onBlur={handlePlateBlur}
            className="w-full text-primary"
          />
        </FormField>

        <FormField label={labels.vin} field="vin" required>
          <Input
            type="text"
            ref={vinInputRef}
            defaultValue={carInfo.vin || ""}
            placeholder={labels.enterVin}
            onBlur={handleVinBlur}
            className="w-full text-primary"
          />
        </FormField>
      </div>

      {/* Exterior and Interior Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
        <SelectField
          label={labels.colorExterior}
          field="colorExterior"
          options={options.colors}
          placeholder={labels.selectColorExterior}
          optionsLabel={labels.extColors}
          required
        />
        
        <SelectField
          label={labels.colorInterior}
          field="colorInterior"
          options={options.colors}
          placeholder={labels.selectColorInterior}
          optionsLabel={labels.intColors}
          required
        />
      </div>

      {/* Fuel Type and Body Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label={labels.fuelType}
          field="fuelType"
          options={options.fuelType}
          placeholder={labels.selectFuelType}
          optionsLabel={labels.fuelTypes}
          required
        />
        
        <SelectField
          label={labels.bodyType}
          field="bodyType"
          options={options.bodyType}
          placeholder={labels.selectBodyType}
          optionsLabel={labels.bodyTypes}
          required
        />
      </div>

      {/* Transmission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label={labels.transmission}
          field="transmission"
          options={options.transmission}
          placeholder={labels.selectTransmission}
          optionsLabel={labels.transmissions}
          required
        />
      </div>
    </div>
  );
};

export default React.memo(CarInfoForm);