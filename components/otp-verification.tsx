"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OtpVerificationProps {
  userId?: string | null
  username?: string
  onVerified: () => void
  forPasswordReset?: boolean
}

export function OtpVerification({ userId, username, onVerified, forPasswordReset = false }: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    // Move to next input if current one is filled
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]!.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]!.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 4-digit number
    if (/^\d{4}$/.test(pastedData)) {
      const newOtp = pastedData.split("")
      setOtp(newOtp)

      // Focus the last input
      if (inputRefs.current[3]) {
        inputRefs.current[3].focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const otpValue = otp.join("")

    try {
    const endpoint = forPasswordReset
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/verifyOTP`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/verify-otp`
    const body = forPasswordReset
        ? JSON.stringify({ otp: Number.parseInt(otpValue, 10) })
        : JSON.stringify({ otp: Number.parseInt(otpValue, 10) })

        console.log("endpoint: ", endpoint)
        console.log("body: ", body);
        const token = localStorage.getItem("token");
        console.log("Token being sent:", token);
        
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      const result = await response.json()
      console.log("result: ", result)
      if (!response.ok) {
        throw new Error(result.message || "Failed to verify OTP")
      }
      localStorage.setItem("token", result.token);
      onVerified()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl"
              />
            ))}
          </div>
  
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.join("").length !== 4}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      </div>
    </div>
  )
  
}
