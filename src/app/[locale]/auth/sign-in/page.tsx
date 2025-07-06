"use client"
import DetailedInput from "@/components/detailed-input"
import FormStateMessage from "@/components/form-state-message"
import SubmitButton from "@/components/submit-button"
import { allRoutes } from "@/constants/routes.constant"
import { type ApiResponse, defaultActionState } from "@/interfaces/api-response.interface"
import { Link } from "@/i18n/routing"
import { useActionState } from "react"
import { signInAction } from "../actions"
import { useLocale, useTranslations } from "next-intl"
import LocaleSwitcher from "@/components/local/LocalSwitcher"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Car, Mail, Lock, ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { triggerAuthStateChange } from "@/lib/utils/auth-utils"
import Image from "next/image"

const SignInPage = () => {
  const locale = useLocale()
  const isRTL = locale === "ar"
  const queryClient = useQueryClient()
  const t = useTranslations('forgotPassword');

  const [state, action] = useActionState<ApiResponse<LoginResponse>, FormData>(signInAction, defaultActionState)

  // Trigger auth state change when login is successful
  useEffect(() => {
    if (state.success) {
      // Invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.invalidateQueries({ queryKey: ['check-auth-user'] })
      
      // Trigger custom events for UI updates
      triggerAuthStateChange()
    }
  }, [state.success, queryClient])

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="w-full flex flex-col space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className=" p-3 rounded-2xl shadow-lg">
                <Image
                  src="/assets/images/logo/bishola.png"
                  alt="Bishola Logo"
                  width={120}
                  height={120}
                  className="relative mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                  priority
                />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isRTL ? "مرحباً بعودتك" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {isRTL ? "سجل دخولك للوصول إلى حسابك" : "Sign in to access your account"}
          </p>
        </div>

        {/* Language Switcher */}
        <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
          <LocaleSwitcher />
        </div>

        {/* Sign In Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm w-full">
          <CardHeader className="space-y-1 pb-4">
            <FormStateMessage state={state} />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form action={action} className={`space-y-5 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
              {/* Email Input */}
              <DetailedInput
                placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email address"}
                type="email"
                name="email"
                error={state?.errors?.email}
                caption={isRTL ? "البريد الإلكتروني" : "Email Address"}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              {/* Password Input */}
              <DetailedInput
                placeholder={isRTL ? "أدخل كلمة المرور" : "Enter your password"}
                type="password"
                name="password"
                error={state?.errors?.password}
                caption={isRTL ? "كلمة المرور" : "Password"}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <SubmitButton
                  title={isRTL ? "تسجيل الدخول" : "Sign In"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="space-y-3 text-center">
          <div className="text-sm text-gray-600">
            {isRTL ? "جديد في Bishola؟" : "New to Bishola?"}{" "}
            <Link
              href={allRoutes.auth.children.register.path}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isRTL ? "سجل الآن" : "Create Account"}
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            <Link
              href={allRoutes.auth.children.sendResetPasswordEmail.path}
              className="font-medium text-gray-700 hover:text-emerald-600 transition-colors"
            >
              {isRTL ? "هل نسيت كلمة المرور؟" : "Forgot your password?"}
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            <Link
              href="/"
              className="font-medium text-gray-700 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
            >
              {t('footer.backToHome')}
              <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
          
      </div>
    </div>
  )
}

export default SignInPage