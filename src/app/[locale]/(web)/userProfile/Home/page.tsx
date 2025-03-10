"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Car,
    DollarSign,
    Users,
    CalendarClock,
    TrendingUp,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data - in a real app, this would come from your API/database
const statsData = {
  totalCars: 342,
  forSale: 245,
  forRent: 97,
  totalRevenue: 1284500,
  pendingPayments: 34200,
  activeUsers: 1842,
  inquiriesThisWeek: 87,
  popularBrands: [
    { name: "Toyota", percentage: 28 },
    { name: "Honda", percentage: 22 },
    { name: "BMW", percentage: 18 },
    { name: "Mercedes", percentage: 15 },
    { name: "Ford", percentage: 10 },
  ],
  recentTransactions: [
    {
      id: 1,
      user: "Alex Johnson",
      car: "Toyota Camry 2022",
      type: "Sale",
      amount: 28500,
      date: "2 hours ago",
      avatar: "A",
    },
    {
      id: 2,
      user: "Sarah Miller",
      car: "Honda Civic 2023",
      type: "Rent",
      amount: 1200,
      date: "5 hours ago",
      avatar: "S",
    },
    { id: 3, user: "Robert Chen", car: "BMW X5 2021", type: "Sale", amount: 45000, date: "Yesterday", avatar: "R" },
    { id: 4, user: "Emma Davis", car: "Audi Q7 2022", type: "Rent", amount: 2100, date: "Yesterday", avatar: "E" },
  ],
  monthlySales: [
    { month: "Jan", sales: 42 },
    { month: "Feb", sales: 38 },
    { month: "Mar", sales: 55 },
    { month: "Apr", sales: 47 },
    { month: "May", sales: 68 },
    { month: "Jun", sales: 52 },
  ],
  monthlyRentals: [
    { month: "Jan", rentals: 18 },
    { month: "Feb", rentals: 22 },
    { month: "Mar", rentals: 19 },
    { month: "Apr", rentals: 25 },
    { month: "May", rentals: 32 },
    { month: "Jun", rentals: 28 },
  ],
}

const UserHomePage = () => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Main Content */}
      <SidebarInset>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl h-full">
            <div className="grid grid-rows-[auto_auto_1fr] h-full gap-4">
              <div className="mb-4">
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome to your car sales and rental statistics dashboard</p>
              </div>

              {/* Key Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsData.totalCars}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Badge variant="outline" className="mr-2">
                        For Sale: {statsData.forSale}
                      </Badge>
                      <Badge variant="outline">For Rent: {statsData.forRent}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statsData.totalRevenue)}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500">+12.5%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsData.activeUsers}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500">+8.2%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statsData.pendingPayments)}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">-3.1%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main content area with charts and other cards */}
              <div className="grid grid-rows-[auto_1fr] gap-4 overflow-hidden ">
                {/* Charts Section */}
               

                    <Card className="bg-primary">
                      <CardHeader>
                        <CardTitle>Monthly Car Sales</CardTitle>
                        <CardDescription>Number of cars sold per month</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-4rem)]">
                        <div className="h-full w-full flex items-center justify-center">
                          <BarChart className="h-16 w-16 text-muted-foreground" />
                          <div className="ml-4 text-muted-foreground">Sales chart visualization would appear here</div>
                        </div>
                      </CardContent>
                    </Card>

  

                {/* Two Column Layout for Popular Brands and Recent Transactions */}
                <div className="grid grid-rows-[1fr_auto] gap-4 overflow-hidden">
                  <div className="grid gap-4 md:grid-cols-2 overflow-hidden">
                    {/* Popular Car Brands */}
                    <Card className="bg-primary">
                      <CardHeader>
                        <CardTitle>Popular Car Brands</CardTitle>
                        <CardDescription>Distribution of car brands in your inventory</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {statsData.popularBrands.map((brand) => (
                            <div key={brand.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{brand.name}</span>
                                <span className="text-sm text-muted-foreground">{brand.percentage}%</span>
                              </div>
                              <Progress value={brand.percentage} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="bg-primary">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Recent Transactions</CardTitle>
                          <CardDescription>Latest sales and rentals</CardDescription>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          <span>{statsData.inquiriesThisWeek} New Inquiries</span>
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {statsData.recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Avatar className="h-9 w-9 mr-3">
                                  <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={transaction.user} />
                                  <AvatarFallback>{transaction.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{transaction.user}</p>
                                  <p className="text-xs text-muted-foreground">{transaction.car}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={transaction.type === "Sale" ? "default" : "secondary"}>
                                  {transaction.type}
                                </Badge>
                                <p className="text-sm font-medium mt-1">{formatCurrency(transaction.amount)}</p>
                                <p className="text-xs text-muted-foreground">{transaction.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="overflow-hidden bg-primary">
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                      <CardDescription>Key metrics for your business</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <TrendingUp className="h-8 w-8 text-primary mb-2" />
                          <h3 className="text-lg font-semibold">Conversion Rate</h3>
                          <p className="text-3xl font-bold">8.7%</p>
                          <p className="text-sm text-muted-foreground">Inquiries to sales</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <Car className="h-8 w-8 text-primary mb-2" />
                          <h3 className="text-lg font-semibold">Average Time</h3>
                          <p className="text-3xl font-bold">18 Days</p>
                          <p className="text-sm text-muted-foreground">Listing to sale</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                          <DollarSign className="h-8 w-8 text-primary mb-2" />
                          <h3 className="text-lg font-semibold">Avg. Transaction</h3>
                          <p className="text-3xl font-bold">{formatCurrency(32450)}</p>
                          <p className="text-sm text-muted-foreground">Per vehicle</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}

export default UserHomePage

