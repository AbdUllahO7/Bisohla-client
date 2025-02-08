'use client';

import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { EditIcon } from 'lucide-react';
import AddEditForm, { FormColumn } from '@/components/add-edit-form';

interface AdminEditRecordProps<T, S> {
  columns: FormColumn<T>[];
  onSave: (data: T) => void;
  defaultValues: Partial<T>;
  updateSchema: z.ZodSchema<S>;
  buttonTitle?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  saveButton?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdminEditForm = <T extends Record<string, any>, S>({
  columns,
  onSave,
  defaultValues,
  updateSchema,
  buttonTitle = 'Edit',
  dialogTitle = 'Edit Record',
  dialogDescription = "Edit the record here. Click save when you're done.",
  saveButton = 'Save changes',
}: AdminEditRecordProps<T, S>) => {
  return (
    <AddEditForm
      columns={columns}
      schema={updateSchema}
      onSubmit={onSave}
      defaultValues={defaultValues}
      buttonText={buttonTitle}
      dialogTitle={dialogTitle}
      dialogDescription={dialogDescription}
      saveButton={saveButton}
      triggerButton={
        <Button variant="outline" size="icon">
          <EditIcon className="text-secondary" />
        </Button>
      }
    />
  );
};

export default AdminEditForm;
