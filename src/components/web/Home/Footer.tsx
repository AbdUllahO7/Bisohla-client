import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const Footer = () => {
        const locale = useLocale(); // Get the current language
    
    return (
    <Box variant="column" className='shadow-lg pb-10 justify-around w-full ' >
        <Box  variant='row' className='w-full justify-evenly md:flex-wrap xs:flex-wrap'>

                    {/*  create ad */}
                <Box variant="column" className='items-start justify-start gap-8 md:w-[300px] sm:w-[400px] xs:w-[400px] lg:mt-0 lg:items-start xs:items-center xs:mt-5'>
                    <Text variant="h4" className='text-primary'>{locale === 'ar' ?  'أنشىء اعلان' : 'Create Ad'}</Text>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'إنشىء إعلان تأجير سيارة' :'Create a car rental ad'}</Link>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'أنشىء إعلان بيع سيارة' :'Create a car sale ad'}</Link>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'أنشىء حساب' :'Create Account'}</Link>

                </Box>
                <Box variant="column" className='items-start justify-start gap-8 md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] lg:items-start xs:items-center xs:mt-5'>
                    <Text variant="h4" className='text-primary'>{locale === 'ar' ?  'بسهولة' : 'Bishola'}</Text>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'سياسة الخصوصية' :'Privacy policy'}</Link>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'سياسة انشاء الاعلان' :'Advertisement creation policy'}</Link>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'سياسية حماية البيانات' :'Data Protection Policy'}</Link>
                </Box>
                <Box variant="column" className='items-start justify-start gap-8 md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] lg:items-start xs:items-center xs:mt-5'>
                    <Text variant="h4" className='text-primary'>{locale === 'ar' ?  'العنوان الرئيسي' : 'Main Title'}</Text>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'الصفحة الرئيسية' :'Home Page'}</Link>
                    <Link href="#" className="text-primary">{locale === 'ar' ? 'الاستئجار' :'Rent'}</Link>
                    <Link href="#" className="text-primary">{locale === 'ar' ? ' البيع' :'Sale'}</Link>
                </Box>

                {/* Subscribe */}
                <Box variant="column" className='justify-start items-start  md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] '>
                    <Text variant="lead" className='text-[600] '>
                        {locale === 'ar' ? 'اشترك في النشرة الإخبارية لدينا' : 'Subscribe to our newsletter'}
                    </Text>
                    <Text variant="mid" className='w-full'>
                        {locale === 'ar' ? 'ابق على اطلاع على آخر الأخبار والعروض الحصرية والتحديثات المثيرة' : 'Stay up to date with the latest news, exclusive offers and exciting updates.'}
                    </Text>
                    <Box variant="center" className="flex w-full max-w-sm items-center">
                        <Input type="email" placeholder={locale === 'ar' ? 'البريد الالكتروني' :"Email"} className='rounded-2xl  border-secondary-text'/>
                        <Button type="submit" className='bg-primary-foreground text-primary ml-1 mr-1'>{locale === 'ar' ? 'اشتراك' : 'Subscribe'}</Button>
                    </Box>
                    <Box variant='row' className='mt-5 w-full'>
                        <Button className='bg-white shadow-none border border-primary-light h-full '>
                        <Box variant='column' className='gap-0 h-full'>
                                <Text variant="small" className='text-primary-light'>Availabel on the </Text>
                                <Text variant="mid" className='text-primary-light'>App Store </Text>
                            </Box>
                            <Image 
                                src="/assets/icons/apple-icon.png"
                                alt='apple'
                                width={20}
                                height={20}
                            />
                        
                        </Button>
                        <Button className='bg-white shadow-none border border-primary-light h-full '>
                        <Box variant='column' className=' gap-0 h-full'>
                                <Text variant="small" className='text-primary-light'>Availabel on the </Text>
                                <Text variant="mid" className='text-primary-light'>Google Play</Text>

                            </Box>
                            <Image 
                                    src="/assets/icons/play-google.png"
                                    alt='apple'
                                    width={30}
                                    height={30}
                            />                            
                            
                        </Button>
                    </Box>
                </Box>

        
        </Box>

        <Box variant="rowBetween" className='justify-evenly w-full'>
            <Box className='m-10'>
                <Image 
                    src="/assets/images/logo/bishola.png"// Default image included in Next.js projects
                    alt="Test Image"
                    width={153}
                    height={33}
                />
                </Box>
            
                {/* social */}
                <Box variant="row" className='m-10'>
                    <Link href="#">
                        <Image 
                            src="/assets/icons/twitter.png"
                            alt='twitter'
                            width={20}
                            height={20}
                        />
                    </Link>
                    <Link href="#">
                        <Image 
                            src="/assets/icons/instagram.png"
                            alt='twitter'
                            width={20}
                            height={20}
                        />
                    </Link>
                    <Link href="#">
                        <Image 
                            src="/assets/icons/faceBook.png"
                            alt='twitter'
                            width={20}
                            height={20}
                        />
                    </Link>
                </Box>        
            
        </Box>
    </Box>
    )
}

export default Footer
