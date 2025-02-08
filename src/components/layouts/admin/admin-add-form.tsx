/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import AddEditForm, { FormColumn } from '@/components/add-edit-form';

interface AdminAddRecordProps<T, C> {
  columns: FormColumn<T>[];
  onSave: (data: C) => void;
  createSchema: z.ZodSchema<C>;
  buttonTitle?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  saveButton?: string;
}

const AdminAddForm = <
  T extends Record<string, any>,
  C extends Record<string, any>,
>({
  columns,
  onSave,
  buttonTitle = 'Add Record',
  dialogTitle = 'Add Record',
  dialogDescription = "Add a new record here. Click save when you're done.",
  saveButton = 'Save changes',
  createSchema,
}: AdminAddRecordProps<T, C>) => {
  // Generate default values based on input types
  const defaultValues = columns.reduce((acc, col) => {
    if (col.key && col.inputConfig?.required) {
      // Provide appropriate default values based on input type
      let defaultValue: unknown = '';

      switch (col.inputConfig.type) {
        case 'number':
          defaultValue = 0;
          break;
        case 'checkbox':
          defaultValue = false;
          break;
        case 'select':
          // Use the first option's value if available, otherwise empty string
          defaultValue = col.inputConfig.options?.[0]?.value ?? '';
          break;
        case 'date':
          defaultValue = new Date().toISOString().split('T')[0];
          break;
        default:
          defaultValue = '';
      }

      acc[col.key as keyof T] = defaultValue as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);

  return (
    <AddEditForm
      columns={columns}
      schema={createSchema}
      onSubmit={onSave}
      buttonText={buttonTitle}
      dialogTitle={dialogTitle}
      dialogDescription={dialogDescription}
      saveButton={saveButton}
      defaultValues={defaultValues}
      triggerButton={
        <Button className="gap-2" size="sm">
          <PlusIcon />
          {buttonTitle}
        </Button>
      }
    />
  );
};

export default AdminAddForm;
