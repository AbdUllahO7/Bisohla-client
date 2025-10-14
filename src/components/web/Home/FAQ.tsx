"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useTranslations } from "next-intl"
import { PlusIcon, MinusIcon, HelpCircle } from "lucide-react"
import { useState } from "react"
import SectionHeader from "@/components/SectionHeader"

const FAQ = () => {
    const t = useTranslations("homePage")
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const data = [
        { question: t("faq.questions.question1.question"), answer: t("faq.questions.question1.answer") },
        { question: t("faq.questions.question2.question"), answer: t("faq.questions.question2.answer") },
        { question: t("faq.questions.question3.question"), answer: t("faq.questions.question3.answer") },
        { question: t("faq.questions.question4.question"), answer: t("faq.questions.question4.answer") },
        { question: t("faq.questions.question5.question"), answer: t("faq.questions.question5.answer") },
    ]

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <Box className="block w-full mb-10 relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, #ABDE3B 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, #198341 0%, transparent 70%)' }}></div>

            <Box variant="column" className="relative z-10">
                {/* Header Section */}
                <SectionHeader 
                    title={t("faq.title")}
                    icon={HelpCircle}
                />
            </Box>

            <Box variant="container" className="w-[100%] p-0 relative z-10">
                <Box variant="column" className="justify-start items-start w-full space-y-4">
                    {data.map((item, index) => {
                        const isOpen = openIndex === index;
                        
                        return (
                            <div 
                                key={index} 
                                className="group relative w-full"
                                style={{
                                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                                }}
                            >
                                {/* Glow Effect on Hover */}
                                

                                <div className={`bg-white/90 backdrop-blur-sm p-6 rounded-2xl w-full transition-all duration-300 border-2 ${
                                    isOpen 
                                        ? 'shadow-2xl border-opacity-100' 
                                        : 'shadow-lg border-transparent group-hover:shadow-xl'
                                }`}
                                style={isOpen ? { borderColor: '#ABDE3B' } : {}}>
                                    
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex items-center justify-between font-cairo font-bold group/button"
                                        aria-expanded={isOpen}
                                    >
                                        {/* Question Text */}
                                        <span className="flex items-center gap-3 flex-1">
                                            {/* Number Badge */}
                                            <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm transition-all duration-300 ${
                                                isOpen ? 'scale-110' : 'scale-100'
                                            }`}
                                            style={{
                                                background: isOpen 
                                                    ? 'linear-gradient(135deg, #198341 0%, #ABDE3B 100%)' 
                                                    : 'rgba(25, 131, 65, 0.1)',
                                                color: isOpen ? '#fff' : '#198341'
                                            }}>
                                                {index + 1}
                                            </span>
                                            
                                            <span className={`text-start text-lg transition-all duration-300 ${
                                                isOpen ? 'font-bold' : 'font-semibold'
                                            }`}
                                            style={{ color: isOpen ? '#198341' : '#2C3C39' }}>
                                                {item.question}
                                            </span>
                                        </span>

                                        {/* Icon Button */}
                                        <span className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${
                                            isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                                        } group-hover/button:scale-110`}
                                        style={{
                                            background: isOpen 
                                                ? 'linear-gradient(135deg, #198341 0%, #ABDE3B 100%)' 
                                                : 'rgba(171, 222, 59, 0.2)'
                                        }}>
                                            {isOpen ? (
                                                <MinusIcon className="h-5 w-5 transition-colors duration-300" 
                                                          style={{ color: '#fff' }} />
                                            ) : (
                                                <PlusIcon className="h-5 w-5 transition-colors duration-300" 
                                                         style={{ color: '#198341' }} />
                                            )}
                                        </span>
                                    </button>

                                    {/* Answer Section with Smooth Animation */}
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                            isOpen ? 'mt-4' : 'mt-0'
                                        }`}
                                        style={{
                                            maxHeight: isOpen ? '500px' : '0',
                                            opacity: isOpen ? 1 : 0
                                        }}
                                    >
                                        <div className={`font-cairo text-[16px] leading-relaxed p-4 rounded-xl transition-all duration-300 ${
                                            isOpen ? 'translate-y-0' : '-translate-y-2'
                                        }`}
                                        style={{ 
                                            color: '#4a5568',
                                            background: 'linear-gradient(135deg, rgba(171, 222, 59, 0.05) 0%, rgba(25, 131, 65, 0.05) 100%)',
                                            borderLeft: '3px solid #ABDE3B'
                                        }}>
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Box>
            </Box>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </Box>
    )
}

export default FAQ