"use client"

import type React from "react"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Car, ChevronUp, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"

interface BoxOfInfoProps {
  icon?: ReactNode
  title: string
  count: number
  percentage: number
}

const BoxOfInfo: React.FC<BoxOfInfoProps> = ({
    icon = <Car size={28} className="text-primary-light" />,
    title,
    count,
    percentage,
    }) => {
    // Determine if percentage is positive
    const isPositive = percentage >= 0

    return (
        <Box
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 w-64 m-2 border border-slate-100 dark:border-slate-700 overflow-hidden relative group"
        variant="column"
        >
        {/* Background decoration */}
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-primary/5 dark:bg-primary/10 group-hover:scale-150 transition-transform duration-500"></div>

        {/* Icon container */}
        <div className="flex justify-start items-center w-full mb-4">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20">{icon}</div>
        </div>

        {/* Title */}
        <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</Text>

        {/* Count with animation */}
        <Text className="text-slate-900 dark:text-white text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300">
            {count}
        </Text>

        {/* Percentage indicator */}
        <div className="flex items-center mt-auto">
            <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isPositive
                ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
                : "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30"
            }`}
            >
            {isPositive ? (
                <ChevronUp size={14} className="stroke-2" />
            ) : (
                <TrendingUp size={14} className="stroke-2 rotate-180" />
            )}
            <span>{Math.abs(percentage)}%</span>
            </div>
            <Text className="text-slate-500 dark:text-slate-400 text-xs ml-2">vs last period</Text>
        </div>
        </Box>
    )
}

export default BoxOfInfo

