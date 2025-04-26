"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, ArrowLeft, CheckCircle } from "lucide-react"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  // const searchParams = useSearchParams()
  // const verified = searchParams.get("verified")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [showVerifiedMessage, setShowVerifiedMessage] = useState(false)

  // useEffect(() => {
  //   if (verified === "true") {
  //     setShowVerifiedMessage(true)
  //     const timer = setTimeout(() => {
  //       setShowVerifiedMessage(false)
  //     }, 5000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [verified])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to log in")
      }

      // Store token in localStorage or cookies
      localStorage.setItem("token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))

      // Redirect based on role
      if (result.user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold">BookNest</h1>
      </div>

      {/* {showVerifiedMessage && (
        <Alert className="mb-4 max-w-md bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Account verified successfully! You can now log in.</AlertDescription>
        </Alert>
      )} */}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>Enter your credentials to access BookNest</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-emerald-600 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
