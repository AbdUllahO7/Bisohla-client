import { Images } from '@/assets'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'

const HeaderOne = () => {
    return (
        <div className='flex  justify-center lg:justify-between lg:pl-[90px]  w-full pt-10 items-center'>
            {/* left */}
            <div className='flex gap-5 '>
                <div className=''>
                        <Button variant="default" className='text-white hover:none rounded-3xl pb-[5px] pr-[23px]  pt-[5px]' size="lg" >
                            <span>Create Ads</span>
                            <Image 
                            src={Images.Glyph} // Default image included in Next.js projects
                            alt="Glyph Image"
                            width={18}
                            height={18}
                        />
                        </Button>
                    

                </div>
                <div className=''>
                        <Button variant="default" className='text-primary hover:none bg-transparent shadow-none rounded-3xl pb-[5px] pr-[23px]  pt-[5px]  border-2 border-primary' size="lg" >
                            <span>Create Account</span>
                            <Image 
                              src={Images.user} // Default image included in Next.js projects
                            alt="user Image"
                            width={18}
                            height={18}
                        />
                        </Button>
                
                </div>

            </div>

            {/* right */}
            <div className='pr-[50px] hidden lg:block lg:pr-[90px]'>
                <Image 
                    src={Images.bishola} // Default image included in Next.js projects
                    alt="Test Image"
                    width={153}
                    height={33}
                />
            </div>
        </div>
    )
}

export default HeaderOne
