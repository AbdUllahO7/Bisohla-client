"use client"
import DetailedInput from "@/components/detailed-input"
import FormStateMessage from "@/components/form-state-message"
import SubmitButton from "@/components/submit-button"
import { allRoutes } from "@/constants/routes.constant"
import { type ApiResponse, defaultActionState } from "@/interfaces/api-response.interface"
import { handleRegister } from "@/services/auth/auth.service"
import type { RegisterFormValues } from "@/zod-schemas/auth/register-form-schema"
import { Link } from "@/i18n/routing"
import { useActionState } from "react"
import { useLocale, useTranslations } from "next-intl"
import LocaleSwitcher from "@/components/local/LocalSwitcher"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Car, Mail, User, Lock, CheckCircle, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

const RegisterPage = () => {
  const locale = useLocale()
  const isRTL = locale === "ar"
  const t = useTranslations('forgotPassword');

  const [state, action] = useActionState<ApiResponse<RegisterFormValues>, FormData>(handleRegister, defaultActionState)

  return (
    <div className="w-full max-w-md max-h-[85vh] mx-auto">
      <div className="w-full flex flex-col space-y-4">
        {/* Logo and Header - More compact */}
        <div className="text-center">
          <div className="flex items-center justify-center ">
            <div className="p-2 rounded-2xl shadow-lg mb-2">
                  <Image
                    src="/assets/images/logo/bishola.png"
                    alt="Bishola Logo"
                    width={100}
                    height={100}
                    className="relative mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                    priority
                  />
            </div>
          </div>
       
          <p className="text-gray-600 text-sm">
            {isRTL ? "انضم إلى بسهولة واستمتع بخدماتنا المميزة" : "Join Bishola and enjoy our premium services"}
          </p>
        </div>

        {/* Language Switcher - More compact */}
        <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
          <LocaleSwitcher />
        </div>

        {/* Registration Card - More compact */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm w-full">
          <CardHeader className="space-y-1 pb-1">
            <FormStateMessage state={state} />

            {/* Success Message with Email Verification Link */}
            {state.success && state.data && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm">
                      {isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!"}
                    </span>
                    <Link
                      href={allRoutes.auth.children.verifyEmail.path}
                      className="inline-flex items-center text-emerald-700 hover:text-emerald-800 font-medium text-sm transition-colors"
                    >
                      {isRTL ? "إعادة إرسال التأكيد" : "Resend verification"}
                      <ArrowRight className={`h-3 w-3 ${isRTL ? "mr-1 rotate-180" : "ml-1"}`} />
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-2">
            <form action={action} className={`space-y-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
              {/* Email Input */}
              <DetailedInput
                name="email"
                placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email address"}
                type="email"
                error={state.errors?.email}
                caption={isRTL ? "البريد الإلكتروني" : "Email Address"}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              {/* Name Input */}
              <DetailedInput
                name="name"
                placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"}
                type="text"
                error={state.errors?.name}
                caption={isRTL ? "الاسم الكامل" : "Full Name"}
                icon={<User className="h-5 w-5 text-gray-400" />}
              />

              {/* Password Input */}
              <DetailedInput
                name="password"
                placeholder={isRTL ? "أدخل كلمة مرور قوية" : "Create a strong password"}
                type="password"
                error={state.errors?.password}
                caption={isRTL ? "كلمة المرور" : "Password"}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              {/* Password Confirmation Input */}
              <DetailedInput
                name="passwordConfirmation"
                placeholder={isRTL ? "أعد إدخال كلمة المرور" : "Confirm your password"}
                type="password"
                error={state.errors?.passwordConfirmation}
                caption={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              {/* Terms and Privacy Notice - More compact */}
              <div className="text-xs text-gray-500 text-center leading-relaxed px-1">
                {isRTL ? (
                  <>
                    بإنشاء حساب، فإنك توافق على{" "}
                    <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      شروط الخدمة
                    </Link>{" "}
                    و{" "}
                    <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      سياسة الخصوصية
                    </Link>
                  </>
                ) : (
                  <>
                    By creating an account, you agree to our{" "}
                    <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Privacy Policy
                    </Link>
                  </>
                )}
              </div>

              {/* Submit Button - More compact */}
              <div className="pt-1">
                <SubmitButton
                  title={isRTL ? "إنشاء الحساب" : "Create Account"}
                  submittingTitle={isRTL ? "جار الإنشاء..." : "Creating Account..."}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links - More compact */}
        <div className="text-center ">
          <div className="text-sm text-gray-600">
            {isRTL ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link
              href={allRoutes.auth.children.signIn.path}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isRTL ? "تسجيل الدخول الآن" : "Sign in here"}
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
      </div>
    </div>
  )
}

export default RegisterPage