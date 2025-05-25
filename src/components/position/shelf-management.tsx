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

interface Shelf {
    id: string
    name: string
    quantity: any
    producId: string
    shelfId: number
    shelfName: string
    positions: Position[]
}

interface ApiResponse {
    status: number
    message: string
    shelves: Shelf[]
    timestamp: string
}

export function ShelfManagement() {
    const [shelves, setShelves] = useState<Shelf[]>([])
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false)
    const [selectedShelf, setSelectedShelf] = useState<Shelf | null>(null)
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchShelves()
    }, [])

    const fetchShelves = async () => {
        try {
            const token = getAuthToken()
            if (!token) {
                console.log('No authentication token found, redirecting to login...')
                window.location.href = '/login'
                return
            }

            console.log('Fetching shelves...')
            const response = await fetch(`${API_BASE_URL}/api/shelves/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            })
            
            if (!response.ok) {
                const errorText = await response.text()
                console.error('Server response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                })
                
                if (response.status === 401) {
                    console.log('Token expired or invalid, redirecting to login...')
                    window.location.href = '/login'
                    return
                }
                
                throw new Error(`Failed to fetch shelves: ${response.status} ${response.statusText}`)
            }
            
            const data: ApiResponse = await response.json()
            console.log('Raw API Response:', data)
            
            if (data.status === 200) {
                console.log('Setting shelves:', data.shelves)
                setShelves(data.shelves || [])
            } else {
                throw new Error(data.message || 'Failed to fetch shelves')
            }
        } catch (error) {
            console.error('Error fetching shelves:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch shelves",
                variant: "destructive",
            })
        }
    }

    const handleAddShelf = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const token = getAuthToken()
        if (!token) {
            toast({
                title: "Error",
                description: "No authentication token found",
                variant: "destructive",
            })
            return
        }

        const formData = new FormData(event.currentTarget)
        const shelfData = {
            name: String(formData.get('name')),
            productName: String(formData.get('productName')),
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/shelves/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(shelfData),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again')
                }
                throw new Error('Failed to add shelf')
            }
            
            setIsAddDialogOpen(false)
            fetchShelves()
            toast({
                title: "Success",
                description: "Shelf added successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add shelf",
                variant: "destructive",
            })
        }
    }

    const handleEditShelf = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!selectedShelf) return

        const token = getAuthToken()
        if (!token) {
            toast({
                title: "Error",
                description: "No authentication token found",
                variant: "destructive",
            })
            return
        }

        const formData = new FormData(event.currentTarget)
        const shelfData = {
            id: selectedShelf.id,
            code: formData.get('code'),
            area: formData.get('area'),
            capacity: Number(formData.get('capacity')),
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/shelves`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(shelfData),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again')
                }
                throw new Error('Failed to update shelf')
            }
            
            setIsEditDialogOpen(false)
            setSelectedShelf(null)
            fetchShelves()
            toast({
                title: "Success",
                description: "Shelf updated successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update shelf",
                variant: "destructive",
            })
        }
    }

    const handleDeleteShelf = async (id: string) => {
        const token = getAuthToken()
        if (!token) {
            toast({
                title: "Error",
                description: "No authentication token found",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/shelves/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: Please log in again')
                }
                throw new Error('Failed to delete shelf')
            }
            
            fetchShelves()
            toast({
                title: "Success",
                description: "Shelf deleted successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete shelf",
                variant: "destructive",
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Shelves</CardTitle>
                        <CardDescription>Manage warehouse shelves and their capacities</CardDescription>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Shelf
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Shelf</DialogTitle>
                                <DialogDescription>
                                    Create a new shelf in the warehouse
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddShelf} className="space-y-4">
                                <div>
                                    <label htmlFor="name">Name</label>
                                    <Input id="name" name="name" required />
                                    <Input id="productName" name="productName" required />
                                </div>
                                <Button type="submit">Add Shelf</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shelf</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shelves.map((shelf) => {
                            const hasPosition = Array.isArray(shelf.positions) && shelf.positions.length > 0;
                            const position = hasPosition ? shelf.positions[0] : null;

                            return (
                                <TableRow key={shelf.id}>
                                    <TableCell>{shelf.name}</TableCell>
                                    <TableCell>{position?.name || 'N/A'}</TableCell>
                                    <TableCell>{position?.quantity || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedShelf(shelf);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDeleteShelf(shelf.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>

                </Table>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Shelf</DialogTitle>
                            <DialogDescription>
                                Modify shelf details
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditShelf} className="space-y-4">
                            <div>
                                <label htmlFor="edit-code">Code</label>
                                <Input
                                    id="edit-code"
                                    name="code"
                                    defaultValue={selectedShelf?.name}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-area">Area</label>
                                <Input
                                    id="edit-area"
                                    name="area"
                                    defaultValue={selectedShelf?.shelfId}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-capacity">Capacity</label>
                                <Input
                                    id="edit-capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    defaultValue={selectedShelf?.shelfName}
                                    required
                                />
                            </div>
                            <Button type="submit">Update Shelf</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
} 