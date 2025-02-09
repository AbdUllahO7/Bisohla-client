import { BarChartComponent } from '@/components/BarChartComponent'
import Box from '@/components/box/box'
import BoxOfInfo from '@/components/web/UserProfilePage/BoxOfInfo'
import React from 'react'
const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4500 },
    { month: "May", sales: 6000 },
    { month: "Jun", sales: 5500 },
    { month: "Jul", sales: 7000 },
    { month: "Aug", sales: 6500 },
    { month: "Sep", sales: 8000 },
    { month: "Oct", sales: 7500 },
    { month: "Nov", sales: 9000 },
    { month: "Dec", sales: 10000 },
  ]
  
  
const UserHomePage = () => {
    return (
        <Box variant="row" className='flex-wrap w-full xs:justify-center xs:items-center'>
            <BoxOfInfo title="Cars For Rent" count={12} percentage={65} />
            <BoxOfInfo title="Cars For Rent" count={12} percentage={65} />
            <BoxOfInfo title="Cars For Rent" count={12} percentage={65} />
            <BoxOfInfo title="Cars For Rent" count={12} percentage={65} />
                <BarChartComponent
                data={salesData}
                xAxisKey="month"
                barDataKey="sales"
                chartTitle="Monthly Sales"
                chartDescription="An overview of our monthly sales performance"
                barColor="hsl(var(--chart-1))"
                chartConfig={{
                sales: {
                    label: "Sales",
                    color: "hsl(var(--chart-1))",
                },
                }}
        />

        </Box>
    )
}

export default UserHomePage
