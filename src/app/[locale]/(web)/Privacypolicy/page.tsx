"use client"

import Link from "next/link"
import { ChevronRight, Shield, Eye, Users, Lock, Bell, FileText, HelpCircle, Sparkles, ArrowRight } from 'lucide-react'
import { useLocale } from "next-intl"
import Image from "next/image"

// Dictionary for translations
const translations = {
  en: {
    meta: {
      title: "Privacy Policy | Car Rental & Sales",
      description: "Our commitment to protecting your privacy and personal information.",
    },
    hero: {
      title: "Privacy Policy",
      subtitle: "Our commitment to protecting your data and privacy",
      lastUpdated: "Last updated: May 19, 2025",
    },
    sections: {
      introduction: {
        title: "Introduction",
        content: [
          "Welcome to our Privacy Policy. This document explains how we collect, use, and protect your personal information when you use our car rental and sales services, both online and offline.",
          "At Bishola, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy applies to our website, mobile applications, and all services we offer.",
        ],
      },
      informationCollect: {
        title: "Information We Collect",
        intro: "We collect the following types of information:",
        items: [
          {
            title: "Personal Information",
            description: "Name, email address, phone number, postal address, driver's license information, date of birth, and payment information.",
          },
          {
            title: "Vehicle Preferences",
            description: "Information about your vehicle preferences, rental history, and purchase interests.",
          },
          {
            title: "Usage Data",
            description: "Information about how you use our website and services, including browsing patterns, clicked links, and interactions with our platform.",
          },
          {
            title: "Device Information",
            description: "Information about the device you use to access our services, including IP address, browser type, operating system, and device identifiers.",
          },
          {
            title: "Location Data",
            description: "With your consent, we may collect precise location data to provide location-based services.",
          },
        ],
      },
      informationUse: {
        title: "How We Use Your Information",
        intro: "We use your information for the following purposes:",
        items: [
          "To process and manage your car rentals and purchases",
          "To verify your identity and eligibility",
          "To process payments and manage billing",
          "To communicate about your reservations",
          "To provide customer support",
          "To send promotional offers (with consent)",
          "To improve our services",
          "To ensure security and prevent fraud",
          "To comply with legal obligations",
        ],
      },
      informationSharing: {
        title: "Information Sharing",
        intro: "We may share your information with:",
        items: [
          {
            title: "Service Providers",
            description: "Third-party companies that help us operate our business and provide services to you.",
          },
          {
            title: "Business Partners",
            description: "Car manufacturers, insurance providers, and other partners with whom we collaborate to provide services.",
          },
          {
            title: "Legal Authorities",
            description: "When required by law, court order, or governmental regulation.",
          },
          {
            title: "Corporate Transactions",
            description: "In connection with a merger, acquisition, or sale of assets.",
          },
        ],
        footer: "We do not sell your personal information to third parties for their marketing purposes without your explicit consent.",
      },
      cookies: {
        title: "Cookies",
        content: [
          "We use cookies and similar tracking technologies to collect information about your browsing activities. These technologies help us analyze website traffic, customize content, and provide a better user experience.",
          "You can manage your cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our website.",
        ],
      },
      dataSecurity: {
        title: "Data Security",
        content: [
          "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.",
        ],
      },
      rights: {
        title: "Your Rights and Choices",
        intro: "Depending on your location, you may have the following rights:",
        items: [
          "Access and receive a copy of your personal information",
          "Correct inaccurate or incomplete information",
          "Request deletion of your personal information",
          "Object to or restrict certain processing activities",
          "Withdraw consent at any time",
          "Data portability",
        ],
        footer: "To exercise these rights, please contact us using the information provided in the \"Contact Us\" section below.",
      },
      additional: {
        title: "Additional Information",
        children: {
          title: "Children's Privacy",
          content: "Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.",
        },
        changes: {
          title: "Changes to This Privacy Policy",
          content: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the \"Last updated\" date.",
        },
      },
      contact: {
        title: "Contact Us",
        intro: "If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:",
        company: "Bishola",
        email: "Email: bishola4h@gmail.com",
        phone: "Phone: 009053489370863",
        address: "Address: Turkiye Istanbul",
      },
      backToHome: "Back to Home",
    },
  },
  ar: {
    meta: {
      title: "سياسة الخصوصية | تأجير وبيع السيارات",
      description: "التزامنا بحماية خصوصيتك ومعلوماتك الشخصية.",
    },
    hero: {
      title: "سياسة الخصوصية",
      subtitle: "التزامنا بحماية بياناتك وخصوصيتك",
      lastUpdated: "آخر تحديث: 19 مايو 2025",
    },
    sections: {
      introduction: {
        title: "مقدمة",
        content: [
          "مرحبًا بك في سياسة الخصوصية الخاصة بنا. يشرح هذا المستند كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام خدمات تأجير وبيع السيارات لدينا، سواء عبر الإنترنت أو بشكل مباشر.",
          "في بسهولة، نحن ملتزمون بحماية خصوصيتك وضمان أمن معلوماتك الشخصية. تنطبق سياسة الخصوصية هذه على موقعنا الإلكتروني وتطبيقات الهاتف المحمول وجميع الخدمات التي نقدمها.",
        ],
      },
      informationCollect: {
        title: "المعلومات التي نجمعها",
        intro: "نحن نجمع الأنواع التالية من المعلومات:",
        items: [
          {
            title: "المعلومات الشخصية",
            description: "الاسم، عنوان البريد الإلكتروني، رقم الهاتف، العنوان البريدي، معلومات رخصة القيادة، تاريخ الميلاد، ومعلومات الدفع.",
          },
          {
            title: "تفضيلات المركبات",
            description: "معلومات حول تفضيلاتك للمركبات، تاريخ الإيجار، واهتمامات الشراء.",
          },
          {
            title: "بيانات الاستخدام",
            description: "معلومات حول كيفية استخدامك لموقعنا وخدماتنا، بما في ذلك أنماط التصفح، والروابط التي تم النقر عليها، والتفاعلات مع منصتنا.",
          },
          {
            title: "معلومات الجهاز",
            description: "معلومات حول الجهاز الذي تستخدمه للوصول إلى خدماتنا، بما في ذلك عنوان IP، ونوع المتصفح، ونظام التشغيل، ومعرفات الجهاز.",
          },
          {
            title: "بيانات الموقع",
            description: "بموافقتك، قد نجمع بيانات موقع دقيقة لتقديم خدمات تعتمد على الموقع.",
          },
        ],
      },
      informationUse: {
        title: "كيف نستخدم معلوماتك",
        intro: "نستخدم معلوماتك للأغراض التالية:",
        items: [
          "لمعالجة وإدارة عمليات تأجير وشراء السيارات",
          "للتحقق من هويتك وأهليتك",
          "لمعالجة المدفوعات وإدارة الفواتير",
          "للتواصل بشأن حجوزاتك",
          "لتقديم دعم العملاء",
          "لإرسال عروض ترويجية (بموافقتك)",
          "لتحسين خدماتنا",
          "لضمان الأمن ومنع الاحتيال",
          "للامتثال للالتزامات القانونية",
        ],
      },
      informationSharing: {
        title: "مشاركة المعلومات",
        intro: "قد نشارك معلوماتك مع:",
        items: [
          {
            title: "مزودي الخدمة",
            description: "شركات خارجية تساعدنا في تشغيل أعمالنا وتقديم الخدمات لك.",
          },
          {
            title: "شركاء الأعمال",
            description: "مصنعي السيارات، ومزودي التأمين، وشركاء آخرين نتعاون معهم لتقديم الخدمات.",
          },
          {
            title: "السلطات القانونية",
            description: "عندما يكون ذلك مطلوبًا بموجب القانون أو أمر المحكمة أو اللوائح الحكومية.",
          },
          {
            title: "المعاملات التجارية",
            description: "فيما يتعلق بالاندماج أو الاستحواذ أو بيع الأصول.",
          },
        ],
        footer: "نحن لا نبيع معلوماتك الشخصية لأطراف ثالثة لأغراض التسويق الخاصة بهم دون موافقتك الصريحة.",
      },
      cookies: {
        title: "ملفات تعريف الارتباط",
        content: [
          "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لجمع معلومات حول أنشطة التصفح الخاصة بك. تساعدنا هذه التقنيات في تحليل حركة مرور الموقع، وتخصيص المحتوى، وتوفير تجربة مستخدم أفضل.",
          "يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك. ومع ذلك، قد يؤدي تعطيل بعض ملفات تعريف الارتباط إلى الحد من قدرتك على استخدام بعض ميزات موقعنا.",
        ],
      },
      dataSecurity: {
        title: "أمن البيانات",
        content: [
          "نقوم بتنفيذ تدابير تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية ضد الوصول غير المصرح به، أو التغيير، أو الكشف، أو التدمير. ومع ذلك، لا توجد طريقة آمنة بنسبة 100٪ للإرسال عبر الإنترنت أو التخزين الإلكتروني، لذلك لا يمكننا ضمان الأمان المطلق.",
        ],
      },
      rights: {
        title: "حقوقك وخياراتك",
        intro: "اعتمادًا على موقعك، قد تتمتع بالحقوق التالية:",
        items: [
          "الوصول إلى نسخة من معلوماتك الشخصية والحصول عليها",
          "تصحيح المعلومات غير الدقيقة أو غير المكتملة",
          "طلب حذف معلوماتك الشخصية",
          "الاعتراض على أنشطة المعالجة المعينة أو تقييدها",
          "سحب الموافقة في أي وقت",
          "قابلية نقل البيانات",
        ],
        footer: "لممارسة هذه الحقوق، يرجى الاتصال بنا باستخدام المعلومات المقدمة في قسم \"اتصل بنا\" أدناه.",
      },
      additional: {
        title: "معلومات إضافية",
        children: {
          title: "خصوصية الأطفال",
          content: "خدماتنا غير موجهة للأفراد دون سن 18 عامًا. نحن لا نجمع عن علم معلومات شخصية من الأطفال. إذا كنت تعتقد أننا قد جمعنا معلومات من طفل، فيرجى الاتصال بنا على الفور.",
        },
        changes: {
          title: "التغييرات في سياسة الخصوصية هذه",
          content: "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات في ممارساتنا أو المتطلبات القانونية. سنخطرك بأي تغييرات جوهرية من خلال نشر السياسة المحدثة على موقعنا وتحديث تاريخ \"آخر تحديث\".",
        },
      },
      contact: {
        title: "اتصل بنا",
        intro: "إذا كانت لديك أي أسئلة أو مخاوف أو طلبات بخصوص سياسة الخصوصية هذه أو ممارسات الخصوصية لدينا، فيرجى الاتصال بنا على:",
        company: "بسهولة",
        email: "البريد الإلكتروني: bishola4h@gmail.com",
        phone: "الهاتف: 009053489370863",
      },
      backToHome: "العودة إلى الصفحة الرئيسية",
    },
  },
}

export default function PrivacyPolicyPage() {
  const locale = useLocale() || "en"
  const isArabic = locale === "ar"
  const t = translations[isArabic ? "ar" : "en"]

  return (
    <div className={`w-full ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-5 animate-pulse" 
             style={{ backgroundColor: '#ABDE3B' }}></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full opacity-5 animate-pulse" 
             style={{ backgroundColor: '#198341', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full opacity-5 animate-pulse" 
             style={{ backgroundColor: '#ABDE3B', animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, #2C3C39 0%, #198341 100%)' }}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" 
             style={{ backgroundColor: '#ABDE3B', transform: 'translate(30%, -30%)' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" 
             style={{ backgroundColor: '#ABDE3B', transform: 'translate(-30%, 30%)' }}></div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 animate-fadeIn">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
                   style={{ backgroundColor: 'rgba(171, 222, 59, 0.2)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#ABDE3B' }} />
                <span className="text-sm font-medium" style={{ color: '#ABDE3B' }}>Your Privacy Matters</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {t.hero.title}
              </h1>
              <p className="text-xl text-white/90">
                {t.hero.subtitle}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-1 w-12 rounded-full" style={{ backgroundColor: '#ABDE3B' }}></div>
                <span className="text-white/80">{t.hero.lastUpdated}</span>
              </div>
            </div>

            <div className="relative animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 rounded-3xl opacity-20 blur-3xl"
                   style={{ backgroundColor: '#ABDE3B' }}></div>
              <Image
                src="/assets/images/3-car.png"
                alt="logo"
                width={500}
                height={500}
                className="relative transition-all duration-700 hover:scale-105 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container max-w-6xl mx-auto px-4 md:px-6 space-y-8">
          
          {/* Introduction */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                  <Shield size={32} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#2C3C39' }}>
                  {t.sections.introduction.title}
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                {t.sections.introduction.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                  <Eye size={32} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#2C3C39' }}>
                  {t.sections.informationCollect.title}
                </h2>
              </div>
              <p className="text-gray-700 text-lg mb-6">{t.sections.informationCollect.intro}</p>
              <div className="grid gap-4">
                {t.sections.informationCollect.items.map((item, index) => (
                  <div key={index} 
                       className="group/item relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-transparent hover:border-opacity-50 transition-all duration-300 hover:shadow-lg"
                       style={{ borderColor: '#ABDE3B' }}>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 rounded-r-full transition-all duration-300 group-hover/item:h-16"
                         style={{ backgroundColor: '#ABDE3B' }}></div>
                    <h3 className="font-bold text-lg mb-2 ml-6" style={{ color: '#198341' }}>
                      {item.title}
                    </h3>
                    <p className="text-gray-700 ml-6">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                  <FileText size={32} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#2C3C39' }}>
                  {t.sections.informationUse.title}
                </h2>
              </div>
              <p className="text-gray-700 text-lg mb-6">{t.sections.informationUse.intro}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {t.sections.informationUse.items.map((item, index) => (
                  <div key={index} 
                       className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all duration-300 group/item">
                    <div className="flex-shrink-0 mt-1">
                      <ChevronRight size={20} className="transition-transform duration-300 group-hover/item:translate-x-1" 
                                    style={{ color: '#ABDE3B' }} />
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                  <Users size={32} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#2C3C39' }}>
                  {t.sections.informationSharing.title}
                </h2>
              </div>
              <p className="text-gray-700 text-lg mb-6">{t.sections.informationSharing.intro}</p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {t.sections.informationSharing.items.map((item, index) => (
                  <div key={index} 
                       className="relative group/card bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-opacity-30"
                       style={{ borderColor: '#198341' }}>
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 group-hover/card:opacity-10 transition-opacity"
                         style={{ backgroundColor: '#ABDE3B', transform: 'translate(30%, -30%)' }}></div>
                    <h3 className="font-bold text-xl mb-3" style={{ color: '#198341' }}>
                      {item.title}
                    </h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl border-2 border-dashed" style={{ borderColor: '#ABDE3B', backgroundColor: 'rgba(171, 222, 59, 0.05)' }}>
                <p className="text-gray-700 text-center font-medium">{t.sections.informationSharing.footer}</p>
              </div>
            </div>
          </div>

          {/* Cookies & Data Security - Side by Side */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group animate-fadeIn" style={{ animationDelay: '0.5s' }}>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
              <div className="relative h-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                    <Bell size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: '#2C3C39' }}>
                    {t.sections.cookies.title}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  {t.sections.cookies.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="group animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
              <div className="relative h-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                    <Lock size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: '#2C3C39' }}>
                    {t.sections.dataSecurity.title}
                  </h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  {t.sections.dataSecurity.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.7s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}>
                  <HelpCircle size={32} className="text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#2C3C39' }}>
                  {t.sections.rights.title}
                </h2>
              </div>
              <p className="text-gray-700 text-lg mb-6">{t.sections.rights.intro}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {t.sections.rights.items.map((item, index) => (
                  <div key={index} 
                       className="group/right flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-opacity-50"
                       style={{ borderColor: '#ABDE3B' }}>
                    <div className="flex-shrink-0">
                      <ChevronRight size={18} className="transition-transform duration-300 group-hover/right:translate-x-1" 
                                    style={{ color: '#ABDE3B' }} />
                    </div>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(25, 131, 65, 0.05)', border: '2px solid rgba(25, 131, 65, 0.1)' }}>
                <p className="text-gray-700">{t.sections.rights.footer}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: '#2C3C39' }}>
                {t.sections.additional.title}
              </h2>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-l-4 hover:shadow-lg transition-all duration-300"
                     style={{ borderColor: '#ABDE3B' }}>
                  <h3 className="font-bold text-xl mb-3" style={{ color: '#198341' }}>
                    {t.sections.additional.children.title}
                  </h3>
                  <p className="text-gray-700">{t.sections.additional.children.content}</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-l-4 hover:shadow-lg transition-all duration-300"
                     style={{ borderColor: '#ABDE3B' }}>
                  <h3 className="font-bold text-xl mb-3" style={{ color: '#198341' }}>
                    {t.sections.additional.changes.title}
                  </h3>
                  <p className="text-gray-700">{t.sections.additional.changes.content}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="group animate-fadeIn" style={{ animationDelay: '0.9s' }}>
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background: 'linear-gradient(135deg, #ABDE3B 0%, #198341 100%)', filter: 'blur(40px)' }}></div>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="absolute inset-0"
                   style={{ background: 'linear-gradient(135deg, #2C3C39 0%, #198341 100%)' }}></div>
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
                   style={{ backgroundColor: '#ABDE3B', transform: 'translate(30%, -30%)' }}></div>
              
              <div className="relative p-8 md:p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#ABDE3B' }}>
                  {t.sections.contact.title}
                </h2>
                <p className="text-white/90 text-lg mb-8">{t.sections.contact.intro}</p>
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                  <p className="font-bold text-2xl mb-6" style={{ color: '#ABDE3B' }}>
                    {t.sections.contact.company}
                  </p>
                  <div className="space-y-3 text-white/90">
                    <p className="flex items-center gap-3">
                      <span className="font-medium">{t.sections.contact.email}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="font-medium">{t.sections.contact.phone}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center pt-8 animate-fadeIn" style={{ animationDelay: '1s' }}>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)' }}
            >
              <span>{t.sections.backToHome}</span>
              <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.1;
          }
        }

        .animate-pulse {
          animation: pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}