'use client'
import React from "react";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormField from "./FormField";
import { SelectFieldProps } from "./types";

/**
 * Reusable select field component
 */
const SelectField: React.FC<SelectFieldProps> = ({
  label,
  field,
  options,
  placeholder,
  optionsLabel,
  required = false,
}) => {
  const locale = useLocale();
  const direction = locale === 'ar' ? "rtl" : "ltr";
  
  // Function to handle value change
  const handleChange = (value: string) => {
    // This component uses the provided onChange function from CarInfoForm
    // which will be passed down as a prop
    if (typeof window !== 'undefined') {
      // Create a custom event that will be handled by the parent component
      const event = new CustomEvent('select-field-change', {
        detail: { field, value }
      });
      window.dispatchEvent(event);
    }
  };

  // Get the current value from the global event listener in the parent
  const [value, setValue] = React.useState("");
  
  React.useEffect(() => {
    // Listen for value updates from the parent
    const handleValueUpdate = (e: CustomEvent) => {
      if (e.detail.field === field) {
        setValue(e.detail.value);
      }
    };
    
    window.addEventListener('select-field-value-update' as any, handleValueUpdate as EventListener);
    
    // Fire an event to request the current value
    const event = new CustomEvent('select-field-request-value', {
      detail: { field }
    });
    window.dispatchEvent(event);
    
    return () => {
      window.removeEventListener('select-field-value-update' as any, handleValueUpdate as EventListener);
    };
  }, [field]);

  return (
    <FormField label={label} field={field} required={required}>
      <Select
        value={value}
        onValueChange={handleChange}
        dir={direction}
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
  );
};

export default React.memo(SelectField);