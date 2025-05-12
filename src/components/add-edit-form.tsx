/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ReactElement, ReactNode, useState } from 'react';
import { Column } from '@/components/customizable-table';
import ImageUploader from './image-uploader';

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'image';

export interface FormColumn<T> extends Column<T> {
  inputConfig?: {
    required?: boolean;
    type?: FieldType;
    options?: { value: string; label: string }[];
    placeholder?: string;
    multiple?: boolean;
    render?: (props: {
      value: any;
      onChange: (value: any) => void;
      error?: string;
    }) => React.ReactElement;
  };
}

interface AdminAddEditFormProps<
  T extends Record<string, any>,
  C extends Record<string, any>,
> {
  columns: FormColumn<T>[];
  schema: z.ZodSchema<C>;
  onSubmit: SubmitHandler<C>;
  defaultValues?: Partial<T>;
  buttonText?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  saveButton?: string;
  triggerButton?: ReactNode;
}

const AddEditForm = <
  T extends Record<string, any>,
  C extends Record<string, any>,
>({
  columns,
  schema,
  onSubmit,
  defaultValues,
  buttonText = 'Add New',
  dialogTitle = 'Create New Entry',
  dialogDescription = 'Fill in the form below to create a new entry.',
  saveButton = 'Save',
  triggerButton,
}: AdminAddEditFormProps<T, C>) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<C>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const handleFormSubmit = (data: C) => {
    onSubmit(data);
    setIsOpen(false);
    reset();
  };

  const firstError = Object.values(errors)[0]?.message as string | undefined;

  const renderInput = (column: FormColumn<T>, field: any): ReactElement => {
    if (!column.inputConfig) {
      return <span></span>;
    }

    if (column.inputConfig.render) {
      return column.inputConfig.render({
        value: field.value,
        onChange: field.onChange,
        error: errors[column.key]?.message as string,
      });
    }

    switch (column.inputConfig.type) {
      case 'textarea':
        return (
          <Textarea {...field} placeholder={column.inputConfig.placeholder} />
        );
      case 'select':
        return (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            {...(column.inputConfig.multiple ? { multiple: true } : {})} // Correct multiple usage
          >
            <SelectTrigger>
              <SelectValue placeholder={column.inputConfig.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {column.inputConfig.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-4 w-4"
          />
        );
      case 'image':
        return (
          <ImageUploader
            key={column.key}
            maxImages={1}
            onImagesChange={(files) => field.onChange(files[0])}
            showPreview
            defaultValues={field.value ? [field.value] : undefined}
            id={column.key}
          />
        );
      default:
        return (
          <Input
            {...field}
            type={column.inputConfig.type}
            placeholder={column.inputConfig.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger {...(triggerButton ? { asChild: true } : {})}>
        {triggerButton || buttonText}
      </DialogTrigger>

      <DialogContent className="max-w-[80vw] w-[60vw] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
            {firstError && (
              <span className="text-sm text-red-500">{firstError}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {columns.map((column) => {
            if (!column.inputConfig) return null;

            return (
              <div key={column.key as string} className="space-y-2">
                <Label>
                  {column.header}
                  {column.inputConfig.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>

                <Controller
                  name={column.key as any}
                  control={control}
                  render={({ field }) => renderInput(column, field)}
                />

                {errors[column.key] && (
                  <p className="text-sm text-red-500">
                    {errors[column.key]?.message as string}
                  </p>
                )}
              </div>
            );
          })}

          <DialogFooter>
            <Button type="submit">{saveButton}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditForm;
