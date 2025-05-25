"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { PlusIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Product {
    id: number;
    productName: string;
    price: number;
    quantity: number;
    category: string;
    supplier: string;
}

interface FormData {
    name: string;
    stockQuantity: string;
    price: string;
    supplier: string;
    category: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        stockQuantity: "",
        price: "",
        supplier: "",
        category: ""
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/v1/product/getAll', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            // Success if we have products data and status is 200
            if (data && data.products && data.status === 200) {
                setProducts(data.products);
                setError(null);
            } else {
                throw new Error(data.message || "Failed to fetch product data");
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : "An error occurred while fetching products");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductClick = (product: Product) => {
        setFormData({
            name: product.productName,
            stockQuantity: product.quantity.toString(),
            price: product.price.toString(),
            supplier: product.supplier,
            category: product.category
        });
        setSelectedProductId(product.id.toString());
        setIsEditMode(true);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = isEditMode 
                ? `http://localhost:8080/api/v1/product/${selectedProductId}`
                : 'http://localhost:8080/api/v1/product';
            
            const body = {
                productName: formData.name,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.stockQuantity),
                category: formData.category,
                supplier: formData.supplier
            };

            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            // Success if we have data and no error message
            if (data && !data.error) {
                setIsDialogOpen(false);
                fetchProducts();
                setFormData({
                    name: "",
                    stockQuantity: "",
                    price: "",
                    supplier: "",
                    category: ""
                });
                setIsEditMode(false);
                setSelectedProductId(null);
                setError(null);
            } else {
                throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : "An error occurred while processing your request");
        }
    };

    const handleDelete = async () => {
        if (!selectedProductId) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/v1/product/${selectedProductId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data && !data.error) {
                setIsDialogOpen(false);
                fetchProducts();
                setFormData({
                    name: "",
                    stockQuantity: "",
                    price: "",
                    supplier: "",
                    category: ""
                });
                setIsEditMode(false);
                setSelectedProductId(null);
                setError(null);
            } else {
                throw new Error(data.message || "Failed to delete product");
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : "An error occurred while deleting the product");
        }
    };

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <p>Loading product data...</p>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center p-8 text-red-500">
                                <p>{error}</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableCaption>A list of products</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center">ID</TableHead>
                                            <TableHead className="w-[200px] text-center">Product Name</TableHead>
                                            <TableHead className="w-[100px] text-center">Price</TableHead>
                                            <TableHead className="w-[100px] text-center">Quantity</TableHead>
                                            <TableHead className="w-[150px] text-center">Category</TableHead>
                                            <TableHead className="w-[150px] text-center">Supplier</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow 
                                                key={product.id} 
                                                className="cursor-pointer hover:bg-gray-100"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <TableCell className="text-center">{product.id}</TableCell>
                                                <TableCell className="font-medium text-center">{product.productName}</TableCell>
                                                <TableCell className="text-center">{product.price.toLocaleString('vi-VN')} VND</TableCell>
                                                <TableCell className="text-center">{product.quantity}</TableCell>
                                                <TableCell className="text-center">{product.category}</TableCell>
                                                <TableCell className="text-center">{product.supplier}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                    if (!open) {
                                        setIsEditMode(false);
                                        setSelectedProductId(null);
                                        setFormData({
                                            name: "",
                                            stockQuantity: "",
                                            price: "",
                                            supplier: "",
                                            category: ""
                                        });
                                    }
                                    setIsDialogOpen(open);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            className="fixed bottom-8 right-8"
                                            size="lg"
                                        >
                                            Add Product
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Product Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                                                <Input
                                                    id="stockQuantity"
                                                    name="stockQuantity"
                                                    type="number"
                                                    value={formData.stockQuantity}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="price">Price</Label>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="supplier">Supplier</Label>
                                                <Input
                                                    id="supplier"
                                                    name="supplier"
                                                    value={formData.supplier}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Input
                                                    id="category"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4">
                                                {isEditMode && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={handleDelete}
                                                    >
                                                        Delete Product
                                                    </Button>
                                                )}
                                                <div className="flex-1"></div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit">
                                                    {isEditMode ? 'Update Product' : 'Add Product'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
} 