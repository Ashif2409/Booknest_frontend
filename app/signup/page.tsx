"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OtpVerification } from "@/components/otp-verification"

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z
  .any()
  .refine(
    (fileList) => fileList instanceof FileList || fileList === undefined,
    { message: "Avatar must be a file upload" }
  )
  .optional(),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("username", data.username)
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("role", "Student")

      if (data.avatar && data.avatar.length > 0) {
        formData.append("Avatar", data.avatar[0])
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/signup`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to sign up")
      }

      // Store user ID for OTP verification
      localStorage.setItem("token", result.token);
      setUserId(result.user._id)
      setShowOtpVerification(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerified = () => {
    router.push('/login?verified=true')
  }

  if (showOtpVerification) {
    return <OtpVerification userId={userId} onVerified={handleOtpVerified} />
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

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join BookNest to start borrowing books</CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
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

              <FormField
                control={form.control}
                name="avatar"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Profile Picture (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
