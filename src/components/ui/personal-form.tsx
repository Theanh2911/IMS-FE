"use client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const FormSchema = z.object({
    username: z.string().min(6, {
        message: "Username must be at least 6 characters.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    workingShift: z.string().nonempty({
        message: "Working shift is required.",
    }),
})

export function PersonalForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
            password: "",
            workingShift: "",
        },
    })

    useEffect(() => {
        const checkAuth = () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                toast.error("Please login to access this page");
                router.push('/login');
                return;
            }

            fetchUserData(userId, token);
        };

        checkAuth();
    }, [router]);

    const fetchUserData = async (userId: string, token: string) => {
        try {
            console.log('Fetching user data...', { userId });
            const response = await fetch(`http://localhost:8080/api/user/current-user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const userData = await response.json();
            console.log('User data received:', userData);

            if (!userData) {
                throw new Error('No user data received');
            }

            form.reset({
                username: userData.username || '',
                password: '',
                workingShift: userData.workingShift || '',
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error(error instanceof Error ? error.message : "Failed to load user data");
            if (error instanceof Error && error.message.includes('401')) {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                toast.error("Session expired. Please login again.");
                router.push('/login');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/user/update-user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || response.statusText || 'Failed to update user information');
            }

            const result = await response.json();
            toast.success("User information updated successfully! You will be redirected to the login page.");
            router.push('/login')
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error instanceof Error ? error.message : "Failed to update user information. Please try again.");
        }
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="workingShift"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Workshift</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a shift" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Morning">Morning</SelectItem>
                                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                                    <SelectItem value="Night">Night</SelectItem>
                                    <SelectItem value="Full-time">Full-Time</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
} 