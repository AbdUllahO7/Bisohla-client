'use client';

import type React from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import {  Car, ShoppingCart, Package } from 'lucide-react';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';

interface ProfileStatsProps {
  profile: PublicProfileData;
  isLoading?: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  profile,
  isLoading = false,
}) => {
  const t = useTranslations('publicProfile.stats');

  // Define stats data
  const statsData = [
    {
      key: 'totalListings',
      label: t('totalListings'),
      value: profile.totalListings,
      icon: <Package className="h-6 w-6 text-primary-light" />,
      gradient: 'from-primary to-primary-light',
    },
    {
      key: 'forSale',
      label: t('forSale'),
      value: profile.totalForSaleListings,
      icon: <ShoppingCart className="h-6 w-6 text-primary-light" />,
      gradient: 'from-primary to-primary-light',
    },
    {
      key: 'forRent',
      label: t('forRent'),
      value: profile.totalForRentListings,
      icon: <Car className="h-6 w-6 text-primary-light" />,
      gradient: 'from-primary to-primary-light',
    },
    // {
    //   key: 'totalViews',
    //   label: t('totalViews'),
    //   value: profile.totalViews,
    //   icon: <Eye className="h-6 w-6 text-primary-light" />,
    //   gradient: 'from-orange-500 to-red-500',
    // },
  ];

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="bg-white dark:bg-zinc-900 border-none rounded-xl p-4 shadow-sm"
            >
              <CardContent className="flex flex-col gap-3 p-0">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Box>
    );
  }

  return (
    <Box variant="center" className="w-full">
      {/* Mobile Layout */}
      <div className="md:hidden w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          {statsData.map((stat) => (
            <div key={stat.key} className="relative group">
              {/* Hover glow effect */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`}
              ></div>

              <Card className="relative bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-xl p-4 shadow-md hover:shadow-xl hover:border-primary-light transition-all duration-300 overflow-hidden">
                {/* Top accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                ></div>

                <CardContent className="flex flex-col gap-3 p-0 relative z-10">
                  {/* Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-light blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                    <div
                      className={`relative p-2  bg-gradient-to-br from-primary-light/10 to-[#ABDE3B]/10 group-hover:from-primary-light/20 group-hover:to-[#ABDE3B]/20 bg-opacity-10 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {stat.icon}
                    </div>
                  </div>

                  {/* Label */}
                  <Text
                    variant="small"
                    className="text-gray-600 dark:text-zinc-400 font-cairo font-medium text-xs"
                  >
                    {stat.label}
                  </Text>

                  {/* Value */}
                  <Text variant="h3" className="text-[#2C3C39] dark:text-white font-bold">
                    {stat.value.toLocaleString()}
                  </Text>
                </CardContent>

                {/* Corner accent */}
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-[#ABDE3B]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-3 gap-4 w-full">
        {statsData.map((stat) => (
          <div key={stat.key} className="relative group">
            {/* Hover glow effect */}
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`}
            ></div>

            <Card className="relative bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-xl p-6 shadow-md hover:shadow-2xl hover:border-primary-light transition-all duration-300 overflow-hidden">
              {/* Top accent line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
              ></div>

              {/* Side accent indicator */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-16 bg-gradient-to-b ${stat.gradient} transition-all duration-300 rounded-r-full`}
              ></div>

              <CardContent className="flex flex-col gap-4 p-0 relative z-10">
                {/* Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-light blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div
                    className={`relative p-3 bg-gradient-to-br from-primary-light/10 to-[#ABDE3B]/10 group-hover:from-primary-light/20 group-hover:to-[#ABDE3B]/20 rounded-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    {stat.icon}
                  </div>
                </div>

                {/* Label */}
                <Text
                  variant="small"
                  className="text-gray-600 dark:text-zinc-400 font-cairo font-medium"
                >
                  {stat.label}
                </Text>

                {/* Value */}
                <Text
                  variant="h2"
                  className="text-[#2C3C39] dark:text-white font-bold group-hover:text-primary-light transition-colors duration-300"
                >
                  {stat.value.toLocaleString()}
                </Text>
              </CardContent>

              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#ABDE3B]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default ProfileStats;
