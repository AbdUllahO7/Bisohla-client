import Text from "./text/text"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"
import type { ReactNode } from "react"

interface DetailedInputProps {
  type: string
  placeholder: string
  name: string
  register?: Record<string, unknown>
  error: unknown
  caption: string
  className?: string
  value?: string | number | undefined
  icon?: ReactNode
}

const DetailedInput = (props: DetailedInputProps) => {
  const { type, placeholder, error, register, className, caption, name, value, icon } = props
  const locale = useLocale()
  const isRTL = locale === "ar"

  // Translation mapping for validation error messages
  const getLocalizedError = (errorMessage: string): string => {
    const translations: Record<string, Record<string, string>> = {
      // Email validation messages
      'email cannot be empty': {
        en: 'Email cannot be empty',
        ar: 'البريد الإلكتروني لا يمكن أن يكون فارغاً',
      },
      'email is required': {
        en: 'Email is required',
        ar: 'البريد الإلكتروني مطلوب',
      },
      'Invalid email format': {
        en: 'Invalid email format',
        ar: 'تنسيق البريد الإلكتروني غير صحيح',
      },
      'Email must be a valid email address': {
        en: 'Email must be a valid email address',
        ar: 'يجب أن يكون البريد الإلكتروني صحيحاً',
      },
      
      // Password validation messages
      'password cannot be empty': {
        en: 'Password cannot be empty',
        ar: 'كلمة المرور لا يمكن أن تكون فارغة',
      },
      'password is required': {
        en: 'Password is required',
        ar: 'كلمة المرور مطلوبة',
      },
      'Password is too short': {
        en: 'Password is too short',
        ar: 'كلمة المرور قصيرة جداً',
      },
      'Password must be at least 8 characters': {
        en: 'Password must be at least 8 characters',
        ar: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      },
      
      // Name validation messages
      'name cannot be empty': {
        en: 'Name cannot be empty',
        ar: 'الاسم لا يمكن أن يكون فارغاً',
      },
      'name is required': {
        en: 'Name is required',
        ar: 'الاسم مطلوب',
      },
      'first name is required': {
        en: 'First name is required',
        ar: 'الاسم الأول مطلوب',
      },
      'last name is required': {
        en: 'Last name is required',
        ar: 'الاسم الأخير مطلوب',
      },
      
      // Phone validation messages
      'phone cannot be empty': {
        en: 'Phone cannot be empty',
        ar: 'رقم الهاتف لا يمكن أن يكون فارغاً',
      },
      'phone is required': {
        en: 'Phone is required',
        ar: 'رقم الهاتف مطلوب',
      },
      'Invalid phone number': {
        en: 'Invalid phone number',
        ar: 'رقم الهاتف غير صحيح',
      },
      
      // General validation messages
      'This field is required': {
        en: 'This field is required',
        ar: 'هذا الحقل مطلوب',
      },
      'Invalid input': {
        en: 'Invalid input',
        ar: 'مدخل غير صحيح',
      },
    }

    // Case-insensitive matching
    const errorKey = Object.keys(translations).find(
      key => key.toLowerCase() === errorMessage.toLowerCase()
    )
    
    return errorKey && translations[errorKey][locale] 
      ? translations[errorKey][locale] 
      : errorMessage
  }

  // Process error message (handle both string and array)
  const getErrorMessage = (error: unknown): string | null => {
    if (!error) return null
    
    if (Array.isArray(error)) {
      const firstError = error[0]
      return typeof firstError === 'string' ? getLocalizedError(firstError) : String(firstError)
    }
    
    return typeof error === 'string' ? getLocalizedError(error) : String(error)
  }

  const errorMessage = getErrorMessage(error)

  return (
    <div className="space-y-2">
      <Text 
        className={cn(
          "text-sm font-medium text-gray-700 block",
          isRTL ? "text-right" : "text-left"
        )}
      >
        {caption}
      </Text>
      <div className="relative">
        {icon && (
          <div className={cn(
            "absolute top-1/2 transform -translate-y-1/2 z-10",
            isRTL ? "right-3" : "left-3"
          )}>
            {icon}
          </div>
        )}
        <Input
          {...register}
          name={name}
          type={type}
          placeholder={placeholder}
          className={cn(
            "w-full h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white",
            icon ? (isRTL ? "pr-11 pl-4" : "pl-11 pr-4") : "px-4",
            "text-gray-900 placeholder:text-gray-400",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "",
            isRTL ? "text-right" : "text-left",
            className,
          )}
          value={value}
          dir={isRTL ? "rtl" : "ltr"}
        />
      </div>
      {errorMessage && (
        <Text 
          className={cn(
            "text-sm text-red-500 mt-1",
            isRTL ? "text-right" : "text-left"
          )}
        >
          {errorMessage}
        </Text>
      )}
    </div>
  )
}

export default DetailedInput