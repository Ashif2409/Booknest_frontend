"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface FinePaymentDialogProps {
  book: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function FinePaymentDialog({ book, open, onOpenChange, onSuccess }: FinePaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calculateFine = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = Math.abs(today.getTime() - due.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Assuming $0.50 per day as fine
    return diffDays * 0.5
  }

  const fine = book.fine || calculateFine(book.dueDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("You must be logged in to pay a fine")
      }

      if (!fileInputRef.current?.files?.length) {
        throw new Error("Please upload a payment screenshot")
      }

      const formData = new FormData()
      formData.append("bookId", book._id)
      formData.append("Screenshot", fileInputRef.current.files[0])

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/fine-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit payment")
      }

      toast({
        title: "Payment Submitted",
        description: "Your fine payment has been submitted successfully.",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Fine</DialogTitle>
          <DialogDescription>Upload a screenshot of your payment for the overdue book.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="book" className="text-right">
                Book
              </Label>
              <div className="col-span-3 font-medium">{book.title}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fine" className="text-right">
                Fine Amount
              </Label>
              <div className="col-span-3 text-red-500 font-medium">{formatCurrency(fine)}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="screenshot" className="text-right">
                Payment Screenshot
              </Label>
              <Input id="screenshot" type="file" accept="image/*" ref={fileInputRef} required className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
