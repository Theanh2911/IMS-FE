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

interface TopProduct {
    productName: string
    totalQuantity: number
    totalRevenue: string
}

interface TopSeller {
    userName: string
    totalTransactions: number
    totalRevenue: string
}

interface DashboardMetrics {
    totalRevenue: string
    totalTransactions: number
    averageTransactionValue: string
    topProducts: TopProduct[]
    topSellers: TopSeller[]
}

export function MetricsCards() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    console.error('No authentication token found')
                    return
                }

                const response = await fetch('http://localhost:8080/api/dashboard/metrics', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (data.status === 200) {
                    setMetrics(data.metrics)
                }
            } catch (error) {
                console.error('Error fetching metrics:', error)
            }
        }

        fetchMetrics()
    }, [])

    if (!metrics) {
        return <div>Loading metrics...</div>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Total and average transaction values</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(metrics.totalRevenue))}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                            <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Average Transaction Value</p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(metrics.averageTransactionValue))}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Best Selling Products</CardTitle>
                    <CardDescription>Products with highest sales volume</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.topProducts.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell>{product.productName}</TableCell>
                                    <TableCell className="text-right">{product.totalQuantity}</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.totalRevenue))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Top Sellers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Sellers</CardTitle>
                    <CardDescription>Users with highest sales</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Transactions</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.topSellers.map((seller, index) => (
                                <TableRow key={index}>
                                    <TableCell>{seller.userName}</TableCell>
                                    <TableCell className="text-right">{seller.totalTransactions}</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(seller.totalRevenue))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
} 