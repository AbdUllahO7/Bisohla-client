import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { ArrowLeftRight, Heart, PhoneCall } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

interface ProductHeaderProps {
  productName?: string;
  ContactNumber?: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  productName = '', 
  ContactNumber = '' 
}) => {
  const t = useTranslations('product')
  
  // Format phone number for WhatsApp link (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove all non-digit characters
    return phone.replace(/\D/g, '');
  };
  
  // Generate WhatsApp link with pre-filled message
  const generateWhatsAppLink = () => {
    const formattedPhone = formatPhoneForWhatsApp(ContactNumber);
    const message = encodeURIComponent(`Hi, I'm interested in your ${productName} listing.`);
    
    // If formattedPhone is empty, use a default fallback link
    if (!formattedPhone) {
      return 'https://wa.me/?text=' + message;
    }
    
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  return (
    <Box variant="rowBetween" className='items-center justify-start xs:flex-wrap pt-3 pb-3 w-full'>
      <Box className='justify-start items-start' variant="center">
        <Text variant="h4" className='pr-2 pl-2'>{productName}</Text>
      </Box>

      <Box className='justify-end items-center md:flex-nowrap xs:flex-wrap flex-1' variant="row">
        <Box className='justify-center items-center bg-background p-2 rounded-md hover:bg-white duration-500 cursor-pointer group' variant="center">
          <Text variant="mid" className='pr-2 pl-2 '><Heart className='group-hover:text-red-900'/></Text>
        </Box>
      
        <Box className='justify-center items-center bg-background p-2 rounded-md cursor-pointer group' variant="center">
          <Text variant="mid" className='pr-2 pl-2 group-hover:animate-bounce'><ArrowLeftRight/></Text>
        </Box>
      
        <Box className='justify-center items-center border border-primary rounded-md p-2 group hover:bg-primary duration-500' variant="center">
          <Link href={`tel:${ContactNumber}`} className='flex items-center gap-2 '>
            <Text className='group-hover:text-white'>{ContactNumber}</Text>
            <span className='text-primary group-hover:text-white'><PhoneCall/></span> 
          </Link>
        </Box>
        <Box className='justify-center items-center bg-primary-foreground rounded-md p-2 group hover:bg-primary duration-500' variant="center">
          <Link 
            href={generateWhatsAppLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className='flex items-center gap-2'
          >
            <Text className='group-hover:text-white duration-500'>{t('header.whatsApp')}</Text>
            <span className='text-primary group-hover:text-white duration-500'><PhoneCall/></span> 
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default ProductHeader