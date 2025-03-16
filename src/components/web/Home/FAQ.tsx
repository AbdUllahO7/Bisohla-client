import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    } from "@/components/ui/accordion"
    
const FAQ = () => {
        const t = useTranslations('homePage');
        const data = [
            {question : t('faq.questions.question1.question') , answer : t('faq.questions.question1.answer')},
            {question : t('faq.questions.question2.question') , answer : t('faq.questions.question2.answer')},
            {question : t('faq.questions.question3.question') , answer : t('faq.questions.question3.answer')},
            {question : t('faq.questions.question4.question') , answer : t('faq.questions.question4.answer')},
            {question : t('faq.questions.question5.question') , answer : t('faq.questions.question5.answer')},

        ]
    
    return (
        <Box  className="block w-full mb-10">
            <Box variant="column">
                <Box variant="column" className='mb-10'>
                    <Text variant="h3" className="font-bold text-[20px] font-cairo">
                        {t('faq.title')}
                    </Text>
                    <Link href="/AllFaq">
                        <Text variant="mid" className='text-[20px] font-cairo text-primary-light'>{t('faq.showMore')}</Text>
                    </Link>
                </Box>
                
            </Box>
            <Box variant="container" className='w-[83%] '>
                <Box variant='column' className='justify-start items-start w-full'>
                    {
                data.map((item, index) => (
                    <Accordion key={index} type="single" collapsible className='shadow-xl bg-white p-6 rounded-3xl w-full hover:bg-primary-light duration-500 group'>
                        <AccordionItem value="item-1" className='border-none'>
                        <AccordionTrigger className='hover:no-underline font-cairo font-bold text-primary group-hover:text-white duration-500'>
                            {item.question}
                        </AccordionTrigger>
                            <AccordionContent className='font-cairo text-[400] text-secondary-text group-hover:text-white duration-500'>
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                        ) )
                    }
                
                
                </Box>
            </Box>
    </Box>
    )
}

export default FAQ
