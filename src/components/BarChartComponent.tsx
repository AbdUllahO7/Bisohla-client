"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

type BarChartComponentProps = {
  data: Array<{ [key: string]: any }>;
  xAxisKey: string;
  barDataKey: string;
  chartTitle: string;
  chartDescription: string;
  tooltipContent?: React.ReactNode;  // Allowing ReactNode as optional
  barColor?: string;
  containerClassName?: string;
  chartConfig: ChartConfig; // chartConfig required
}

export function BarChartComponent({
  data,
  xAxisKey,
  barDataKey,
  chartTitle,
  chartDescription,
  tooltipContent = <ChartTooltipContent />,  // Default tooltipContent to a valid React element
  barColor = "var(--color-sales)",
  containerClassName = "h-[200px] xs:max-w-[85%]",
  chartConfig,
}: BarChartComponentProps) {
  return (
    <Card className="w-full max-w-md xs:max-w-[70%]">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent className="">
        <ChartContainer config={chartConfig} className={containerClassName}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={tooltipContent} />
            <Bar dataKey={barDataKey} fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
