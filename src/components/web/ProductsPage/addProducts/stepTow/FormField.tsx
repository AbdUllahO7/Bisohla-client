'use client'
import React from "react";
import Text from "@/components/text/text";
import { FormFieldProps } from "./types";

/**
 * Reusable form field component with error handling
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  required = false,
  error = "",
}) => (
  <div className="flex flex-col gap-2 w-full">
    <Text className="font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Text>
    {children}
    {error && (
      <div className="text-red-500 text-sm mt-1">
        {error}
      </div>
    )}
  </div>
);

export default React.memo(FormField);