import Text from "./text/text"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"
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

  return (
    <div className="space-y-2">
      <Text className="text-sm font-medium text-gray-700 block">{caption}</Text>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">{icon}</div>}
        <Input
          {...register}
          name={name}
          type={type}
          placeholder={placeholder}
          className={cn(
            "w-full h-12 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white",
            icon ? "pl-11" : "pl-4",
            "pr-4 text-gray-900 placeholder:text-gray-400",
            error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "",
            className,
          )}
          value={value}
        />
      </div>
      {error ? (
        <Text className="text-sm text-red-500 mt-1">
          {
            Array.isArray(error) ? error[0] : error // Assuming error is a FieldError
          }
        </Text>
      ) : null}
    </div>
  )
}

export default DetailedInput
