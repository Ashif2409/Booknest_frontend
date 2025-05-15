"use client"

import { useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, ArrowLeft, CheckCircle } from "lucide-react"
import { OtpVerification } from "@/components/otp-verification"
import { ResetPasswordForm } from "@/components/reset-password-form"

const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [username, setUsername] = useState("")

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    setError(null)
    setUsername(data.username)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: data.username }),
      })

      const result = await response.json()
      console.log("username: ", data.username)
      console.log("result: ", result)
      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset code")
      }

      setSuccess(true)
      setShowOtpVerification(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerified = () => {
    setShowOtpVerification(false)
    setShowResetForm(true)
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
        <h1 className="text-3xl font-bold">LibraryHub</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            {showResetForm
              ? "Enter your new password"
              : showOtpVerification
              ? "Enter the verification code sent to your account"
              : "We'll send you a verification code to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !showOtpVerification && !showResetForm && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Verification code sent successfully!</AlertDescription>
            </Alert>
          )}

          {showResetForm ? (
            <ResetPasswordForm username={username} />
          ) : showOtpVerification ? (
            <OtpVerification username={username} onVerified={handleOtpVerified} forPasswordReset />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Remember your password?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
