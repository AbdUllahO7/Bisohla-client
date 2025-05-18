"use client"

import type React from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useLocale, useTranslations } from "next-intl"
import Box from "@/components/box/box"
import { Skeleton } from "@/components/ui/skeleton"
import AccordionProductDetails from "./Tabs/AccordionProductDetails"
import AccordionProductSafety from "./Tabs/AccordionProductSafety"
import LatestOffers from "../../Home/LatestOffers"
import CarDetailsContent from "./Tabs/CarDetailsContent"

interface Damage {
    id: number
    carListingId: number
    damageType: string
    damageZone: string
    description: string | null
    createdAt: string
    updatedAt: string
}

interface TabsSectionProps {
    data?: {
        data?: any
        damages?: Damage[]
    }
    isLoading?: boolean
}

const TabsSection: React.FC<TabsSectionProps> = ({ data, isLoading = false }) => {
    const t = useTranslations("product")
    const locale = useLocale()
    // Ensure damages is always an array, even if undefined or null
    const damages = Array.isArray(data?.data?.damages) ? data.data?.damages : []

    // Skeleton for section headers
    const SectionHeaderSkeleton = () => (
        <div className="mb-2">
        <Skeleton className="h-6 w-48" />
        </div>
    )

    return (
        <Box variant="column" className="justify-start items-start w-full">
        <Tabs defaultValue="account" className="flex-wrap">
            {/* Tab Content */}
            <TabsContent value="productDetails"></TabsContent>
            <TabsContent value="productInfo"></TabsContent>
            <TabsContent value="location"></TabsContent>
            <TabsContent value="adsInfo" className=""></TabsContent>
        </Tabs>

        {/* Ads Details Section */}
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
            <div className="font-cairo font-bold text-primary">
            {isLoading ? (
                <SectionHeaderSkeleton />
            ) : (
                <span className="border-b-2 pb-1 border-primary-light">
                {t("accordionDetails.details.adsDetails.question")}
                </span>
            )}
            </div>
            <div className="font-cairo text-[400] text-secondary-text mt-4">
                <CarDetailsContent data={data?.data} type="ads" isLoading={isLoading} />
            </div>
        </div>

        {/* Car Details Section */}
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
            <div className="font-cairo font-bold text-primary">
            {isLoading ? (
                <SectionHeaderSkeleton />
            ) : (
                <span className="border-b-2 pb-1 border-primary-light">
                {t("accordionDetails.details.carDetails.question")}
                </span>
            )}
            </div>
            <div className="font-cairo text-[400] text-secondary-text mt-4">
                {/* Display the car details here with enhanced styling */}
                <CarDetailsContent data={data?.data} type="car" isLoading={isLoading} />
            </div>
        </div>

        {/* Product Info Section */}
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
            <div className="font-cairo font-bold text-primary">
            {isLoading ? (
                <SectionHeaderSkeleton />
            ) : (
                <span className="border-b-2 pb-1 border-primary-light">{t("tabs.productInfo")}</span>
            )}
            </div>
            <div className="font-cairo text-[400] text-secondary-text mt-4">
            {isLoading ? (
                <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={`accordion-skeleton-${index}`} className="h-12 w-full" />
                ))}
                </div>
            ) : (
                <AccordionProductDetails damages={damages} />
            )}
            </div>
        </div>

        {/* product Features Section */}
        <div className="shadow-xl bg-white p-2 rounded-lg w-full mb-4">
            <div className="font-cairo font-bold text-primary">
            {isLoading ? (
                <SectionHeaderSkeleton />
            ) : (
                <span className="border-b-2 pb-1 border-primary-light">{t("tabs.productFeatures")}</span>
            )}
            </div>
            <div className="font-cairo text-[400] text-secondary-text mt-4">
            {isLoading ? (
                <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={`features-skeleton-${index}`} className="h-12 w-full" />
                ))}
                </div>
            ) : (
                <AccordionProductSafety features={data?.data.features} />
            )}
            </div>
        </div>

        {/* Ads */}
        <LatestOffers count={4} container={false}  title={locale === 'ar' ?   'إعلانات مشابهة' : 'Similar ads'}/>
        </Box>
    )
}

export default TabsSection
