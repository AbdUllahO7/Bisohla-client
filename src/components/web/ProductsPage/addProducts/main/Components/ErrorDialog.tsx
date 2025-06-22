// ErrorDialog.tsx
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { AlertCircle } from 'lucide-react'

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  errorMessage: string
  tryAgainText: string
  onTryAgain: () => void
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  errorMessage,
  tryAgainText,
  onTryAgain
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[999] absolute">
        <DialogHeader>
          <Box className="flex flex-col items-center justify-center text-center gap-2">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          </Box>
        </DialogHeader>

        
        <DialogFooter className="flex flex-col mt-4">
          <Button
            className="w-full"
            onClick={onTryAgain}
          >
            {tryAgainText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ErrorDialog