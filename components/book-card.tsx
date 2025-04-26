"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BookCardProps {
  book: {
    _id: string
    bookname: string
    author: string
    genre: "Fiction" | "Non-fiction" | "Poetry" | "Drama"
    language:
      | "English"
      | "Hindi"
      | "Bengoli"
      | "Gujarati"
      | "Tamil"
      | "Telugu"
      | "Urdu"
      | "Marathi"
      | "odia"
    number_of_copies: number
    coverPhoto?: string
    bookIssuedCount?: number
    borrower?: string[]
  }
  isPopular?: boolean
}

export function BookCard({ book, isPopular = false }: BookCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleIssueBook = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/issueBook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book: book.bookname }),
      })

      const result = await response.json()
      console.log(result)
      if (!response.ok) {
        throw new Error(result.message || "Failed to issue book")
      }

      toast({
        title: "Success!",
        description: `You have successfully borrowed "${book.bookname}"`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to issue book",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const issuePercentage =
    book.bookIssuedCount && book.number_of_copies
      ? Math.round((book.bookIssuedCount / book.number_of_copies) * 100)
      : null

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-[2/3] relative bg-slate-100 dark:bg-slate-800">
        <img
          src={
            book.coverPhoto ||
            `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(book.bookname)}`
          }
          alt={book.bookname}
          className="object-cover w-full h-full"
        />
        {isPopular && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 hover:bg-amber-600">
              <Award className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg line-clamp-1">{book.bookname}</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">by {book.author}</p>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{book.genre}</Badge>
          <Badge variant="outline">{book.language}</Badge>
        </div>
        {isPopular && issuePercentage !== null && (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Borrowed by {issuePercentage}% of users
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={book.number_of_copies === 0 || isLoading}
          onClick={handleIssueBook}
        >
          {isLoading ? (
            "Processing..."
          ) : book.number_of_copies > 0 ? (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Borrow Book
            </>
          ) : (
            "Currently Unavailable"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
