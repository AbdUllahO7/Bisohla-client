'use client'
import React, { useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import FormField from "./FormField";
import { CarInfoState, ValidationErrors } from "./types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  
  // Setup global event listeners for SelectField components
  useEffect(() => {
    const handleSelectFieldChange = (e: CustomEvent) => {
      onSelectChange(e.detail.field, e.detail.value);
    };
    
    const handleSelectFieldRequestValue = (e: CustomEvent) => {
      // Respond with current value
      const event = new CustomEvent('select-field-value-update', {
        detail: { 
          field: e.detail.field, 
          value: carInfo[e.detail.field] 
        }
      });
      window.dispatchEvent(event);
    };
    
    window.addEventListener('select-field-change' as any, handleSelectFieldChange as EventListener);
    window.addEventListener('select-field-request-value' as any, handleSelectFieldRequestValue as EventListener);
    
    return () => {
      window.removeEventListener('select-field-change' as any, handleSelectFieldChange as EventListener);
      window.removeEventListener('select-field-request-value' as any, handleSelectFieldRequestValue as EventListener);
    };
  }, [carInfo, onSelectChange]);

  // SelectField component within CarInfoForm
  const SelectField = useCallback(
    ({
      label,
      field,
      options,
      placeholder,
      optionsLabel,
      required = false,
    }: {
      label: string;
      field: string;
      options: any[];
      placeholder: string;
      optionsLabel: string;
      required?: boolean;
    }) => (
      <FormField label={label} field={field} required={required}>
        <Select
          value={carInfo[field]}
          onValueChange={(value) => onSelectChange(field, value)}
          dir={locale === 'ar' ? "rtl" : "ltr"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="w-full bg-white">
            <SelectGroup>
              <SelectLabel className="text-black font-bold">{optionsLabel}</SelectLabel>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex hover:bg-primary-foreground items-center justify-start gap-2"
                >
                  {/* Display color circle if the option has a hex color value */}
                  {option.hex && (
                    <span
                      className="w-3 h-3 rounded-full inline-block mr-1 ml-1"
                      style={{ backgroundColor: option.hex }}
                    />
                  )}
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>
    ),
    [carInfo, onSelectChange, locale]
  );

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
            className={`w-full ${validationErrors.price ? "border-red-500" : ""}`}
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
            className="w-full"
          />
        </FormField>

        <FormField label={labels.enginePower} field="enginePower" required>
          <Input
            type="text"
            ref={enginePowerInputRef}
            defaultValue={carInfo.enginePower || ""}
            onBlur={handleEnginePowerBlur}
            placeholder={labels.enterEnginePower}
            className="w-full"
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
            className={`w-full ${validationErrors.engineSize ? "border-red-500" : ""}`}
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
            className={`w-full ${validationErrors.doors ? "border-red-500" : ""}`}
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
            className="w-full"
          />
        </FormField>

        <FormField label={labels.vin} field="vin" required>
          <Input
            type="text"
            ref={vinInputRef}
            defaultValue={carInfo.vin || ""}
            placeholder={labels.enterVin}
            onBlur={handleVinBlur}
            className="w-full"
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