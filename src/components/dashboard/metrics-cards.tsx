"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Product {
    id: number
    productName: string
    price: number
    quantity: number
    category: string
    supplier: string
    positionId: number | null
}

interface Stocktaking {
    id: number
    sessionName: string
    sessionDate: string
    sessionNotes: string
    status: string
    products: any
}

interface DashboardData {
    lowStockProducts: Product[] | null
    overstockedProducts: Product[] | null
    mostRecentStocktaking: Stocktaking | null
    totalProducts: number
    lowStockCount: number
    overstockedCount: number
}

interface ApiResponse {
    userId: number
    productQuantity: number
    message: string
    data: DashboardData
    status: number
}

export function MetricsCards() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = localStorage.getItem('token')
                console.log('Token found:', !!token) // Debug log
                if (!token) {
                    console.error('No authentication token found')
                    setLoading(false)
                    return
                }

                console.log('Making API call to:', 'http://localhost:8080/api/v1/dashboard/stats') // Debug log
                
                const response = await fetch('http://localhost:8080/api/v1/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                
                console.log('Response status:', response.status) // Debug log
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                const result: ApiResponse = await response.json()
                console.log('API Response:', result) // Debug log
                
                if (result.status === 200 && result.data) {
                    console.log('Raw data:', result.data) // Debug log
                    
                    // Normalize data to ensure arrays are never null
                    const normalizedData = {
                        ...result.data,
                        lowStockProducts: result.data.lowStockProducts || [],
                        overstockedProducts: result.data.overstockedProducts || [],
                        mostRecentStocktaking: result.data.mostRecentStocktaking || null,
                        totalProducts: result.data.totalProducts ?? 0,
                        lowStockCount: result.data.lowStockCount ?? 0,
                        overstockedCount: result.data.overstockedCount ?? 0
                    }
                    
                    console.log('Normalized data:', normalizedData) // Debug log
                    setDashboardData(normalizedData)
                } else {
                    console.error('Invalid API response:', result)
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
                console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardStats()
    }, [])

    if (loading) {
        return <div>Loading dashboard statistics...</div>
    }

    if (!dashboardData) {
        return <div>Failed to load dashboard data</div>
    }

    // Debug: Log the current dashboard data
    console.log('Current dashboardData in render:', dashboardData)
    
    // Debug: Show raw data in UI temporarily
    console.log('Rendering with data:', {
        total: dashboardData.totalProducts,
        low: dashboardData.lowStockCount,
        over: dashboardData.overstockedCount
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-EN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Inventory Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Overview</CardTitle>
                    <CardDescription>Current stock status summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                            <p className="text-2xl font-bold">{dashboardData.totalProducts ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                            <p className="text-2xl font-bold text-orange-600">{dashboardData.lowStockCount ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Overstocked Items</p>
                            <p className="text-2xl font-bold text-red-600">{dashboardData.overstockedCount ?? 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Low Stock Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Products</CardTitle>
                    <CardDescription>Products that need restocking</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboardData.lowStockProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{product.productName}</p>
                                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="text-orange-600">
                                                {product.quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(product.price)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground">No low stock products</p>
                    )}
                </CardContent>
            </Card>

            {/* Overstocked Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Overstocked Products</CardTitle>
                    <CardDescription>Products with excess inventory</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData.overstockedProducts && dashboardData.overstockedProducts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboardData.overstockedProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{product.productName}</p>
                                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="text-red-600">
                                                {product.quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(product.price)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground">No overstocked products</p>
                    )}
                </CardContent>
            </Card>

            {/* Most Recent Stocktaking */}
            <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Most Recent Stocktaking</CardTitle>
                    <CardDescription>Latest inventory check session</CardDescription>
                </CardHeader>
                <CardContent>
                    {dashboardData.mostRecentStocktaking ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Session Name</p>
                                    <p className="text-lg font-semibold">{dashboardData.mostRecentStocktaking.sessionName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="text-lg font-semibold">{formatDate(dashboardData.mostRecentStocktaking.sessionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge 
                                        variant={dashboardData.mostRecentStocktaking.status === 'COMPLETED' ? 'default' : 'secondary'}
                                        className={dashboardData.mostRecentStocktaking.status === 'COMPLETED' ? 'bg-green-600' : ''}
                                    >
                                        {dashboardData.mostRecentStocktaking.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                                    <p className="text-lg font-semibold">#{dashboardData.mostRecentStocktaking.id}</p>
                                </div>
                            </div>
                            {dashboardData.mostRecentStocktaking.sessionNotes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm">{dashboardData.mostRecentStocktaking.sessionNotes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No stocktaking sessions found</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 