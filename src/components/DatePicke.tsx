"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const FormSchema = z.object({
  dob: z.date({
    required_error: "A date is required.",
  }).optional(),
})

interface DatePickerFormProps {
  title: string;
  placeHolder: string;
  onChange?: (date: string | null) => void;
  initialDate?: string | null;
  allowFutureDates?: boolean;
  allowPastDates?: boolean;
}

// Function to create a date at noon to avoid timezone issues
const createTimezoneConsistentDate = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
  return newDate;
};

// Function to format date to YYYY-MM-DD format (e.g., "2025-04-25")
const formatToSimpleDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DatePickerForm({ 
  title, 
  placeHolder, 
  onChange, 
  initialDate,
  allowFutureDates = false,
  allowPastDates = true
}: DatePickerFormProps) {
  // Prevent initial render from triggering onChange
  const isInitialMount = useRef(true);
  const lastSelectedDate = useRef<Date | null>(null);
  
  // Parse initialDate if provided
  const parsedInitialDate = initialDate ? new Date(initialDate) : undefined;
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dob: parsedInitialDate ? createTimezoneConsistentDate(parsedInitialDate) : undefined
    }
  });

  // Set initial value from prop only once on mount
  useEffect(() => {
    if (isInitialMount.current && parsedInitialDate && !isNaN(parsedInitialDate.getTime())) {
      const consistentDate = createTimezoneConsistentDate(parsedInitialDate);
      form.setValue('dob', consistentDate);
      lastSelectedDate.current = consistentDate;
      isInitialMount.current = false;
    }
  }, [form, parsedInitialDate]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // Not needed for this implementation, but required by the form
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{title}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{placeHolder}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      if (!date) {
                        field.onChange(undefined);
                        lastSelectedDate.current = null;
                        if (onChange) {
                          onChange(null);
                        }
                        return;
                      }
                      
                      // Create a date at noon to avoid timezone issues
                      const consistentDate = createTimezoneConsistentDate(date);
                      
                      // Avoid duplicate onChange calls
                      if (lastSelectedDate.current && 
                          consistentDate.getTime() === lastSelectedDate.current.getTime()) {
                        return;
                      }
                      
                      // Update form field
                      field.onChange(consistentDate);
                      lastSelectedDate.current = consistentDate;
                      
                      // Notify parent component with a simple date format string (YYYY-MM-DD)
                      if (onChange) {
                        onChange(formatToSimpleDate(consistentDate));
                      }
                    }}
                    // Remove or modify date restrictions based on props
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      // If past dates are not allowed, disable dates before today
                      if (!allowPastDates && date < today) {
                        return true;
                      }
                      
                      // If future dates are not allowed, disable dates after today
                      if (!allowFutureDates && date > today) {
                        return true;
                      }
                      
                      // Extremely old dates are still disabled for usability
                      return date < new Date("1900-01-01");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}