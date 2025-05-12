import Image from 'next/image'
import React from 'react'
import { Button } from '../../ui/button'
import Box from '../../box/box'
import { getTranslations } from 'next-intl/server'
import LocaleSwitcher from '../../local/LocalSwitcher'
import Link from 'next/link'
import { getSession } from '@/core/lib/web/session'
import { UserCheck2Icon, BellIcon } from 'lucide-react'
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions'
import NotificationDropdown from './NotificationDropdown'

const HeaderOne = async () => {
    const t = await getTranslations('homePage');

    const payload = await getSession();

    // Check authentication status
    const authResult = await checkAuth();
    
    return (
        <Box className='flex md:justify-between xs:justify-center mt-2 pb-2 z-10'>
             {/* right */}
            <div className='hidden md:block lg:block'>
                <Image 
                    src="/assets/images/logo/bishola.png"
                    alt="Test Image"
                    width={153}
                    height={33}
                />
            </div>
            
            {/* left */}
            <div className='flex lg:gap-5 items-center xs:gap-8 justify-evenly'>
                <Box className='xs:w-[120px] lg:w-full'>
                    <Link href="/products/AddProducts">
                        <Button variant="default" className='text-white hover:none rounded-3xl pb-[5px] pr-[23px] pt-[5px]' size="lg">
                            <span>{t('headerOne.adsButton')}</span>
                            <Image 
                                src="/assets/icons/Glyph.png"
                                alt="Glyph Image"
                                width={18}
                                height={18}
                            />
                        </Button>
                    </Link>
                </Box>
                
              
                
                {/* Login/Profile Button */}
                {!authResult.success ? (
                    <Box className='xs:w-[120px] lg:w-full'>
                        <Link href="/auth/sign-in">
                            <Button variant="default" className='text-primary hover:none bg-transparent shadow-none rounded-3xl pb-[5px] pr-[23px] pt-[5px] border-2 border-primary' size="lg">
                                <span>{t('headerOne.loginButton')}</span>
                                <Image 
                                    src="/assets/icons/user.png"
                                    alt="user Image"
                                    width={18}
                                    height={18}
                                />
                            </Button>
                        </Link>
                    </Box>
                ) : (
                    <Link href="/userProfile">
                        <Button variant="default" className='text-primary hover:none bg-transparent shadow-none rounded-3xl pb-[5px] pr-[23px] pt-[5px] border-2 border-primary' size="lg">
                            <span>{t('headerOne.profileButton')} / {payload?.user.name}</span>
                            <UserCheck2Icon/>
                        </Button>
                    </Link>
                )}
                  {/* Notification Icon - Only show when authenticated */}
                  {authResult.success && (
                    <NotificationDropdown />
                )}
                {/* local */}
                <div className='xs:hidden lg:block md:block'>
                    <LocaleSwitcher/>
                </div>
                
            </div>
        </Box>
    )
}

export default HeaderOne