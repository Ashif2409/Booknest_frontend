"use client"

import { useState, useRef } from "react"
import { number, z } from "zod"
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

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookAdded: (book: any) => void
  initialData?: {
    bookname: string
    author: string
    genre: string
    language: string
  }
}

const addBookSchema = z.object({
  bookname: z.string().min(1, "Book name is required"),
  author: z.string().min(1, "Author name is required"),
  genre: z.string().min(1, "Genre is required"),
  language: z.string().min(1, "Language is required"),
  number_of_copies: z
    .number()
    .min(1, "Number of copies must be at least 1")
    .max(100, "Number of copies must be at most 100")
    .optional(),
})


type AddBookFormValues = z.infer<typeof addBookSchema>

export function AddBookDialog({ open, onOpenChange, onBookAdded, initialData }: AddBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<AddBookFormValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: initialData || {
      bookname: "",
      author: "",
      genre: "",
      language: "",
      number_of_copies: 1,
    },
  })

  // Reset form when dialog opens with initialData
  useState(() => {
    if (open && initialData) {
      form.reset(initialData)
    }
  })

  async function onSubmit(data: AddBookFormValues) {
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("You must be logged in to add a book")
      }

      const formData = new FormData()
      formData.append("bookname", data.bookname)
      formData.append("author", data.author)
      formData.append("genre", data.genre)
      formData.append("language", data.language)

      if (fileInputRef.current?.files?.length) {
        formData.append("BookProfile", fileInputRef.current.files[0])
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/addbook`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || "Failed to add book")
      }

      // Create a book object to add to the list
      const newBook = {
        _id: Date.now().toString(),
        title: data.bookname,
        author: data.author,
        genre: data.genre,
        language: data.language,
        number_of_copies: data.number_of_copies || 1,
      }

      onBookAdded(newBook)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add book",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>Add a new book to the library collection.</DialogDescription>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="number_of_copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of copies</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., 1, 2, 3"
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)} // Convert input to number
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <div>
              <FormLabel htmlFor="cover">Book Cover </FormLabel>
              <Input id="cover" type="file" accept="image/*" ref={fileInputRef} className="mt-1" />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
