"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Link } from "@/i18n/routing"
import { Sparkles, LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface SectionHeaderProps {
  title: string
  icon: LucideIcon
  showMoreLink?: string
  showMoreText?: string
  subtitle?: string
}

const SectionHeader = ({ 
  title, 
  icon: Icon, 
  showMoreLink, 
  showMoreText,
  subtitle 
}: SectionHeaderProps) => {
  return (
    <Box variant="column" className="mb-10">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {/* Icon Badge */}
        <div className="p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-6"
             style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Title Section */}
        <div className="flex-1 min-w-[200px]">
          <Text variant="h3" className="font-bold text-[28px] font-cairo"
                style={{ color: '#2C3C39' }}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="p" className="text-[14px] font-cairo mt-1 text-gray-600">
              {subtitle}
            </Text>
          )}
        </div>

        {/* Show More Link (Optional) */}
        {showMoreLink && showMoreText && (
          <Link href={showMoreLink}>
            <div className="group relative px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg"
                 style={{ background: 'linear-gradient(135deg, rgba(25, 131, 65, 0.1) 0%, rgba(171, 222, 59, 0.1) 100%)' }}>
              <Text variant="mid" 
                    className="text-[16px] font-cairo font-semibold flex items-center gap-2 transition-colors duration-300"
                    style={{ color: '#198341' }}>
                {showMoreText}
                <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              </Text>
              
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ 
                     background: 'linear-gradient(135deg, #198341 0%, #ABDE3B 100%)',
                     padding: '2px',
                     WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                     WebkitMaskComposite: 'xor',
                     maskComposite: 'exclude'
                   }}>
              </div>
            </div>
          </Link>
        )}
      </div>
      
      {/* Decorative Line */}
      <div className="relative h-1 w-24 rounded-full mt-2 overflow-hidden"
           style={{ background: 'linear-gradient(90deg, #198341 0%, #ABDE3B 100%)' }}>
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 animate-shimmer"
             style={{
               background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
               transform: 'translateX(-100%)'
             }}>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </Box>
  )
}

export default SectionHeader