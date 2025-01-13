import Image from 'next/image'
import React from 'react'
import { Button } from '../../ui/button'
import Box from '../../box/box'
import { getTranslations } from 'next-intl/server'
import LocaleSwitcher from '../../local/LocalSwitcher'

const HeaderOne = async () => {
    const t = await getTranslations('homePage');

    return (
        <Box variant="container" className='flex justify-between mt-2'>
             {/* right */}
            <div className='pr-[50px] hidden lg:block lg:pr-[90px]'>
                <Image 
                    src="/assets/images/logo/bishola.png"// Default image included in Next.js projects
                    alt="Test Image"
                    width={153}
                    height={33}
                />
            </div>
            
            {/* left */}
            <div className='flex lg:gap-5 items-center'>
                <div className=''>
                        <Button variant="default" className='text-white hover:none rounded-3xl pb-[5px] pr-[23px]  pt-[5px]' size="lg" >
                            <span>{t('headerOne.adsButton')}</span>
                            <Image 
                            src="/assets/icons/Glyph.png" // Default image included in Next.js projects
                            alt="Glyph Image"
                            width={18}
                            height={18}
                        />
                        </Button>
                    

                </div>
                <div className=''>
                            <Button variant="default" className='text-primary hover:none bg-transparent shadow-none rounded-3xl pb-[5px] pr-[23px]  pt-[5px]  border-2 border-primary' size="lg" >
                            <span>{t('headerOne.loginButton')}</span>
                        <Image 
                            src="/assets/icons/user.png" // Default image included in Next.js projects
                            alt="user Image"
                            width={18}
                            height={18}
                        />
                        </Button>
                
                </div>
                {/* local  */}
                <div>
                    <LocaleSwitcher/>
                </div>
            </div>

           
            
        </Box>
    )
}

export default HeaderOne
