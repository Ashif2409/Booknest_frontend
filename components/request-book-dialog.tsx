"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface RequestBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const requestBookSchema = z.object({
  bookname: z.string().min(1, "Book name is required"),
  author: z.string().min(1, "Author name is required"),
  genre: z.string().min(1, "Genre is required"),
  language: z.string().min(1, "Language is required"),
})

type RequestBookFormValues = z.infer<typeof requestBookSchema>

export function RequestBookDialog({ open, onOpenChange }: RequestBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RequestBookFormValues>({
    resolver: zodResolver(requestBookSchema),
    defaultValues: {
      bookname: "",
      author: "",
      genre: "",
      language: "",
    },
  })

  async function onSubmit(data: RequestBookFormValues) {
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("You must be logged in to request a book")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/reqBook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to request book")
      }

      toast({
        title: "Book Requested",
        description: "Your book request has been submitted successfully.",
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request book",
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
          <DialogTitle>Request a New Book</DialogTitle>
          <DialogDescription>Fill in the details of the book you'd like to see in our library.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bookname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter book title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter author name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Fiction, Science, History" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., English, Spanish" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
