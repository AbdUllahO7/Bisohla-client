// src/components/product/utils/getLocalizedText.ts
export const getLocalizedText = (direction: string) => {
    const isArabic = direction === 'rtl'
    
    return {
      requiredFieldsMessage: isArabic 
        ? "يرجى تحديد جميع الحقول المطلوبة قبل المتابعة" 
        : "Please select all required fields before proceeding",
      
      nextButton: isArabic ? 'التالي' : 'Next',
      backButton: isArabic ? 'الرجوع' : 'Back',
      submitButton: isArabic ? 'إرسال' : 'Submit',
      
      successDialog: {
        title: isArabic ? "تم النشر بنجاح!" : "Listing Published Successfully!",
        description: isArabic 
          ? "تم نشر سيارتك بنجاح. يمكنك الآن الذهاب إلى الصفحة الرئيسية أو الذهاب إلى صفحة ملفك الشخصي لمشاهدة إعلانك." 
          : "Your car has been successfully listed. You can now go to the home page or go to your profile page to view your listing.",
        homeButtonText: isArabic ? "الصفحة الرئيسية" : "Home Page",
        profileButtonText: isArabic ? "صفحة الملف الشخصي" : "Profile Page"
      },
      
      errorDialog: {
        title: isArabic ? "حدث خطأ!" : "Error Occurred!",
        description: isArabic 
          ? "حدث خطأ أثناء نشر إعلان سيارتك. يرجى التحقق من التفاصيل أدناه ومحاولة مرة أخرى." 
          : "An error occurred while publishing your car listing. Please check the details below and try again.",
        tryAgainText: isArabic ? "حاول مرة أخرى" : "Try Again"
      }
    }
  }