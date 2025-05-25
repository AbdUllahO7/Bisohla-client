"use client"
import DetailedInput from "@/components/detailed-input"
import FormStateMessage from "@/components/form-state-message"
import SubmitButton from "@/components/submit-button"
import { allRoutes } from "@/constants/routes.constant"
import { type ApiResponse, defaultActionState } from "@/interfaces/api-response.interface"
import { Link } from "@/i18n/routing"
import { useActionState } from "react"
import { signInAction } from "../actions"
import { useLocale } from "next-intl"
import LocaleSwitcher from "@/components/local/LocalSwitcher"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Car, Mail, Lock } from "lucide-react"

const SignInPage = () => {
  const locale = useLocale()
  const isRTL = locale === "ar"

  const [state, action] = useActionState<ApiResponse<LoginResponse>, FormData>(signInAction, defaultActionState)

  return (
    <div className="min-h-screen h-full md:w-[500px]  lg:w-[500px] items-center justify-center ">
      <div className="w-full min-h-screen flex  flex-col justify-center items-center">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-emerald-600 p-3 rounded-2xl">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isRTL ? "مرحباً بعودتك" : "Welcome Back"}</h1>
          <p className="text-gray-600">{isRTL ? "سجل دخولك للوصول إلى حسابك" : "Sign in to access your account"}</p>
        </div>

        {/* Language Switcher */}
        <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="xs:hidden lg:block md:block">
            <LocaleSwitcher />
          </div>
        </div>

        {/* Sign In Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm w-full">
          <CardHeader className="space-y-1 pb-4">
            <FormStateMessage state={state} />
          </CardHeader>
          <CardContent>
            <form action={action} className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
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
        <div className="mt-8 space-y-4 text-center">
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
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{isRTL ? "آمن ومحمي" : "Secure & Protected"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{isRTL ? "دعم 24/7" : "24/7 Support"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage
