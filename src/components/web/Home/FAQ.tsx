"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useTranslations } from "next-intl"
import {Link} from "@/i18n/routing"

import { PlusIcon, MinusIcon } from "lucide-react"
import { useState } from "react"

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
    <Box className="block w-full mb-10">
        <Box variant="column">
            <Box variant="column" className="mb-10">
            <Text variant="h3" className="font-bold text-[20px] font-cairo">
                {t("faq.title")}
            </Text>
            <Link href="/AllFaq">
                <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                {t("faq.showMore")}
                </Text>
            </Link>
            </Box>
        </Box>
            <Box variant="container" className="w-[83%]">
                <Box variant="column" className="justify-start items-start w-full space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="shadow-xl bg-white p-6 rounded-xl w-full">
                        <button
                            onClick={() => toggleAccordion(index)}
                            className="w-full flex items-center justify-between font-cairo font-bold"
                            aria-expanded={openIndex === index}
                        >
                            <span
                            className={`text-left transition-colors duration-200 ${openIndex === index ? "text-primary-light" : "text-gray-700"}`}
                            >
                            {item.question}
                            </span>
                            <span className="flex items-center justify-center h-7 w-7 relative -z-40">
                            {openIndex === index ? (
                                <MinusIcon className="h-7 w-7 text-primary-light absolute -z-40" />
                            ) : (
                                <PlusIcon className="h-7 w-7 text-primary-light absolute -z-40" />
                            )}
                            </span>
                        </button>

                        <div
                            className={`mt-4 font-cairo text-[400] text-secondary-text overflow-hidden transition-all duration-300 ${
                            openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            }`}
                        >
                            {item.answer}
                        </div>
                        </div>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}

export default FAQ
