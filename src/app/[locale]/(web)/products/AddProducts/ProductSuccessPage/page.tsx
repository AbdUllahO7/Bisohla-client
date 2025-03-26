"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProductSuccessPage() {
    const router = useRouter()

    const handleHomeClick = () => {
        router.push("/")
    }

    const handleProfileClick = () => {
        router.push("/userProfile")
    }

    return (
        <div className="container mx-auto py-10 flex items-center justify-center min-h-[80vh]">
        <Card className="max-w-md w-full">
            <CardHeader className="flex flex-col items-center justify-center text-center gap-4 pt-8">
            <CheckCircle className="h-20 w-20 text-green-500" />
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Product Added Successfully!</h1>
                <p className="text-muted-foreground">
                Your item has been added to your cart. Would you like to continue shopping or view your profile?
                </p>
            </div>
            </CardHeader>

            <CardContent>
            <div className="h-px bg-border my-4" />
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-4 pb-8">
            <Button variant="outline" className="flex-1" onClick={handleHomeClick} size="lg">
                View Home 
            </Button>
            <Button className="flex-1" onClick={handleProfileClick} size="lg">
                View Profile
            </Button>
            </CardFooter>
        </Card>
        </div>
    )
}

