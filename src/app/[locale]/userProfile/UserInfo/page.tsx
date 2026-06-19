'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Loader2,
  AtSign,
  Phone,
  Lock,
  Key,
  Save,
  Trash2,
  LogOut,
} from 'lucide-react';
import {
  useGetMyProfile,
  useUpdateUserProfile,
  useDeleteMyAccount,
} from '@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions';
import ImageUploader, {
  ImageUploaderRef,
} from '@/components/image-uploader/image-uploader';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  profileFormSchema,
  ProfileFormValues,
} from '@/core/entities/models/users/users.dto';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useRouter } from '@/i18n/routing';
import { deleteSession } from '@/core/lib/web/session';

// KeyValue component for consistent display of field labels and values
interface KeyValueFieldProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  children?: React.ReactNode;
  className?: string;
}

const KeyValueField: React.FC<KeyValueFieldProps> = ({
  icon,
  label,
  value,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{label}</span>
      </div>
      <div className="pl-7">
        {children || <div className="text-gray-900 dark:text-white">{value}</div>}
      </div>
    </div>
  );
};

const UserInfoPage = () => {
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const profileImageRef = useRef<ImageUploaderRef>(null);
  const locale = useLocale();
  const router = useRouter();

  // Get translations
  const t = useTranslations('UserProfile.profile');

  // Get user profile data
  const {
    data,
    isLoading: isProfileLoading,
    error,
    refetch,
  } = useGetMyProfile();

  // Update user profile mutation
  const updateProfileMutation = useUpdateUserProfile();

  // Delete account mutation
  const deleteAccountMutation = useDeleteMyAccount();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: null,
      bio: '',
      password: null,
      passwordConfirmation: null,
      profileUrl: null,
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
  const handleProfileImageChange = useCallback(
    (urls: string[]) => {
      const url = urls.length > 0 ? urls[0] : null;
      profileForm.setValue('profileUrl', url);
    },
    [profileForm],
  );

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
      // Refresh profile data
      refetch();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccountMutation.mutateAsync(null);

      if (result.success) {
        // Close the dialog
        setIsDeleteDialogOpen(false);

        // Redirect to home page (session is already deleted by the backend)
        router.push('/');
      } else {
        // Close the dialog on error
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await deleteSession();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isSubmitting = updateProfileMutation.isPending;
  const isLoading = isProfileLoading;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const formItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      className="w-full container mx-auto py-8"
      dir={locale === 'en' ? 'ltr' : 'rtl'}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center justify-between mb-6 gap-2 w-full"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('YourProfile')}</h1>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 rounded-md transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            {locale === 'en' ? 'Logout' : 'تسجيل الخروج'}
          </Button>
        </motion.div>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-md p-8 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      ) : (
        <motion.div
          className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-md"
          variants={itemVariants}
        >
          <motion.div
            className="p-6 border-b border-gray-100 dark:border-zinc-800"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('editProfile')}</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{t('editProfile')}</p>
          </motion.div>

          <motion.div className="p-6 space-y-8" variants={containerVariants}>
            <motion.div
              className="flex flex-col gap-6 items-start"
              variants={itemVariants}
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center w-full">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                  }}
                >
                  <Avatar className="h-24 w-24 border-2 border-gray-100 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30">
                    {profileForm.getValues('profileUrl') ? (
                      <AvatarImage
                        src={profileForm.getValues('profileUrl') ?? undefined}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarImage
                        src="/placeholder.svg?height=96&width=96"
                        alt="Profile"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(profileForm.getValues('name'))}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="space-y-2 flex-1">
                  <motion.h4
                    className="text-sm font-medium text-gray-900 dark:text-white"
                    variants={itemVariants}
                  >
                    {t('YourProfile')}
                  </motion.h4>
                  <motion.p
                    className="text-xs text-gray-500 dark:text-zinc-400"
                    variants={itemVariants}
                  >
                    {t('editProfile')}
                  </motion.p>

                  {isClient && (
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <ImageUploader
                        maxImages={1}
                        onChange={handleProfileImageChange}
                        setDisableForm={setIsFormDisabled}
                        maxSizeInMB={3}
                        showPreview={true}
                        name="profile-image"
                        containerClassName="w-full mt-2"
                        dropzoneClassName="p-4 border-dashed border-2 border-gray-200 dark:border-zinc-800 rounded-md hover:border-primary/50 transition-all duration-300"
                        ref={profileImageRef}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Separator className="bg-gray-100 dark:bg-zinc-800" />
            </motion.div>

            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <motion.div
                  className="grid gap-6 sm:grid-cols-2"
                  variants={containerVariants}
                >
                  <motion.div variants={formItemVariants}>
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <KeyValueField
                            icon={<User className="h-4 w-4 text-primary" />}
                            label={t('name')}
                          >
                            <FormControl>
                              <Input
                                placeholder={t('name')}
                                {...field}
                                disabled={isFormDisabled}
                                className="border-gray-200 dark:border-zinc-800 focus:border-primary focus:ring-primary rounded-md transition-all duration-300 dark:bg-zinc-900 dark:text-zinc-100"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </KeyValueField>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={formItemVariants}>
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <KeyValueField
                            icon={<AtSign className="h-4 w-4 text-primary" />}
                            label={t('email')}
                          >
                            <FormControl>
                              <Input
                                placeholder={t('email')}
                                {...field}
                                disabled={true}
                                className="border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-md transition-all duration-300"
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-400">
                              {/* Email cannot be changed here message */}
                            </FormDescription>
                            <FormMessage className="text-xs" />
                          </KeyValueField>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <KeyValueField
                          icon={<Phone className="h-4 w-4 text-primary" />}
                          label={t('phoneNumber')}
                        >
                          <FormControl>
                            <Input
                              placeholder={t('phoneNumber')}
                              {...field}
                              value={field.value || ''}
                              disabled={isFormDisabled}
                              className="border-gray-200 dark:border-zinc-800 focus:border-primary focus:ring-primary rounded-md transition-all duration-300 dark:bg-zinc-900 dark:text-zinc-100"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </KeyValueField>
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  className="grid gap-6 sm:grid-cols-2"
                  variants={containerVariants}
                >
                  <motion.div variants={formItemVariants}>
                    <FormField
                      control={profileForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <KeyValueField
                            icon={<Lock className="h-4 w-4 text-primary" />}
                            label={t('newPassword')}
                          >
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t('newPassword')}
                                {...field}
                                value={field.value || ''}
                                disabled={isFormDisabled}
                                className="border-gray-200 dark:border-zinc-800 focus:border-primary focus:ring-primary rounded-md transition-all duration-300 dark:bg-zinc-900 dark:text-zinc-100"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </KeyValueField>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={formItemVariants}>
                    <FormField
                      control={profileForm.control}
                      name="passwordConfirmation"
                      render={({ field }) => (
                        <FormItem>
                          <KeyValueField
                            icon={<Key className="h-4 w-4 text-primary" />}
                            label={t('repeatPassword')}
                          >
                            <FormControl>
                              <Input
                                type="password"
                                placeholder={t('repeatPassword')}
                                {...field}
                                value={field.value || ''}
                                disabled={isFormDisabled}
                                className="border-gray-200 dark:border-zinc-800 focus:border-primary focus:ring-primary rounded-md transition-all duration-300 dark:bg-zinc-900 dark:text-zinc-100"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </KeyValueField>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="pt-4 flex flex-col sm:flex-row gap-4 items-start"
                  variants={itemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting || isFormDisabled}
                      className="bg-primary hover:bg-primary/90 text-white rounded-md transition-all duration-300 px-6 shadow-sm hover:shadow"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('saveChanges')}...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t('saveChanges')}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </Form>

            <motion.div variants={itemVariants}>
              <Separator className="bg-gray-100 dark:bg-zinc-800 my-6" />
            </motion.div>

            <motion.div className="space-y-4" variants={itemVariants}>
              <div>
                <h3 className="text-lg font-semibold text-red-600">
                  {t('deleteAccount.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  {t('deleteAccount.description')}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="rounded-md transition-all duration-300 px-6 shadow-sm hover:shadow"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('deleteAccount.button')}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('deleteAccount.confirmTitle')}
        description={t('deleteAccount.confirmDescription')}
        confirmText={t('deleteAccount.confirmButton')}
        cancelText={t('deleteAccount.cancelButton')}
        onConfirm={handleDeleteAccount}
        isLoading={deleteAccountMutation.isPending}
        variant="destructive"
      />
    </motion.div>
  );
};

export default UserInfoPage;
