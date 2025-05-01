"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Loader2 } from "lucide-react"
import { useSession } from "@/hooks/auth/use-session"
import { useGetMyProfile, useUpdateUserProfile } from "@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions"
import ImageUploader, { ImageUploaderRef } from "@/components/image-uploader/image-uploader"

// Define profile schema based on our DTO
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name must not be longer than 50 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().max(160).optional(),
  // We'll handle password separately
  password: z.string().min(8).max(255).nullable().optional(),
  passwordConfirmation: z.string().min(8).max(255).nullable().optional(),
  profileUrl: z.string().nullable().optional()
})
  .refine((data) => {
    if (data.password && !data.passwordConfirmation) return false;
    if (!data.password && data.passwordConfirmation) return false;
    if (data.password && data.passwordConfirmation && data.password !== data.passwordConfirmation) return false;
    return true;
  }, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>

const UserInfoPage = () => {
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const profileImageRef = useRef<ImageUploaderRef>(null);
  
  // Get user profile data
  const { data, isLoading: isProfileLoading, error, refetch } = useGetMyProfile();
  
  // Update user profile mutation
  const updateProfileMutation = useUpdateUserProfile();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: null,
      bio: "",
      password: null,
      passwordConfirmation: null,
      profileUrl: null
    },
  });
  
  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Update form when profile data is loaded
  useEffect(() => {
    if (data?.data) {
      const profile = data.data;
      profileForm.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phoneNumber,
        profileUrl: profile.profileUrl,
        // We don't populate password fields
        password: null,
        passwordConfirmation: null,
      });
    }
  }, [data, profileForm]);

  // Handle profile image changes from ImageUploader
  const handleProfileImageChange = useCallback((urls: string[]) => {
    const url = urls.length > 0 ? urls[0] : null;
    profileForm.setValue("profileUrl", url);
  }, [profileForm]);

  // Submit profile form
  async function onProfileSubmit(data: ProfileFormValues) {
    try {
      // Prepare data for update
      const updateData = {
        name: data.name,
        bio: data.bio,
        phone: data.phone,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
        profileUrl: data.profileUrl,
      };
      
      // Send update request
      await updateProfileMutation.mutateAsync(updateData);
      console.log("Profile updated successfully",updateData);
      // Refresh profile data
      refetch();
      
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isSubmitting = updateProfileMutation.isPending;
  const isLoading = isProfileLoading;

  return (
    <Tabs defaultValue="profile" className="w-full container">
      <TabsList className="grid w-full grid-cols-4 bg-primary">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline text-primary">Profile</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6 bg-white">
        {isLoading ? (
          <Card className="bg-primary p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : (
          <Card className="bg-primary">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-6 items-start">
                <div className="flex flex-row gap-6 items-center">
                  <Avatar className="h-24 w-24">
                    {profileForm.getValues("profileUrl") ? (
                      <AvatarImage src={profileForm.getValues("profileUrl") ?? undefined} alt="Profile" />
                    ) : (
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                    )}
                    <AvatarFallback>{getInitials(profileForm.getValues("name"))}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground">Change your profile picture below</p>
                  </div>
                </div>
                
                {isClient && (
                  <ImageUploader 
                    maxImages={1}
                    onChange={handleProfileImageChange}
                    setDisableForm={setIsFormDisabled}
                    maxSizeInMB={3}
                    showPreview={true}
                    name="profile-image"
                    containerClassName="w-full"
                    dropzoneClassName="p-4"
                    ref={profileImageRef}
                  />
                )}
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
                            <Input placeholder="Your name" {...field} disabled={isFormDisabled} />
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
                            <Input 
                              placeholder="Your email" 
                              {...field} 
                              disabled={true} // Email shouldn't be editable via profile
                            />
                          </FormControl>
                          <FormDescription>Email cannot be changed here.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your phone number" 
                            {...field} 
                            value={field.value || ""}
                            disabled={isFormDisabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

              

                  {/* Password fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Leave blank to keep current" 
                              {...field} 
                              value={field.value || ""}
                              disabled={isFormDisabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="passwordConfirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm new password" 
                              {...field} 
                              value={field.value || ""}
                              disabled={isFormDisabled}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isFormDisabled} 
                    className="bg-primary-light text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}

export default UserInfoPage