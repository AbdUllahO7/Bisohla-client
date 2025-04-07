// SuccessDialog.tsx
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
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SuccessDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    homeButtonText: string
    profileButtonText: string
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    homeButtonText,
    profileButtonText
}) => {
    const router = useRouter()

    const handleHomeClick = () => {
        router.push('/')
    }

    const handleProfileClick = () => {
        router.push('/userProfile')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <Box className="flex flex-col items-center justify-center text-center gap-2">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                <DialogDescription className="text-center">
                {description}
                </DialogDescription>
            </Box>
            </DialogHeader>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button
                variant="outline"
                className="flex-1 sm:mr-2"
                onClick={handleHomeClick}
            >
                {homeButtonText}
            </Button>
            <Button
                className="flex-1"
                onClick={handleProfileClick}
            >
                {profileButtonText}
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    )
}

export default SuccessDialog