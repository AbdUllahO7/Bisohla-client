'use client'
import React, { useState } from "react";
import Text from "@/components/text/text";
import ImageUploader from "@/components/image-uploader/image-uploader";
import { CarPhotosSectionProps } from "./types";
import { useLocale } from "next-intl";
import { 
  Camera, 
  Sun, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * Car photos section component for uploading different types of car images
 */
const CarPhotosSection: React.FC<CarPhotosSectionProps> = ({
  labels,
  coverImageRef,
  coverImage,
  onCoverImageChange,
  setIsFormDisabled
}) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [showTips, setShowTips] = useState(true);

  const photoTips = {
    en: {
      title: "Photo Guidelines",
      subtitle: "Follow these tips for the best results",
      dos: [
        "Take photos in good natural lighting",
        "Clean your car before photographing",
        "Capture all angles (front, back, sides)",
        "Show the interior clearly",
        "Include close-ups of any damage",
        "Use horizontal orientation"
      ],
      donts: [
        "Avoid blurry or dark images",
        "Don't include people in photos",
        "Avoid cluttered backgrounds",
        "Don't use filters or heavy editing",
        "Avoid nighttime photos with poor lighting"
      ],
      recommended: "Recommended Angles",
      angles: [
        "Front view at 45° angle",
        "Rear view at 45° angle",
        "Driver's side full view",
        "Passenger side full view",
        "Dashboard and interior",
        "Engine bay (if applicable)",
        "Trunk/cargo area",
        "Close-ups of any features or damage"
      ],
      qualityTip: "High-quality photos can increase buyer interest by up to 60%!",
      toggleTips: "Hide Tips",
      showTipsButton: "Show Photo Tips"
    },
    ar: {
      title: "إرشادات التصوير",
      subtitle: "اتبع هذه النصائح للحصول على أفضل النتائج",
      dos: [
        "التقط الصور في إضاءة طبيعية جيدة",
        "نظف سيارتك قبل التصوير",
        "صور من جميع الزوايا (أمامية، خلفية، جوانب)",
        "أظهر الداخلية بوضوح",
        "قم بتضمين لقطات قريبة لأي تلف",
        "استخدم الوضع الأفقي للكاميرا"
      ],
      donts: [
        "تجنب الصور الضبابية أو الداكنة",
        "لا تُدخل أشخاصاً في الصور",
        "تجنب الخلفيات المزدحمة",
        "لا تستخدم الفلاتر أو التعديل الثقيل",
        "تجنب التصوير الليلي بإضاءة سيئة"
      ],
      recommended: "الزوايا الموصى بها",
      angles: [
        "المنظر الأمامي بزاوية 45 درجة",
        "المنظر الخلفي بزاوية 45 درجة",
        "منظر كامل من جانب السائق",
        "منظر كامل من جانب الراكب",
        "لوحة القيادة والداخلية",
        "حجرة المحرك (إن أمكن)",
        "صندوق الأمتعة",
        "لقطات قريبة لأي مميزات أو أضرار"
      ],
      qualityTip: "الصور عالية الجودة يمكن أن تزيد اهتمام المشترين بنسبة تصل إلى 60٪!",
      toggleTips: "إخفاء النصائح",
      showTipsButton: "عرض نصائح التصوير"
    }
  };

  const tips = photoTips[locale as keyof typeof photoTips] || photoTips.en;

  return (
    <div className="gap-6 p-4">
      {/* Photo Tips Section */}
      <Card className="mb-6 border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-4">
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className={cn(
              "w-full flex items-center justify-between text-left mb-2",
              isRTL && "flex-row-reverse text-right"
            )}
          >
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Camera className="h-5 w-5 text-emerald-600" />
              <Text className="text-lg font-bold text-emerald-700">
                {tips.title}
              </Text>
            </div>
            {showTips ? (
              <ChevronUp className="h-5 w-5 text-emerald-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-emerald-600" />
            )}
          </button>

          {showTips && (
            <div className="space-y-4 mt-4">
              <Text className={cn(
                "text-sm text-gray-600",
                isRTL && "text-right"
              )}>
                {tips.subtitle}
              </Text>

              {/* Quality Alert */}
              <Alert className="border-amber-200 bg-amber-50">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <AlertDescription className={cn(
                  "text-amber-800 text-sm font-medium",
                  isRTL && "text-right"
                )}>
                  {tips.qualityTip}
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Do's Section */}
                <div className="space-y-2">
                  <div className={cn(
                    "flex items-center gap-2 mb-3",
                    isRTL && "flex-row-reverse"
                  )}>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <Text className="font-semibold text-green-700">
                      {isRTL ? "ينصح بـ" : "Do's"}
                    </Text>
                  </div>
                  <ul className="space-y-2">
                    {tips.dos.map((tip, index) => (
                      <li 
                        key={index}
                        className={cn(
                          "flex items-start gap-2 text-sm text-gray-700",
                          isRTL && "flex-row-reverse text-right"
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts Section */}
                <div className="space-y-2">
                  <div className={cn(
                    "flex items-center gap-2 mb-3",
                    isRTL && "flex-row-reverse"
                  )}>
                    <X className="h-5 w-5 text-red-600" />
                    <Text className="font-semibold text-red-700">
                      {isRTL ? "تجنب" : "Don'ts"}
                    </Text>
                  </div>
                  <ul className="space-y-2">
                    {tips.donts.map((tip, index) => (
                      <li 
                        key={index}
                        className={cn(
                          "flex items-start gap-2 text-sm text-gray-700",
                          isRTL && "flex-row-reverse text-right"
                        )}
                      >
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Angles */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className={cn(
                  "flex items-center gap-2 mb-3",
                  isRTL && "flex-row-reverse"
                )}>
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <Text className="font-semibold text-blue-700">
                    {tips.recommended}
                  </Text>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {tips.angles.map((angle, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-sm text-gray-700",
                        isRTL && "flex-row-reverse text-right"
                      )}
                    >
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <span>{angle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Image Section */}
      <div>
        <div className={cn(
          "flex items-center gap-2 mb-2",
          isRTL && "flex-row-reverse"
        )}>
          <Text className="text-lg font-semibold text-primary">
            {labels.coverImage} <span className="text-red-500">*</span>
          </Text>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <Text className={cn(
          "text-sm text-gray-500 mb-3",
          isRTL && "text-right"
        )}>
          {labels.oneImage}
        </Text>
        
        {/* Quick Tips Below Uploader */}
        <Alert className="mb-3 border-blue-100 bg-blue-50">
          <Sun className="h-4 w-4 text-blue-600" />
          <AlertDescription className={cn(
            "text-blue-800 text-sm",
            isRTL && "text-right"
          )}>
            {isRTL 
              ? "💡 نصيحة: التقط الصور في وضح النهار للحصول على أفضل النتائج"
              : "💡 Tip: Take photos in daylight for best results"
            }
          </AlertDescription>
        </Alert>

        <ImageUploader
          ref={coverImageRef}
          maxImages={20}
          onChange={onCoverImageChange}
          setDisableForm={setIsFormDisabled}
          value={coverImage}
          dropzoneClassName="min-h-[200px]"
          name="coverImage"
        />
      </div>
    </div>
  );
};

export default React.memo(CarPhotosSection);