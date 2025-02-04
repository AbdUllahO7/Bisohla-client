import Box from '@/components/box/box'
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


interface AccordionDetailsProps {
    data: { question: string; answer: string }[];

}


const AccordionDetails:  React.FC<AccordionDetailsProps>  = ({data}) => {



    return (
        <Box variant="column" className="w-full  mt-5">
            {data.map((item, index) => (
                <Accordion key={index} type="single" collapsible className='shadow-xl bg-white p-2 rounded-lg w-full '>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='hover:no-underline font-cairo font-bold text-primary'>
                        <span className='border-b-2  pb-1 border-primary-light'>{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className='font-cairo text-[400] text-secondary-text'>
                            {item.answer}                    
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
                
            ))}
        </Box>

    );
};

export default AccordionDetails;
