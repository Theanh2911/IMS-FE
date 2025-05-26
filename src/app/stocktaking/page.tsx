"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { AdminGuard } from "@/components/auth/admin-guard"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { PlusIcon, CheckIcon, XIcon, ArrowRightIcon, EditIcon, TrashIcon } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

interface Product {
    id: number;
    productName: string;
    price: number;
    quantity: number;
    category: string;
    supplier: string;
}

interface StocktakingSession {
    id: number;
    sessionName: string;
    sessionDate: string;
    sessionNotes: string;
    status: 'ACTIVE' | 'COMPLETED';
    products: StocktakingProduct[];
    isLocal?: boolean; // Flag to indicate if this is a local session not yet saved to backend
}

interface StocktakingProduct {
    productId: number;
    productName: string;
    currentQuantity: number;
    countedQuantity: number | null;
    discrepancy: number | null;
    category: string;
    supplier: string;
}

interface SessionProduct {
    id: number;
    productId: number;
    productName: string;
    category: string;
    supplier: string;
    currentQuantity: number;
    countedQuantity: number | null;
    discrepancy: number | null;
}

export default function StocktakingPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [sessions, setSessions] = useState<StocktakingSession[]>([]);
    const [currentSession, setCurrentSession] = useState<StocktakingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
    const [isEditSessionDialogOpen, setIsEditSessionDialogOpen] = useState(false);
    const [isSessionDetailsDialogOpen, setIsSessionDetailsDialogOpen] = useState(false);
    const [isCancelSessionDialogOpen, setIsCancelSessionDialogOpen] = useState(false);
    const [selectedSessionProducts, setSelectedSessionProducts] = useState<SessionProduct[]>([]);
    const [selectedSessionInfo, setSelectedSessionInfo] = useState<StocktakingSession | null>(null);
    const [cancelledSessionIds, setCancelledSessionIds] = useState<number[]>([]);
    const [sessionForm, setSessionForm] = useState({
        sessionName: "",
        sessionNotes: ""
    });



    useEffect(() => {
        const storedCancelledIds = localStorage.getItem('cancelledSessionIds');
        if (storedCancelledIds) {
            setCancelledSessionIds(JSON.parse(storedCancelledIds));
        }

        fetchProductsInStock();
        fetchActiveSession();
        fetchAllSessions();
    }, []);

    const fetchProductsInStock = async () => {
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

    const fetchActiveSession = async () => {
        try {
            // If we already have a local session, don't fetch from backend
            if (currentSession && currentSession.isLocal) {
                return;
            }

            const token = localStorage.getItem('token');

            const storedCancelledIds = localStorage.getItem('cancelledSessionIds');
            const currentCancelledIds = storedCancelledIds ? JSON.parse(storedCancelledIds) : [];

            const response = await fetch('http://localhost:8080/api/v1/stocktaking/sessions/active', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data && data.status === 200 && data.data) {
                // Check if this session has been cancelled locally
                if (!currentCancelledIds.includes(data.data.id)) {
                    setCurrentSession(data.data);
                }
            } else {
                const allSessionsResponse = await fetch('http://localhost:8080/api/v1/stocktaking/getAllSessions', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const allSessionsData = await allSessionsResponse.json();
                if (allSessionsData && allSessionsData.status === 200 && allSessionsData.data) {
                    const activeSession = allSessionsData.data.find((session: StocktakingSession) => 
                        session.status === 'ACTIVE' && !currentCancelledIds.includes(session.id)
                    );
                    if (activeSession) {
                        setCurrentSession(activeSession);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching active session:', err);
        }
    };

    const fetchAllSessions = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/v1/stocktaking/getAllSessions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data && data.status === 200) {
                setSessions(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setSessions([]);
        }
    };

    const fetchSessionDetails = async (sessionId: number) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data && data.status === 200) {
                return data.data;
            }
            throw new Error(data.message || "Failed to fetch session details");
        } catch (err) {
            console.error('Error fetching session details:', err);
            throw err;
        }
    };

    const fetchSessionProducts = async (sessionId: number) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/stocktaking-products/session/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data && data.status === 200) {
                return data.data;
            }
            throw new Error(data.message || "Failed to fetch session products");
        } catch (err) {
            console.error('Error fetching session products:', err);
            throw err;
        }
    };

    const createNewSession = async () => {
        if (!sessionForm.sessionName.trim()) return;

        try {
            console.log('Creating local session:', {
                sessionName: sessionForm.sessionName,
                sessionNotes: sessionForm.sessionNotes
            });

            const localSession: StocktakingSession = {
                id: Date.now(),
                sessionName: sessionForm.sessionName,
                sessionNotes: sessionForm.sessionNotes,
                sessionDate: new Date().toISOString(),
                status: 'ACTIVE',
                isLocal: true,
                products: products.map(product => ({
                    productId: product.id,
                    productName: product.productName,
                    category: product.category,
                    supplier: product.supplier,
                    currentQuantity: product.quantity,
                    countedQuantity: null,
                    discrepancy: null
                }))
            };

            setCurrentSession(localSession);
            setIsNewSessionDialogOpen(false);
            setSessionForm({
                sessionName: "",
                sessionNotes: ""
            });
            setError(null);
            
            console.log('Local session created successfully');
        } catch (err) {
            console.error('Error creating local session:', err);
            setError(err instanceof Error ? err.message : "An error occurred while creating session");
        }
    };

    const updateSession = async () => {
        if (!currentSession || !sessionForm.sessionName.trim()) return;

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${currentSession.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionName: sessionForm.sessionName,
                    sessionNotes: sessionForm.sessionNotes
                })
            });

            const data = await response.json();

            if (data && data.status === 200) {
                await fetchActiveSession();
                await fetchAllSessions();
                setIsEditSessionDialogOpen(false);
                setError(null);
            } else {
                throw new Error(data.message || "Failed to update session");
            }
        } catch (err) {
            console.error('Error updating session:', err);
            setError(err instanceof Error ? err.message : "An error occurred while updating session");
        }
    };

    const updateCountedQuantity = async (productId: number, countedQuantity: number) => {
        if (!currentSession) return;

        try {
            if (currentSession.isLocal) {
                const updatedSession = {
                    ...currentSession,
                    products: currentSession.products.map(product => {
                        if (product.productId === productId) {
                            const discrepancy = countedQuantity - product.currentQuantity;
                            return {
                                ...product,
                                countedQuantity,
                                discrepancy
                            };
                        }
                        return product;
                    })
                };
                setCurrentSession(updatedSession);
                setError(null);
                console.log('Updated local product count:', productId, countedQuantity);
            } else {
                const token = localStorage.getItem('token');

                const response = await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${currentSession.id}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        countedQuantity: countedQuantity
                    })
                });

                const data = await response.json();

                if (data && data.status === 200) {
                    const updatedSession = {
                        ...currentSession,
                        products: currentSession.products.map(product => {
                            if (product.productId === productId) {
                                const discrepancy = countedQuantity - product.currentQuantity;
                                return {
                                    ...product,
                                    countedQuantity,
                                    discrepancy
                                };
                            }
                            return product;
                        })
                    };
                    setCurrentSession(updatedSession);
                    setError(null);
                } else {
                    throw new Error(data.message || "Failed to update product count");
                }
            }
        } catch (err) {
            console.error('Error updating product count:', err);
            setError(err instanceof Error ? err.message : "An error occurred while updating product count");
        }
    };

    const completeSession = async () => {
        if (!currentSession) return;

        try {
            const token = localStorage.getItem('token');

            if (currentSession.isLocal) {
                // First, create the session in the backend
                console.log('Saving local session to backend:', currentSession);
                
                const createResponse = await fetch('http://localhost:8080/api/v1/stocktaking/createSession', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionName: currentSession.sessionName,
                        sessionNotes: currentSession.sessionNotes
                    })
                });

                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`Failed to create session: HTTP ${createResponse.status}: ${errorText}`);
                }

                const createData = await createResponse.json();
                
                if (!createData || createData.status !== 200) {
                    throw new Error(createData?.message || "Failed to create session");
                }

                const backendSession = createData.data;
                console.log('Session created in backend:', backendSession);

                for (const product of currentSession.products) {
                    if (product.countedQuantity !== null) {
                        await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${backendSession.id}/products/${product.productId}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                countedQuantity: product.countedQuantity
                            })
                        });
                    }
                }

                const completeResponse = await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${backendSession.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionName: currentSession.sessionName,
                        sessionNotes: currentSession.sessionNotes,
                        status: 'COMPLETED'
                    })
                });

                const completeData = await completeResponse.json();

                if (completeData && completeData.status === 200) {
                    setCurrentSession(null);
                    fetchAllSessions();
                    setError(null);
                    console.log('Local session saved and completed successfully');
                } else {
                    throw new Error(completeData.message || "Failed to complete session");
                }
            } else {
                const response = await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${currentSession.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionName: currentSession.sessionName,
                        sessionNotes: currentSession.sessionNotes,
                        status: 'COMPLETED'
                    })
                });

                const data = await response.json();

                if (data && data.status === 200) {
                    setCurrentSession(null);
                    fetchAllSessions();
                    setError(null);
                } else {
                    throw new Error(data.message || "Failed to complete session");
                }
            }
        } catch (err) {
            console.error('Error completing session:', err);
            setError(err instanceof Error ? err.message : "An error occurred while completing session");
        }
    };

    const deleteSession = async (sessionId: number) => {
        try {
            const token = localStorage.getItem('token');
            console.log('Deleting session with ID:', sessionId);

            const response = await fetch(`http://localhost:8080/api/v1/stocktaking/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Delete response status:', response.status);
            console.log('Delete response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Delete response data:', data);

            if (data && data.status === 200) {
                fetchAllSessions();
                if (currentSession && currentSession.id === sessionId) {
                    setCurrentSession(null);
                }
                setError(null);
            } else {
                throw new Error(data.message || "Failed to delete session");
            }
        } catch (err) {
            console.error('Error deleting session:', err);
            throw err;
        }
    };

    const openEditDialog = () => {
        if (currentSession) {
            setSessionForm({
                sessionName: currentSession.sessionName,
                sessionNotes: currentSession.sessionNotes
            });
            setIsEditSessionDialogOpen(true);
        }
    };

    const getDiscrepancySummary = () => {
        if (!currentSession) return { total: 0, positive: 0, negative: 0, missing: 0 };

        return currentSession.products.reduce((acc, product) => {
            if (product.countedQuantity === null) {
                acc.missing++;
            } else if (product.discrepancy! > 0) {
                acc.positive++;
            } else if (product.discrepancy! < 0) {
                acc.negative++;
            }
            acc.total++;
            return acc;
        }, { total: 0, positive: 0, negative: 0, missing: 0 });
    };

    const getStatusBadge = (product: StocktakingProduct) => {
        if (product.countedQuantity === null) {
            return <Badge variant="secondary">Not Counted</Badge>;
        } else if (product.discrepancy === 0) {
            return <Badge variant="default" className="bg-green-500">Correct</Badge>;
        } else if (product.discrepancy! > 0) {
            return <Badge variant="default" className="bg-blue-500">Surplus +{product.discrepancy}</Badge>;
        } else {
            return <Badge variant="destructive">Shortage {product.discrepancy}</Badge>;
        }
    };

    const handleSessionRowClick = async (session: StocktakingSession) => {
        try {
            const products = await fetchSessionProducts(session.id);
            setSelectedSessionProducts(products);
            setSelectedSessionInfo(session);
            setIsSessionDetailsDialogOpen(true);
        } catch (err) {
            console.error('Error fetching session products:', err);
            setError(err instanceof Error ? err.message : "Failed to fetch session products");
        }
    };

    const cancelCurrentSession = async () => {
        if (!currentSession) return;

        try {
            console.log('Cancelling session locally:', currentSession.id);
            
            // Add session ID to cancelled list
            const newCancelledIds = [...cancelledSessionIds, currentSession.id];
            setCancelledSessionIds(newCancelledIds);
            
            // Save to localStorage for persistence
            localStorage.setItem('cancelledSessionIds', JSON.stringify(newCancelledIds));
            
            // Reset local state
            setCurrentSession(null);
            setIsCancelSessionDialogOpen(false);
            setError(null);
            
            console.log('Session cancelled successfully');
        } catch (err) {
            console.error('Error cancelling session:', err);
            setError("Failed to cancel session");
            setIsCancelSessionDialogOpen(false);
        }
    };

    if (loading) {
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
                    <div className="flex flex-1 flex-col items-center justify-center p-8">
                        <p>Loading stocktaking data...</p>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (error) {
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
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-red-500">
                        <p>{error}</p>
                        <Button
                            className="mt-4"
                            onClick={() => {
                                setError(null);
                                fetchProductsInStock();
                                fetchActiveSession();
                                fetchAllSessions();
                            }}
                        >
                            Retry
                        </Button>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <AdminGuard
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                        <p className="text-gray-600"></p>
                    </div>
                </div>
            }
        >
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
                <div className="flex flex-1 flex-col p-6">
                    <div className="@container/main flex flex-1 flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">Stocktaking</h1>
                                <p className="text-muted-foreground">Create and manage inventory count sessions</p>
                            </div>
                            {!currentSession && (
                                <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            New Session
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Stocktaking Session</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sessionName">Session Name</Label>
                                                <Input
                                                    id="sessionName"
                                                    value={sessionForm.sessionName}
                                                    onChange={(e) => setSessionForm({...sessionForm, sessionName: e.target.value})}
                                                    placeholder="e.g., Monthly Count - January 2024"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="sessionNotes">Notes (Optional)</Label>
                                                <Textarea
                                                    id="sessionNotes"
                                                    value={sessionForm.sessionNotes}
                                                    onChange={(e) => setSessionForm({...sessionForm, sessionNotes: e.target.value})}
                                                    placeholder="Any additional information about this count..."
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsNewSessionDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button onClick={createNewSession}>
                                                    Create Session
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        {/* Active Session */}
                        {currentSession && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            {currentSession.sessionName}
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="default" className={currentSession.isLocal ? "bg-orange-500" : "bg-blue-500"}>
                                                    {currentSession.isLocal ? "Local" : "Active"}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={openEditDialog}
                                                >
                                                    <EditIcon className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setIsCancelSessionDialogOpen(true)}
                                                >
                                                    <XIcon className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={completeSession}
                                                >
                                                    <CheckIcon className="w-4 h-4 mr-2" />
                                                    Complete Session
                                                </Button>
                                            </div>
                                        </CardTitle>
                                        <CardDescription>
                                            Started: {new Date(currentSession.sessionDate).toLocaleDateString()} at {new Date(currentSession.sessionDate).toLocaleTimeString()}
                                            {currentSession.sessionNotes && (
                                                <div className="mt-2 text-sm">
                                                    <strong>Notes:</strong> {currentSession.sessionNotes}
                                                </div>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {(() => {
                                        const summary = getDiscrepancySummary();
                                        return (
                                            <>
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="text-2xl font-bold">{summary.total}</div>
                                                        <p className="text-xs text-muted-foreground">Total Products</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="text-2xl font-bold text-green-600">{summary.total - summary.missing}</div>
                                                        <p className="text-xs text-muted-foreground">Counted</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="text-2xl font-bold text-blue-600">{summary.positive}</div>
                                                        <p className="text-xs text-muted-foreground">Surplus Items</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-6">
                                                        <div className="text-2xl font-bold text-red-600">{summary.negative}</div>
                                                        <p className="text-xs text-muted-foreground">Shortage Items</p>
                                                    </CardContent>
                                                </Card>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Product Count Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Count</CardTitle>
                                        <CardDescription>Enter the counted quantity for each product</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-center min-w-[120px]">Product Name</TableHead>
                                                    <TableHead className="text-center">Category</TableHead>
                                                    <TableHead className="text-center">Current Stock</TableHead>
                                                    <TableHead className="text-center">Counted Quantity</TableHead>
                                                    <TableHead className="text-center">Difference</TableHead>
                                                    <TableHead className="text-center">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentSession.products && currentSession.products.map((product) => (
                                                    <TableRow key={product.productId}>
                                                        <TableCell className="font-medium text-center min-w-[120px]">
                                                            <div>
                                                                <div>{product.productName}</div>
                                                                <div className="text-sm text-muted-foreground">{product.supplier}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">{product.category}</TableCell>
                                                        <TableCell className="text-center font-semibold">{product.currentQuantity}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={product.countedQuantity || ""}
                                                                onChange={(e) => updateCountedQuantity(product.productId, parseInt(e.target.value) || 0)}
                                                                className="w-20 mx-auto"
                                                                placeholder="0"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {product.discrepancy !== null ? (
                                                                <span className={`font-semibold ${
                                                                    product.discrepancy === 0 ? 'text-green-600' :
                                                                    product.discrepancy > 0 ? 'text-blue-600' : 'text-red-600'
                                                                }`}>
                                                                    {product.discrepancy > 0 ? '+' : ''}{product.discrepancy}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {getStatusBadge(product)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Edit Session Dialog */}
                        <Dialog open={isEditSessionDialogOpen} onOpenChange={setIsEditSessionDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Stocktaking Session</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editSessionName">Session Name</Label>
                                        <Input
                                            id="editSessionName"
                                            value={sessionForm.sessionName}
                                            onChange={(e) => setSessionForm({...sessionForm, sessionName: e.target.value})}
                                            placeholder="e.g., Monthly Count - January 2024"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editSessionNotes">Notes (Optional)</Label>
                                        <Textarea
                                            id="editSessionNotes"
                                            value={sessionForm.sessionNotes}
                                            onChange={(e) => setSessionForm({...sessionForm, sessionNotes: e.target.value})}
                                            placeholder="Any additional information about this count..."
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditSessionDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button onClick={updateSession}>
                                            Update Session
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Session Details Dialog */}
                        <Dialog open={isSessionDetailsDialogOpen} onOpenChange={setIsSessionDetailsDialogOpen}>
                            <DialogContent className="max-w-[95vw] lg:max-w-6xl xl:max-w-7xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedSessionInfo ? `${selectedSessionInfo.sessionName} - Products` : 'Session Details'}
                                    </DialogTitle>
                                </DialogHeader>
                                {selectedSessionInfo && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-muted-foreground">
                                            <p><strong>Date:</strong> {new Date(selectedSessionInfo.sessionDate).toLocaleDateString()}</p>
                                            {selectedSessionInfo.sessionNotes && (
                                                <p><strong>Notes:</strong> {selectedSessionInfo.sessionNotes}</p>
                                            )}
                                        </div>

                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="min-w-[200px]">Product Name</TableHead>
                                                        <TableHead className="text-center min-w-[120px]">Category</TableHead>
                                                        <TableHead className="text-center min-w-[120px]">Supplier</TableHead>
                                                        <TableHead className="text-center min-w-[140px]">System Recorded Quantity</TableHead>
                                                        <TableHead className="text-center min-w-[140px]">Counted Quantity</TableHead>
                                                        <TableHead className="text-center min-w-[120px]">Difference</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedSessionProducts.map((product) => (
                                                        <TableRow key={product.id}>
                                                            <TableCell className="font-medium">{product.productName}</TableCell>
                                                            <TableCell className="text-center">{product.category}</TableCell>
                                                            <TableCell className="text-center">{product.supplier}</TableCell>
                                                            <TableCell className="text-center font-semibold">{product.currentQuantity}</TableCell>
                                                            <TableCell className="text-center">
                                                                {product.countedQuantity !== null ? product.countedQuantity : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {product.discrepancy !== null ? (
                                                                    <span className={`font-semibold ${
                                                                        product.discrepancy === 0 ? 'text-green-600' :
                                                                        product.discrepancy > 0 ? 'text-blue-600' : 'text-red-600'
                                                                    }`}>
                                                                        {product.discrepancy > 0 ? '+' : ''}{product.discrepancy}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Cancel Session Confirmation Dialog */}
                        <Dialog open={isCancelSessionDialogOpen} onOpenChange={setIsCancelSessionDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cancel Stocktaking Session</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Are you sure you want to cancel this stocktaking session? 
                                        This action cannot be undone and all progress will be lost.
                                    </p>
                                    {currentSession && (
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="font-medium">{currentSession.sessionName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Started: {new Date(currentSession.sessionDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCancelSessionDialogOpen(false)}
                                        >
                                            Keep Session
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            onClick={cancelCurrentSession}
                                        >
                                            <XIcon className="w-4 h-4 mr-2" />
                                            Cancel Session
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Previous Sessions */}
                        {!currentSession && sessions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Previous Sessions</CardTitle>
                                    <CardDescription>View completed stocktaking sessions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-center min-w-[120px]" >Session Name</TableHead>
                                                <TableHead className="font-medium text-center min-w-[120px]">Date</TableHead>
                                                <TableHead className="font-medium text-center min-w-[120px]">Status</TableHead>
                                                <TableHead className="font-medium text-center min-w-[120px]">Notes</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sessions
                                                .filter(session => session.status === 'COMPLETED')
                                                .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                                                .map((session) => (
                                                    <TableRow 
                                                        key={session.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => handleSessionRowClick(session)}
                                                    >
                                                        <TableCell className="font-medium text-center min-w-[120px]">{session.sessionName}</TableCell>
                                                        <TableCell className="font-medium text-center min-w-[120px]">{new Date(session.sessionDate).toLocaleDateString()}</TableCell>
                                                        <TableCell className="font-medium text-center min-w-[120px]">
                                                            <Badge variant="outline">Completed</Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-center min-w-[120px]">{session.sessionNotes || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {/* Empty State */}
                        {!currentSession && sessions.length === 0 && (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <CheckIcon className="w-12 h-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Stocktaking Sessions</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Create your first stocktaking session to start counting inventory
                                    </p>
                                    <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                Create First Session
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Stocktaking Session</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="sessionName">Session Name</Label>
                                                    <Input
                                                        id="sessionName"
                                                        value={sessionForm.sessionName}
                                                        onChange={(e) => setSessionForm({...sessionForm, sessionName: e.target.value})}
                                                        placeholder="e.g., Monthly Count - January 2024"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="sessionNotes">Notes (Optional)</Label>
                                                    <Textarea
                                                        id="sessionNotes"
                                                        value={sessionForm.sessionNotes}
                                                        onChange={(e) => setSessionForm({...sessionForm, sessionNotes: e.target.value})}
                                                        placeholder="Any additional information about this count..."
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsNewSessionDialogOpen(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={createNewSession}>
                                                        Create Session
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
        </AdminGuard>
    );
}