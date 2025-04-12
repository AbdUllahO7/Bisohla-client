"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {  User } from "lucide-react"
import { useSession } from "@/hooks/auth/use-session"

const profileFormSchema = z.object({
name: z
    .string()
    .min(2, {
    message: "Name must be at least 2 characters.",
    })
    .max(30, {
    message: "Name must not be longer than 30 characters.",
    }),
email: z.string().email({
    message: "Please enter a valid email address.",
}),
bio: z.string().max(160).optional(),
urls: z
    .object({
    website: z.string().url({ message: "Please enter a valid URL." }).optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    })
    .optional(),
})



type ProfileFormValues = z.infer<typeof profileFormSchema>





const UserInfoPage = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    

    // Profile form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
        name: "John Doe",
        email: "john.doe@example.com",
        bio: "I'm a software developer based in New York.",
        urls: {
            website: "https://example.com",
            twitter: "johndoe",
            linkedin: "johndoe",
        },
        },
    })

    function onProfileSubmit(data: ProfileFormValues) {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
        console.log(data)
        setIsLoading(false)
        }, 1000)
    }

    return (
        <Tabs defaultValue="profile" className="w-full container ">
        <TabsList className="grid w-full grid-cols-4 bg-primary">
            <TabsTrigger value="profile" className="flex items-center gap-2 ">
            <User className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-primary">Profile</span>
            </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 bg-white">
            <Card className="bg-primary">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Profile Picture</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="text-primary"> 
                        Upload new image
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                        Remove
                    </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 3MB.</p>
                </div>
                </div>

                <Separator />

                <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>

                    <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Tell us a little bit about yourself"
                            className="resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Brief description for your profile. URLs are hyperlinked.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                        control={profileForm.control}
                        name="urls.website"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="urls.twitter"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                            <Input placeholder="@username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={profileForm.control}
                        name="urls.linkedin"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                            <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>

                    <Button type="submit" disabled={isLoading} className="bg-primary-light text-white">
                    {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </TabsContent>

        </Tabs>
    )
}

export default UserInfoPage