"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { transactionService } from "@/services/transactionService"
import { Product, TransactionFormData } from "@/types/transaction"

interface ImportExportDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    type: 'IMPORT' | 'EXPORT'
    onSuccess: () => void
}

export function ImportExportDialog({ 
    isOpen, 
    onOpenChange, 
    type,
    onSuccess 
}: ImportExportDialogProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [formData, setFormData] = useState<TransactionFormData>({
        productId: 0,
        quantity: 0,
        notes: '',
        transactionType: type
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchProducts()
            setFormData(prev => ({ ...prev, transactionType: type }))
        }
    }, [isOpen, type])

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('No authentication token found')
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
            setError('Failed to fetch products')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const requestData = {
                productId: formData.productId,
                quantity: formData.quantity,
                notes: formData.notes
            }

            let response;
            if (type === 'IMPORT') {
                response = await transactionService.importProduct(requestData)
            } else {
                response = await transactionService.exportProduct(requestData)
            }

            if (response.status === 200) {
                setSuccess(response.message)
                setFormData({
                    productId: 0,
                    quantity: 0,
                    notes: '',
                    transactionType: type
                })
                onSuccess()
                // Close dialog after 2 seconds
                setTimeout(() => {
                    onOpenChange(false)
                    setSuccess(null)
                }, 2000)
            } else {
                setError(response.message || `Failed to ${type.toLowerCase()} product`)
            }
        } catch (error: any) {
            setError(error.message || `An error occurred while ${type.toLowerCase()}ing the product`)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFormData({
            productId: 0,
            quantity: 0,
            notes: '',
            transactionType: type
        })
        setError(null)
        setSuccess(null)
    }

    const selectedProduct = products.find(p => p.id === formData.productId)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'IMPORT' ? 'Import Product' : 'Export Product'}
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success</AlertTitle>
                            <AlertDescription className="text-green-700">{success}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>
                        <Select
                            value={formData.productId === 0 ? '' : formData.productId.toString()}
                            onValueChange={(value) => setFormData(prev => ({ 
                                ...prev, 
                                productId: parseInt(value) 
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.productName} (Stock: {product.quantity})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProduct && type === 'EXPORT' && (
                        <div className="text-sm text-muted-foreground">
                            Available stock: {selectedProduct.quantity}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={type === 'EXPORT' ? selectedProduct?.quantity : undefined}
                            value={formData.quantity === 0 ? '' : formData.quantity}
                            onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 
                            }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={type === 'IMPORT' ? 'e.g., New stock arrival' : 'e.g., Customer order'}
                            value={formData.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ 
                                ...prev, 
                                notes: e.target.value 
                            }))}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleReset}
                            disabled={loading}
                        >
                            Reset
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || formData.productId === 0 || formData.quantity === 0}
                        >
                            {loading ? 'Processing...' : (type === 'IMPORT' ? 'Import' : 'Export')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 