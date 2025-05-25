"use client"

import Link from "next/link"
import { ChevronRight, Shield, Eye, Users, Lock, Bell, FileText, HelpCircle } from 'lucide-react'
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
        email: "البريد الإلكتروني: privacy@yourcompany.com",
        phone: "الهاتف: 7890-456 (123)",
        address: "العنوان: 123 شارع رئيسي، المدينة، الولاية، الرمز البريدي",
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
    <div className={` w-full bg-[#f8f9fa] ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
      {/* Hero section */}
      <div className="bg-[#2C3C39] text-white">
        <div className="flex flex-wrap items-center justify-between max-w-6xl mx-auto py-16 px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.hero.title}</h1>
            <p className="text-[#ABDE3B] text-xl">{t.hero.subtitle}</p>
            <p className="mt-4 text-gray-200">{t.hero.lastUpdated}</p>
          </div>
          <div>
              <Image
                        src="/assets/images/3-car.png"
                        alt="logo"
                        width={420}
                        height={420}
                        className="transition-all duration-700 hover:scale-105"
                      />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto py-12 px-4 md:px-6">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6 text-[#198341]">
            <Shield size={24} />
            <h2 className="text-2xl font-bold">{t.sections.introduction.title}</h2>
          </div>
          <div className="pl-9 space-y-4 text-gray-700">
            {t.sections.introduction.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6 text-[#198341]">
            <Eye size={24} />
            <h2 className="text-2xl font-bold">{t.sections.informationCollect.title}</h2>
          </div>
          <div className="pl-9 space-y-4 text-gray-700">
            <p>{t.sections.informationCollect.intro}</p>
            <ul className="space-y-3">
              {t.sections.informationCollect.items.map((item, index) => (
                <li key={index} className="border-l-4 border-[#ABDE3B] pl-4 py-1">
                  <span className="font-medium text-[#2C3C39]">{item.title}:</span> {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6 text-[#198341]">
            <FileText size={24} />
            <h2 className="text-2xl font-bold">{t.sections.informationUse.title}</h2>
          </div>
          <div className="pl-9 space-y-4 text-gray-700">
            <p>{t.sections.informationUse.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {t.sections.informationUse.items.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="mt-1 text-[#ABDE3B]">
                    <ChevronRight size={16} />
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6 text-[#198341]">
            <Users size={24} />
            <h2 className="text-2xl font-bold">{t.sections.informationSharing.title}</h2>
          </div>
          <div className="pl-9 space-y-4 text-gray-700">
            <p>{t.sections.informationSharing.intro}</p>
            <div className="grid gap-4 mt-4">
              {t.sections.informationSharing.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#2C3C39] mb-1">{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">{t.sections.informationSharing.footer}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 text-[#198341]">
              <Bell size={24} />
              <h2 className="text-2xl font-bold">{t.sections.cookies.title}</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              {t.sections.cookies.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="flex items-center space-x-3 mb-6 text-[#198341]">
              <Lock size={24} />
              <h2 className="text-2xl font-bold">{t.sections.dataSecurity.title}</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              {t.sections.dataSecurity.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6 text-[#198341]">
            <HelpCircle size={24} />
            <h2 className="text-2xl font-bold">{t.sections.rights.title}</h2>
          </div>
          <div className="pl-9 space-y-4 text-gray-700">
            <p>{t.sections.rights.intro}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {t.sections.rights.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 bg-[#f8f9fa] p-3 rounded-lg">
                  <div className="text-[#ABDE3B]">
                    <ChevronRight size={16} />
                  </div>
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">{t.sections.rights.footer}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#198341] mb-6">{t.sections.additional.title}</h2>

          <div className="space-y-6">
            <div className="border-l-4 border-[#ABDE3B] pl-4 py-2">
              <h3 className="font-semibold text-[#2C3C39] mb-2">{t.sections.additional.children.title}</h3>
              <p className="text-gray-700">{t.sections.additional.children.content}</p>
            </div>

            <div className="border-l-4 border-[#ABDE3B] pl-4 py-2">
              <h3 className="font-semibold text-[#2C3C39] mb-2">{t.sections.additional.changes.title}</h3>
              <p className="text-gray-700">{t.sections.additional.changes.content}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2C3C39] text-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-[#ABDE3B]">{t.sections.contact.title}</h2>
          <p className="mb-4">{t.sections.contact.intro}</p>
          <div className="bg-[#1a2422] p-5 rounded-lg">
            <p className="font-medium text-[#ABDE3B]">{t.sections.contact.company}</p>
            <div className="mt-3 space-y-2 text-gray-200">
              <p>{t.sections.contact.phone}</p>
              <p>{t.sections.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#198341] text-white hover:bg-[#146a34] transition-colors"
          >
            {t.sections.backToHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
