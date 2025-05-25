"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowUpFromLine, ArrowDownToLine } from "lucide-react"
import { ImportExportDialog } from "./import-export-dialog"
import { transactionService } from "@/services/transactionService"
import { Product, DetailedTransaction, DetailedTransactionProduct } from "@/types/transaction"

interface TransactionItem {
    id: number
    productId: number
    productName: string
    quantity: number
    unitPrice: string
    totalPrice: string
}

interface Transaction {
    id: number
    transactionNumber: string
    type: string
    status: string
    transactionDate: string
    userId: string
    userName: string
    totalAmount: string
    notes: string
    items: TransactionItem[]
    createdAt: string
}

interface SelectedProduct {
    product: Product
    quantity: number
}

export function TransactionsTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [detailedTransaction, setDetailedTransaction] = useState<DetailedTransaction | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    console.error('No authentication token found')
                    return
                }

                // Try the new API endpoint first
                try {
                    const response = await transactionService.getAllTransactions()
                    if (response.status === 200) {
                        setTransactions(response.transactions.map(t => ({
                            id: t.id,
                            transactionNumber: t.transactionNumber,
                            type: t.transactionType,
                            status: 'COMPLETED',
                            transactionDate: t.transactionDate,
                            userId: '',
                            userName: 'System',
                            totalAmount: t.totalAmount.toString(),
                            notes: '',
                            items: [],
                            createdAt: t.transactionDate
                        })))
                        return
                    }
                } catch (newApiError) {
                    console.log('New API not available, falling back to old API')
                }

                // Fallback to old API
                const response = await fetch('http://localhost:8080/api/transactions/all-transactions', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (data.status === 200) {
                    setTransactions(data.transactions)
                }
            } catch (error) {
                console.error('Error fetching transactions:', error)
            }
        }

        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    console.error('No authentication token found')
                    return
                }

                const response = await fetch('http://localhost:8080/api/v1/product/getAll', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (data && data.products) {
                    setProducts(data.products)
                } else if (Array.isArray(data)) {
                    // In case the response is directly an array of products
                    setProducts(data)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            }
        }

        fetchTransactions()
        fetchProducts()
    }, [])

    const handleTransactionClick = async (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsModalOpen(true)
        setIsLoadingDetails(true)
        setDetailedTransaction(null)
        
        try {
            const response = await transactionService.getDetailedTransactionById(transaction.id)
            if (response.status === 200) {
                setDetailedTransaction(response.data)
            }
        } catch (error) {
            console.error('Error fetching transaction details:', error)
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const handleProductSelect = (product: Product, checked: boolean) => {
        if (checked) {
            setSelectedProducts(prev => [...prev, { product, quantity: 1 }])
        } else {
            setSelectedProducts(prev => prev.filter(p => p.product.id !== product.id))
        }
    }

    const handleQuantityChange = (productId: number, quantity: number) => {
        setSelectedProducts(prev => prev.map(item => 
            item.product.id === productId 
                ? { ...item, quantity: quantity } 
                : item
        ))
    }

    const handleAddTransaction = async () => {
        try {
            setError(null) // Clear any previous errors
            const token = localStorage.getItem('token')
            if (!token) {
                console.error('No authentication token found')
                return
            }

            const transactionItems = selectedProducts.map(({ product, quantity }) => ({
                productId: product.id,
                quantity: quantity,
                unitPrice: product.price.toString(),
                totalPrice: (product.price * quantity).toString()
            }))

            const totalAmount = transactionItems.reduce(
                (sum, item) => sum + parseFloat(item.totalPrice), 
                0
            ).toString()

            const transaction = {
                type: "SALE",
                items: transactionItems,
                totalAmount: totalAmount,
                notes: "Multiple items sale"
            }

            const response = await fetch('http://localhost:8080/api/transactions/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transaction)
            })

            const data = await response.json()
            if (data.status === 200) {
                setIsAddTransactionOpen(false)
                setSelectedProducts([])
                // Refresh transactions list
                const transactionsResponse = await fetch('http://localhost:8080/api/transactions/all-transactions', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const transactionsData = await transactionsResponse.json()
                if (transactionsData.status === 200) {
                    setTransactions(transactionsData.transactions)
                }
            } else if (data.error && data.error.includes("Insufficient stock")) {
                setError(data.error)
            } else {
                setError("Not enough stock for the selected products")
            }
        } catch (error) {
            console.error('Error creating transaction:', error)
            setError("An error occurred while creating the transaction")
        }
    }

    const refreshTransactions = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.error('No authentication token found')
                return
            }

            // Try the new API endpoint first
            try {
                const response = await transactionService.getAllTransactions()
                if (response.status === 200) {
                    setTransactions(response.transactions.map(t => ({
                        id: t.id,
                        transactionNumber: t.transactionNumber,
                        type: t.transactionType,
                        status: 'COMPLETED',
                        transactionDate: t.transactionDate,
                        userId: '',
                        userName: 'System',
                        totalAmount: t.totalAmount.toString(),
                        notes: '',
                        items: [],
                        createdAt: t.transactionDate
                    })))
                    return
                }
            } catch (newApiError) {
                console.log('New API not available, falling back to old API')
            }

            // Fallback to old API
            const response = await fetch('http://localhost:8080/api/transactions/all-transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            if (data.status === 200) {
                setTransactions(data.transactions)
            }
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }

    const handleImportExportSuccess = () => {
        refreshTransactions()
    }

    return (
        <div className="w-full space-y-4">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">
                        Manage inventory imports, exports, and sales transactions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportDialogOpen(true)}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    >
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsExportDialogOpen(true)}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Username</TableHead>
                        <TableHead className="text-center">Total Amount</TableHead>
                        <TableHead className="text-center">Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow
                            key={transaction.id}
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleTransactionClick(transaction)}
                        >
                            <TableCell className="text-center">
                                <Badge variant="outline">{transaction.type}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge 
                                    variant={transaction.status === "COMPLETED" ? "secondary" : "default"}
                                >
                                    {transaction.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center">{transaction.userName}</TableCell>
                            <TableCell className="text-center">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(transaction.totalAmount))}</TableCell>
                            <TableCell className="text-center">{transaction.notes}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Transaction Details - {selectedTransaction?.transactionNumber}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {isLoadingDetails ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-muted-foreground">Loading transaction details...</div>
                            </div>
                        ) : detailedTransaction ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <span className="font-semibold">Transaction Type:</span> {detailedTransaction.transactionType}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Transaction Date:</span> {new Date(detailedTransaction.transactionDate).toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Total Amount:</span> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailedTransaction.totalAmount)}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {detailedTransaction.products.map((product, index) => (
                                        <div key={`${product.productId}-${index}`} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <span className="font-semibold">Product Name:</span> {product.productName}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Quantity:</span> {product.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-muted-foreground">Failed to load transaction details</div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-4">
                            {products.map((product) => (
                                <div key={product.id} className="flex items-center gap-4">
                                    <Checkbox
                                        id={`product-${product.id}`}
                                        checked={selectedProducts.some(p => p.product.id === product.id)}
                                        onCheckedChange={(checked) => handleProductSelect(product, checked as boolean)}
                                    />
                                    <Label htmlFor={`product-${product.id}`} className="flex-1">
                                        {product.productName}
                                    </Label>
                                    {selectedProducts.some(p => p.product.id === product.id) && (
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`quantity-${product.id}`}>Quantity:</Label>
                                            <Input
                                                id={`quantity-${product.id}`}
                                                type="number"
                                                className="w-20"
                                                value={selectedProducts.find(p => p.product.id === product.id)?.quantity ?? 0}
                                                onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddTransaction} disabled={selectedProducts.length === 0}>
                                Create Transaction
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Import/Export Dialogs */}
            <ImportExportDialog
                isOpen={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                type="IMPORT"
                onSuccess={handleImportExportSuccess}
            />

            <ImportExportDialog
                isOpen={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
                type="EXPORT"
                onSuccess={handleImportExportSuccess}
            />
        </div>
    )
} 