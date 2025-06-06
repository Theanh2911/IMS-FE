'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Cookies from 'js-cookie'

interface LoginResponse {
  status: number
  userId: number
  message: string
  token: string
  role: string
  expirationTime: string
  timestamp: string
  username: string
  name: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('Attempting login...')
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json() as LoginResponse
      console.log('Login response:', data)

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      if (!data.token) {
        throw new Error("No token received")
      }

      if (!data.userId) {
        throw new Error("No user ID received")
      }

      // Store auth data
      try {
        localStorage.clear() // Clear any old data
        
        Cookies.set('token', data.token, {
          expires: 180,
          path: '/',
          sameSite: 'strict',
        })

        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.userId.toString())
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          name: data.name,
          role: data.role,
        }))

        // Verify storage
        const storedUserId = localStorage.getItem('userId')
        const storedToken = localStorage.getItem('token')
        
        if (!storedUserId || !storedToken) {
          throw new Error("Failed to store authentication data")
        }

        toast.success(data.message || "Login successful!")
        console.log('Redirecting to dashboard...')
        
        // Force a hard navigation to dashboard
        window.location.href = '/dashboard'
      } catch (storageError) {
        console.error('Storage error:', storageError)
        throw new Error("Failed to store login information. Please try again.")
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message)
      toast.error(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your information below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
