'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useDirection } from '@/hooks/use-direction';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  variant = 'default',
}) => {
  const dir = useDirection();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={dir === 'rtl' ? 'text-right' : 'text-left'}
      >
        <DialogHeader>
          <DialogTitle className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            {title}
          </DialogTitle>
          <DialogDescription
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
          >
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter
          className={`flex ${
            dir === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
          }`}
        >
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2
                  className={`h-4 w-4 animate-spin ${
                    dir === 'rtl' ? 'ml-2' : 'mr-2'
                  }`}
                />
                {confirmText}...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
