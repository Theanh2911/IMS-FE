"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2 } from "lucide-react"

const API_BASE_URL = 'http://localhost:8080'

// Add token retrieval function
const getAuthToken = () => {
    return localStorage.getItem('token')
}

interface Position {
    id: number
    name: string
    quantity: number
    productId: number
    shelfId: number
    productName: string
    shelfName: string
}

interface ApiResponse {
    status: number
    message: string
    position: Position
}

interface ApiListResponse {
    status: number
    message: string
    positions: Position[]
}

interface FilterState {
    type: 'all' | 'empty' | 'by-product' | 'by-shelf' | 'occupied-shelf'
    productId?: string
    shelfId?: string
}

export function ProductLocationManagement() {
    const [positions, setPositions] = useState<Position[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
    const [filter, setFilter] = useState<FilterState>({ type: 'all' })
    const { toast } = useToast()

    useEffect(() => {
        fetchPositions()
    }, [filter])

    const fetchPositions = async () => {
        try {
            const token = getAuthToken()
            if (!token) {
                console.log('No authentication token found, redirecting to login...')
                window.location.href = '/login'
                return
            }

            let endpoint = `${API_BASE_URL}/api/positions/`
            
            switch (filter.type) {
                case 'empty':
                    endpoint += 'empty'
                    break
                case 'by-product':
                    if (filter.productId) {
                        endpoint += `product/${filter.productId}`
                    }
                    break
                case 'by-shelf':
                    if (filter.shelfId) {
                        endpoint += `shelf/${filter.shelfId}`
                    }
                    break
                case 'occupied-shelf':
                    if (filter.shelfId) {
                        endpoint += `shelf/${filter.shelfId}/occupied`
                    }
                    break
                default:
                    endpoint += 'all'
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired or invalid, redirecting to login...')
                    window.location.href = '/login'
                    return
                }
                throw new Error('Failed to fetch positions')
            }
            
            const data: ApiListResponse = await response.json()
            if (data.status === 200) {
                setPositions(data.positions)
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch positions",
                variant: "destructive",
            })
        }
    }

    const handleAddPosition = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const token = getAuthToken()
        if (!token) {
            console.log('No authentication token found, redirecting to login...')
            window.location.href = '/login'
            return
        }

        const formData = new FormData(event.currentTarget)
        const positionData = {
            name: formData.get('name'),
            productId: Number(formData.get('productId')),
            shelfId: Number(formData.get('shelfId')),
            quantity: Number(formData.get('quantity')),
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/positions/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(positionData),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired or invalid, redirecting to login...')
                    window.location.href = '/login'
                    return
                }
                throw new Error('Failed to add position')
            }

            const data: ApiResponse = await response.json()
            if (data.status === 200) {
                setIsAddDialogOpen(false)
                fetchPositions()
                toast({
                    title: "Success",
                    description: "Position added successfully",
                })
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add position",
                variant: "destructive",
            })
        }
    }

    const handleUpdateQuantity = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedPosition) return

        const token = getAuthToken()
        if (!token) {
            console.log('No authentication token found, redirecting to login...')
            window.location.href = '/login'
            return
        }

        const formData = new FormData(event.currentTarget)
        const quantity = Number(formData.get('quantity'))

        try {
            const response = await fetch(`${API_BASE_URL}/api/positions/${selectedPosition.id}/quantity`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity }),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired or invalid, redirecting to login...')
                    window.location.href = '/login'
                    return
                }
                throw new Error('Failed to update quantity')
            }

            const data: ApiResponse = await response.json()
            if (data.status === 200) {
                setIsEditDialogOpen(false)
                setSelectedPosition(null)
                fetchPositions()
                toast({
                    title: "Success",
                    description: "Quantity updated successfully",
                })
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update quantity",
                variant: "destructive",
            })
        }
    }

    const handleDeletePosition = async (id: number) => {
        const token = getAuthToken()
        if (!token) {
            console.log('No authentication token found, redirecting to login...')
            window.location.href = '/login'
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/positions/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Token expired or invalid, redirecting to login...')
                    window.location.href = '/login'
                    return
                }
                throw new Error('Failed to delete position')
            }

            const data: ApiResponse = await response.json()
            if (data.status === 200) {
                fetchPositions()
                toast({
                    title: "Success",
                    description: "Position deleted successfully",
                })
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete position",
                variant: "destructive",
            })
        }
    }

    const handleFilterChange = (type: FilterState['type']) => {
        setFilter({ type })
    }

    const handleShelfFilterChange = (shelfId: string) => {
        setFilter({ type: 'by-shelf', shelfId })
    }

    const handleProductFilterChange = (productId: string) => {
        setFilter({ type: 'by-product', productId })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Product Locations</CardTitle>
                        <CardDescription>Manage product positions in warehouse</CardDescription>
                    </div>
                    <div className="flex gap-4">
                        <Select 
                            value={filter.type} 
                            onValueChange={(value: FilterState['type']) => handleFilterChange(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter positions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                <SelectItem value="empty">Empty Positions</SelectItem>
                                <SelectItem value="by-product">By Product</SelectItem>
                                <SelectItem value="by-shelf">By Shelf</SelectItem>
                                <SelectItem value="occupied-shelf">Occupied Positions</SelectItem>
                            </SelectContent>
                        </Select>

                        {(filter.type === 'by-product' || filter.type === 'by-shelf') && (
                            <Input
                                placeholder={filter.type === 'by-product' ? "Enter Product ID" : "Enter Shelf ID"}
                                onChange={(e) => {
                                    if (filter.type === 'by-product') {
                                        handleProductFilterChange(e.target.value)
                                    } else {
                                        handleShelfFilterChange(e.target.value)
                                    }
                                }}
                                className="w-[200px]"
                            />
                        )}

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Position
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Position</DialogTitle>
                                    <DialogDescription>
                                        Assign a product to a shelf position
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddPosition} className="space-y-4">
                                    <div>
                                        <label htmlFor="name">Position Name</label>
                                        <Input id="name" name="name" required />
                                    </div>
                                    <div>
                                        <label htmlFor="productId">Product ID</label>
                                        <Input 
                                            id="productId" 
                                            name="productId" 
                                            type="number"
                                            min="1"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="shelfId">Shelf ID</label>
                                        <Input 
                                            id="shelfId" 
                                            name="shelfId" 
                                            type="number"
                                            min="1"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="quantity">Quantity</label>
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <Button type="submit">Add Position</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Shelf</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No positions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            positions.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{position.productName}</div>
                                            <div className="text-sm text-gray-500">ID: {position.productId}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{position.shelfName}</div>
                                            <div className="text-sm text-gray-500">ID: {position.shelfId}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{position.name}</div>
                                            <div className="text-sm text-gray-500">{position.quantity} units</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedPosition(position)
                                                    setIsEditDialogOpen(true)
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeletePosition(position.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            {selectedPosition && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Quantity</DialogTitle>
                            <DialogDescription>
                                Update product quantity in this position
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateQuantity} className="space-y-4">
                            <div>
                                <label htmlFor="edit-quantity">Quantity</label>
                                <Input
                                    id="edit-quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    defaultValue={selectedPosition.quantity}
                                    required
                                />
                            </div>
                            <Button type="submit">Update Quantity</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    )
} 