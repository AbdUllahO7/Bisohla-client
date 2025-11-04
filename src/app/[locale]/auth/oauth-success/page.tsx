"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import Image from "next/image"
import { allRoutes } from "@/constants/routes.constant"
import { useQueryClient } from "@tanstack/react-query"
import { triggerAuthStateChange } from "@/lib/utils/auth-utils"
import { oauthCallbackAction } from "../actions"

const OAuthSuccessPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const isRTL = locale === "ar"
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get all user data + tokens from URL params (sent by backend OAuth callback)
        const id = searchParams.get("id")
        const name = searchParams.get("name")
        const roles = searchParams.get("roles")
        const permissions = searchParams.get("permissions")
        const accessToken = searchParams.get("accessToken")
        const refreshToken = searchParams.get("refreshToken")

        if (!id || !name || !roles || !permissions || !accessToken || !refreshToken) {
          setStatus("error")
          setMessage(
            isRTL
              ? "فشل في الحصول على بيانات المصادقة"
              : "Failed to get authentication data"
          )
          return
        }

        // Call server action to create session with complete user data (same as normal login)
        const result = await oauthCallbackAction({
          id,
          name,
          roles,
          permissions,
          accessToken,
          refreshToken,
        })

        if (!result.success) {
          setStatus("error")
          setMessage(result.message || (isRTL ? "حدث خطأ" : "An error occurred"))
          return
        }

        setStatus("success")
        setMessage(
          isRTL
            ? "تم تسجيل الدخول بنجاح! جاري التحويل..."
            : "Successfully logged in! Redirecting..."
        )

        // Invalidate auth-related queries (same as normal login)
        queryClient.invalidateQueries({ queryKey: ['session'] })
        queryClient.invalidateQueries({ queryKey: ['check-auth-user'] })

        // Trigger custom events for UI updates
        triggerAuthStateChange()

        // Redirect to user home page after 1.5 seconds
        setTimeout(() => {
          router.push(allRoutes.user.children.homePage.path)
        }, 1500)
      } catch (error) {
        console.error("OAuth callback error:", error)
        setStatus("error")
        setMessage(
          isRTL
            ? "حدث خطأ أثناء معالجة تسجيل الدخول"
            : "An error occurred while processing login"
        )
      }
    }

    handleOAuthCallback()
  }, [searchParams, router, isRTL, queryClient])

  return (
    <div className="w-full max-w-md mx-auto min-h-[60vh] flex items-center">
      <div className="w-full flex flex-col space-y-4">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center">
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
        </div>

        {/* Status Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Status Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {status === "loading" && (
                  <>
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-blue-100 rounded-full p-4">
                      <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                    </div>
                  </>
                )}
                {status === "success" && (
                  <>
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-emerald-100 rounded-full p-4">
                      <CheckCircle className="h-16 w-16 text-emerald-600" />
                    </div>
                  </>
                )}
                {status === "error" && (
                  <>
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-red-100 rounded-full p-4">
                      <XCircle className="h-16 w-16 text-red-600" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "loading" && (isRTL ? "جاري المعالجة..." : "Processing...")}
              {status === "success" && (isRTL ? "نجح!" : "Success!")}
              {status === "error" && (isRTL ? "خطأ" : "Error")}
            </h2>

            {/* Message */}
            <p className="text-gray-600 leading-relaxed">{message}</p>

            {/* Error Action */}
            {status === "error" && (
              <div className="mt-6">
                <button
                  onClick={() => router.push(allRoutes.auth.children.signIn.path)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  {isRTL ? "العودة إلى تسجيل الدخول" : "Back to Sign In"}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OAuthSuccessPage
