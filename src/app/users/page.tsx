"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { AdminGuard } from "@/components/auth/admin-guard"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Employee {
    id: string;
    name: string;
    role: string;
    workingShift: string;
}

interface RegisterFormData {
    name: string;
    username: string;
    password: string;
    workingShift: string;
}

export default function Page() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<RegisterFormData>({
        name: "",
        username: "",
        password: "",
        workingShift: ""
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Fetch employee data from the API
    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:8080/api/user/get-all-users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.status === 200) {
                setEmployees(data.users);
            } else {
                setError(data.message || "Failed to fetch employee data");
            }
        } catch (err) {
            setError("Error connecting to the server");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (employeeId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/user/delete-user/${employeeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                fetchEmployees();
            } else {
                const data = await response.json();
                setError(data.message || "Failed to delete employee");
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError("Error deleting employee");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleShiftChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            workingShift: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsDialogOpen(false);
                setFormData({
                    name: "",
                    username: "",
                    password: "",
                    workingShift: ""
                });
                fetchEmployees();
            } else {
                const data = await response.json();
                setError(data.message || "Failed to register employee");
            }
        } catch (error) {
            console.error('Error registering employee:', error);
            setError("Error registering employee");
        }
    };

    return (
        <AdminGuard
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h1>
                        <p className="text-gray-600">User management is restricted to administrators only.</p>
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
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2 relative">
                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <p>Loading employee data...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center p-8 text-red-500">
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableCaption>A list of your employees</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-center">Name</TableHead>
                                                <TableHead className="text-center">Role</TableHead>
                                                <TableHead className="text-center">Working Shift</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employees.map((employee) => (
                                                <TableRow key={employee.id || employee.name}>
                                                    <TableCell className="text-center">{employee.name}</TableCell>
                                                    <TableCell className="text-center">{employee.role}</TableCell>
                                                    <TableCell className="text-center">{employee.workingShift}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This account will no longer have access to the app
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(employee.id)}>
                                                                            Continue
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button 
                                                className="fixed bottom-8 right-8"
                                                size="lg"
                                            >
                                                Add Employee
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Employee</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="username">Username</Label>
                                                    <Input
                                                        id="username"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="workingShift">Working Shift</Label>
                                                    <Select
                                                        value={formData.workingShift}
                                                        onValueChange={handleShiftChange}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select working shift" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Morning">Morning</SelectItem>
                                                            <SelectItem value="Afternoon">Afternoon</SelectItem>
                                                            <SelectItem value="Night">Night</SelectItem>
                                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button type="submit" className="w-full">
                                                    Register Employee
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminGuard>
    )
}