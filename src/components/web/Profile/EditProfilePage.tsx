'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Phone,
  Lock,
  Loader2,
  Save,
  Trash2,
  Camera,
  AtSign,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useGetMyProfile,
  useUpdateUserProfile,
} from '@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions';
import ImageUploader from '@/components/image-uploader/image-uploader';
import { useToast } from '@/hooks/use-toast';

const editProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50, { message: 'Name must be 50 characters or less' }),
    phone: z.string().optional(),
    profileUrl: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8;
      }
      return true;
    },
    {
      message: 'Password must be at least 8 characters',
      path: ['password'],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords must match',
      path: ['confirmPassword'],
    },
  );

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export function EditProfilePage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { toast } = useToast();

  const [showUploader, setShowUploader] = useState(false);

  const { data: profileData, isLoading: isProfileLoading, refetch } = useGetMyProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const profile = profileData?.data;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
      profileUrl: '',
      password: '',
      confirmPassword: '',
    },
  });

  const currentProfileUrl = watch('profileUrl');

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        phone: profile.phoneNumber || '',
        profileUrl: profile.profileUrl || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [profile, reset]);

  const handleRemoveAvatar = () => {
    setValue('profileUrl', '', { shouldDirty: true });
  };

  const onSubmit = async (values: EditProfileFormValues) => {
    try {
      const payload: any = {
        name: values.name,
        phone: values.phone || null,
        profileUrl: values.profileUrl || null,
      };

      if (values.password && values.password.length >= 8) {
        payload.password = values.password;
        payload.passwordConfirmation = values.confirmPassword;
      }

      const res = await updateProfileMutation.mutateAsync(payload);
      if (res.success) {
        toast({
          title: isArabic ? 'تم تحديث الملف الشخصي' : 'Profile Updated',
          description: isArabic
            ? 'تم حفظ التعديلات بنجاح'
            : 'Your profile has been saved successfully.',
        });
        refetch();
      } else {
        toast({
          title: isArabic ? 'خطأ' : 'Error',
          description: res.message || (isArabic ? 'فشل حفظ التعديلات' : 'Failed to save changes'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل حفظ التعديلات' : 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const breadcrumbItems = [
    { label: isArabic ? 'الملف الشخصي' : 'Profile', href: '/userProfile' },
    { label: isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile' },
  ];

  if (isProfileLoading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          <div className="h-8 bg-gray-100 dark:bg-zinc-800 rounded-xl w-48 animate-pulse" />
          <div className="h-96 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
              {isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isArabic
                ? 'تحديث معلومات حسابك وصورتك الشخصية'
                : 'Update your profile photo and personal account information'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              {isArabic ? 'الصورة الشخصية' : 'Profile Photo'}
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#198341]/10 shadow-lg">
                  {currentProfileUrl ? (
                    <AvatarImage src={currentProfileUrl} alt={profile?.name || 'User'} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white text-3xl font-bold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-3 text-center sm:text-left rtl:sm:text-right flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploader((prev) => !prev)}
                    className="rounded-xl flex items-center gap-2 border-gray-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    <Camera size={15} />
                    <span>
                      {showUploader
                        ? isArabic
                          ? 'إخفاء رافع الصور'
                          : 'Hide Uploader'
                        : isArabic
                        ? 'تغيير الصورة'
                        : 'Upload New Photo'}
                    </span>
                  </Button>

                  {currentProfileUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRemoveAvatar}
                      className="rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold"
                    >
                      {isArabic ? 'إزالة الصورة' : 'Remove Photo'}
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-gray-400">
                  {isArabic
                    ? 'يُفضل استخدام صورة مربعة بدقة 500×500 بكسل على الأقل (JPG, PNG, WebP)'
                    : 'Square format recommended, at least 500x500px (JPG, PNG, WebP)'}
                </p>
              </div>
            </div>

            {/* Embedded Image Uploader */}
            {showUploader && (
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <ImageUploader
                  maxImages={1}
                  value={currentProfileUrl ? [currentProfileUrl] : []}
                  onChange={(urls) => {
                    if (urls.length > 0) {
                      setValue('profileUrl', urls[0], { shouldDirty: true });
                      setShowUploader(false);
                    }
                  }}
                  showPreview={false}
                />
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              {isArabic ? 'المعلومات الأساسية' : 'Personal Information'}
            </h2>

            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 flex items-center gap-1.5">
                <AtSign size={14} className="text-gray-400" />
                <span>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</span>
              </Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-gray-100/70 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-800 rounded-xl text-gray-500 cursor-not-allowed text-xs"
              />
              <p className="text-[10px] text-gray-400">
                {isArabic ? 'البريد الإلكتروني مرتبط بحسابك ولا يمكن تغييره هنا' : 'Email is linked to your account and cannot be modified'}
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User size={14} className="text-[#198341]" />
                <span>{isArabic ? 'الاسم الكامل' : 'Full Name'} *</span>
              </Label>
              <Input
                {...register('name')}
                placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl text-xs"
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Phone size={14} className="text-[#198341]" />
                <span>{isArabic ? 'رقم الهاتف' : 'Phone Number'}</span>
              </Label>
              <Input
                {...register('phone')}
                placeholder={isArabic ? '09XXXXXXXX أو +963XXXXXXXXX' : '+963XXXXXXXXX'}
                className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
              />
              {errors.phone && (
                <p className="text-[11px] text-red-500 font-medium">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Change Password (Optional) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isArabic
                  ? 'اترك الحقول فارغة إذا كنت لا ترغب بتغيير كلمة المرور'
                  : 'Leave blank if you do not wish to change your password'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock size={14} className="text-gray-400" />
                  <span>{isArabic ? 'كلمة المرور الجديدة' : 'New Password'}</span>
                </Label>
                <Input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl text-xs"
                />
                {errors.password && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Lock size={14} className="text-gray-400" />
                  <span>{isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}</span>
                </Label>
                <Input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl text-xs"
                />
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold shadow-md shadow-[#198341]/20 hover:shadow-lg transition-all"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
                  <span>{isArabic ? 'جاري الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={16} />
                  <span>{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
