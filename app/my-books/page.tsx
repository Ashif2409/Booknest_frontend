"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { MainNav } from "@/components/main-nav"
import { FinePaymentDialog } from "@/components/fine-payment-dialog"
import { BookCheck, AlertCircle, CreditCard } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Book {
  _id: string
  bookname: string
  author: string
  genre: string
  IssueDate: string
  Due_Date: string
  returnDate?: string
  returned?: boolean
  verifyReturn?: boolean
  fine?: number
  finePaid?: boolean
  bookId: string
  book: {
    book: {
      author: string
      genre: string
    }
  }
}

export default function MyBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showFineDialog, setShowFineDialog] = useState(false)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!profileRes.ok) throw new Error("Failed to fetch profile")

        const profileData = await profileRes.json()
        const borrowedBooks = profileData.bookBorrow || []

        const detailedBooks = await Promise.all(
          borrowedBooks.map(async (book: Book) => {
            try {
              const bookDetails = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/books/${book.bookId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              if (!bookDetails.ok) throw new Error("Failed to fetch book details")
              const bookDetailsData = await bookDetails.json()
              return { ...book, book: bookDetailsData }
            } catch (error) {
              console.error("Error fetching book details:", error)
              return book
            }
          })
        )
        setBooks(detailedBooks)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your books. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const handleReturnBook = async (book: Book) => {
    const token = localStorage.getItem("token")
    if (!token) return

    const bookId = book.bookId
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/returnBook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.message || "Failed to return book")

      toast({
        title: "Book Returned",
        description: `You have successfully returned "${book.bookname}"`,
      })

      setBooks((prev) =>
        prev.map((b) =>
          b._id === book._id
            ? {
                ...b,
                returned: true,
                returnDate: new Date().toISOString(),
              }
            : b
        )
      )
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()

  const calculateFine = (dueDate: string) => {
    if (!isOverdue(dueDate)) return 0
    const diffDays = Math.ceil(
      (new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays * 0.5
  }

  const handlePayFine = (book: Book) => {
    setSelectedBook(book)
    setShowFineDialog(true)
  }

  const currentBooks = books.filter((b) => !b.returned)
  const returnedBooks = books.filter((b) => b.returned)

  const renderBookList = (list: Book[], showActions = false) => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
        </Card>
      ))
    }

    if (list.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            {showActions ? "You have no borrowed books." : "No return history yet."}
          </p>
        </div>
      )
    }

    return list.map((book) => {
      const fine = calculateFine(book.Due_Date)
      const overdue = isOverdue(book.Due_Date)

      return (
        <Card key={book._id} className="mb-4">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              {book.bookname}
              {book.returned ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
                  <BookCheck className="h-3 w-3 mr-1" /> Returned
                </Badge>
              ) : overdue ? (
                <Badge variant="destructive" className="ml-2">
                  <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Info label="Author" value={book.book.book.author} />
              <Info label="Genre" value={book.book.book.genre} />
              <Info label="Issue Date" value={formatDate(book.IssueDate)} />
              <Info
                label={book.returned ? "Return Date" : "Due Date"}
                value={formatDate(book.returnDate || book.Due_Date)}
                highlight={overdue && !book.returned}
              />
              {overdue && (fine > 0 || book.fine) && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Fine</p>
                  <p className="text-red-500 font-medium">
                    {formatCurrency(book.fine || fine)}
                    {book.finePaid && " (Paid)"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          {showActions && (
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                className="w-full sm:w-auto"
                onClick={() => handleReturnBook(book)}
                disabled={book.returned || (fine > 0 && !book.finePaid)}
              >
                <BookCheck className="h-4 w-4 mr-2" />
                {book.returned ? "Returned" : "Return Book"}
              </Button>
              {overdue && fine > 0 && !book.finePaid && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => handlePayFine(book)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Fine
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      )
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Books</h1>
        <Tabs defaultValue="current" className="mb-8">
          <TabsList>
            <TabsTrigger value="current">Current Books</TabsTrigger>
            <TabsTrigger value="history">Return History</TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="mt-6">
            {renderBookList(currentBooks, true)}
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            {renderBookList(returnedBooks)}
          </TabsContent>
        </Tabs>
      </main>

      {selectedBook && (
        <FinePaymentDialog
          book={selectedBook}
          open={showFineDialog}
          onOpenChange={setShowFineDialog}
          onSuccess={() =>
            setBooks((prev) =>
              prev.map((b) =>
                b._id === selectedBook._id
                  ? { ...b, finePaid: true }
                  : b
              )
            )
          }
        />
      )}
    </div>
  )
}

const Info = ({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) => (
  <div>
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className={highlight ? "text-red-500 font-medium" : ""}>{value}</p>
  </div>
)
