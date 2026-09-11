'use client';

import React, { useState, useTransition } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Languages,
  Star,
  Shield,
  PhoneCall,
  Download,
  BarChart3,
  LogOut,
  Trash2,
  ChevronRight,
  Info,
  Check,
  Sparkles,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';
import { useDeleteMyAccount } from '@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions';
import { useRateApp } from '@/hooks/use-rate-app';
import { RateAppModal } from '@/components/web/Ratings/RateAppModal';
import { resetTour } from '@/utils/tour-storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { logoutAction } from '@/app/[locale]/auth/actions';
import { useToast } from '@/hooks/use-toast';

export function SettingsPage() {
  const t = useTranslations('UserProfile.profile');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const { theme, setTheme } = useTheme();
  const session = useSession();
  const isAuthenticated = !!session.user?.id;
  const { toast } = useToast();

  const { isOpen: isRateModalOpen, openRateModal, closeRateModal, handleRate } = useRateApp();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const deleteAccountMutation = useDeleteMyAccount();

  // Language Change
  const handleLanguageChange = (nextLocale: string) => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  // Sign out
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      session.invalidateSession();
      await logoutAction();
      toast({
        title: locale === 'ar' ? 'تم تسجيل الخروج' : 'Signed out successfully',
      });
    } catch (error: any) {
      if (!error?.message?.includes('NEXT_REDIRECT') && !error?.digest?.includes('NEXT_REDIRECT')) {
        toast({
          title: locale === 'ar' ? 'خطأ' : 'Error',
          description: locale === 'ar' ? 'فشل تسجيل الخروج' : 'Failed to sign out',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
      window.location.href = `/${locale}`;
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      const res = await deleteAccountMutation.mutateAsync(null);
      if (res.success) {
        toast({
          title: locale === 'ar' ? 'تم حذف الحساب' : 'Account deleted',
        });
        await logoutAction();
        router.push('/');
      } else {
        toast({
          title: locale === 'ar' ? 'خطأ' : 'Error',
          description: res.message || (locale === 'ar' ? 'فشل حذف الحساب' : 'Failed to delete account'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل حذف الحساب' : 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const breadcrumbItems = [{ label: locale === 'ar' ? 'الإعدادات' : 'Settings' }];

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <SmartBreadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
            {locale === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
        </div>

        {/* ── Section 1: Appearance ────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {locale === 'ar' ? 'المظهر' : 'Appearance'}
          </h2>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: locale === 'ar' ? 'فاتح' : 'Light', icon: Sun },
                { key: 'dark', label: locale === 'ar' ? 'داكن' : 'Dark', icon: Moon },
                { key: 'system', label: locale === 'ar' ? 'تلقائي' : 'System', icon: Laptop },
              ].map((item) => {
                const isSelected = theme === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTheme(item.key)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all gap-2 ${
                      isSelected
                        ? 'bg-[#198341]/10 dark:bg-[#198341]/20 border-[#198341] text-[#198341] shadow-sm'
                        : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-[#198341]'
                    }`}
                  >
                    <Icon size={20} className={isSelected ? 'text-[#198341]' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Section 2: Language ──────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {locale === 'ar' ? 'اللغة' : 'Language'}
          </h2>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'ar', label: 'العربية (Arabic)' },
                { code: 'en', label: 'English' },
              ].map((lang) => {
                const isSelected = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    disabled={isPending}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#198341]/10 dark:bg-[#198341]/20 border-[#198341] text-[#198341] shadow-sm'
                        : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-[#198341]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Languages size={16} />
                      <span>{lang.label}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-[#198341]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Section 3: About & Discovery ─────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {locale === 'ar' ? 'عن التطبيق والمعلومات' : 'About & Links'}
          </h2>

          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm overflow-hidden">
            {/* Version */}
            <div className="flex items-center justify-between p-4 text-xs">
              <div className="flex items-center gap-3 text-gray-600 dark:text-zinc-300">
                <Info size={18} className="text-gray-400" />
                <span className="font-semibold">{locale === 'ar' ? 'إصدار التطبيق' : 'App Version'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-[11px] font-bold text-gray-500">
                v0.1.0 (Web)
              </span>
            </div>

            {/* Replay Tour */}
            <button
              type="button"
              onClick={() => {
                resetTour('home_tour', '1.0');
                router.push('/');
                toast({
                  title: locale === 'ar' ? 'جولة تعريفية' : 'Guided Tour',
                  description:
                    locale === 'ar'
                      ? 'تمت إعادة تشغيل الجولة التعريفية'
                      : 'Restarting onboarding tour on home page',
                });
              }}
              className="w-full flex items-center justify-between p-4 text-xs text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors text-left rtl:text-right group"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-[#198341]" />
                <span className="font-semibold group-hover:text-[#198341] transition-colors">
                  {locale === 'ar' ? 'إعادة تشغيل الجولة التعريفية' : 'Replay Guided Tour'}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
            </button>

            {/* Rate Bishola */}
            <button
              type="button"
              onClick={() => openRateModal('manual')}
              className="w-full flex items-center justify-between p-4 text-xs text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors text-left rtl:text-right group"
            >
              <div className="flex items-center gap-3">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span className="font-semibold group-hover:text-[#198341] transition-colors">
                  {locale === 'ar' ? 'قيّم بسهولة' : 'Rate Bishola'}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
            </button>

            {/* Statistics */}
            {isAuthenticated && (
              <Link
                href="/statistics"
                className="w-full flex items-center justify-between p-4 text-xs text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-emerald-500" />
                  <span className="font-semibold group-hover:text-[#198341] transition-colors">
                    {locale === 'ar' ? 'إحصائياتي' : 'My Statistics'}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
              </Link>
            )}

            {/* Contact Us */}
            <Link
              href="/ContactUs"
              className="w-full flex items-center justify-between p-4 text-xs text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <PhoneCall size={18} className="text-blue-500" />
                <span className="font-semibold group-hover:text-[#198341] transition-colors">
                  {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
            </Link>

            {/* Privacy Policy */}
            <Link
              href="/legal/privacy-policy"
              className="w-full flex items-center justify-between p-4 text-xs text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-indigo-500" />
                <span className="font-semibold group-hover:text-[#198341] transition-colors">
                  {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
            </Link>

            {/* Download Mobile App */}
            <Link
              href="/Links"
              className="w-full flex items-center justify-between p-4 text-xs text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-[#198341]" />
                <span className="font-semibold group-hover:text-[#198341] transition-colors">
                  {locale === 'ar' ? 'تنزيل تطبيق بسهولة' : 'Download Bishola App'}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* ── Section 4: Account Actions ───────────────────────────────── */}
        {isAuthenticated && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              {locale === 'ar' ? 'إدارة الحساب' : 'Account'}
            </h2>

            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm overflow-hidden">
              {/* Sign Out */}
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="w-full flex items-center justify-between p-4 text-xs text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors group text-left rtl:text-right"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-zinc-300 group-hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                  <span className="font-semibold">{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
              </button>

              {/* Delete Account */}
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full flex items-center justify-between p-4 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left rtl:text-right"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={18} />
                  <span className="font-semibold">{locale === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}</span>
                </div>
                <ChevronRight size={16} className="text-red-400 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rate App Modal */}
      <RateAppModal
        open={isRateModalOpen}
        onClose={closeRateModal}
        onRate={handleRate}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
              {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              {locale === 'ar'
                ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟'
                : 'Are you sure you want to sign out of your account?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl">
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isLoggingOut
                ? locale === 'ar'
                  ? 'جاري الخروج...'
                  : 'Signing out...'
                : locale === 'ar'
                ? 'تسجيل الخروج'
                : 'Sign Out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600">
              {locale === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 leading-relaxed">
              {locale === 'ar'
                ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وإعلاناتك بشكل دائم.'
                : 'This action cannot be undone. All your listings, favorites, and account data will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl">
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {deleteAccountMutation.isPending
                ? locale === 'ar'
                  ? 'جاري الحذف...'
                  : 'Deleting...'
                : locale === 'ar'
                ? 'تأكيد الحذف'
                : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
