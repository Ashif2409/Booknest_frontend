"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, BookPlus } from "lucide-react"
import { RequestBookDialog } from "@/components/request-book-dialog"

export default function DashboardPage() {
  const [books, setBooks] = useState<any[]>([])
  const [topBooks, setTopBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        // Fetch available books
        const booksResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/books?limit=10&page=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Fetch top books
        const topBooksResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/topBooks?limit=10&page=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if ((booksResponse.status === 200 || booksResponse.status === 404) &&
          (topBooksResponse.status === 200 || topBooksResponse.status === 404)) {

          const booksData = booksResponse.status === 200 ? await booksResponse.json() : { books: [] }
          const topBooksData = topBooksResponse.status === 200 ? await topBooksResponse.json() : { books: [] }

          setBooks(booksData.books || [])
          setTopBooks(topBooksData.books || [])
        } else {
          throw new Error("Failed to fetch books")
        }
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const filteredBooks = books.filter((book) =>
    book.bookname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to BookNest</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Discover and borrow books from our collection</p>
          </div>

          <Button onClick={() => setShowRequestDialog(true)} className="flex items-center gap-2">
            <BookPlus className="h-4 w-4" />
            Request Book
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search books by title, author, or genre..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="available" className="mb-8">
          <TabsList>
            <TabsTrigger value="available">Available Books</TabsTrigger>
            <TabsTrigger value="popular">Popular Books</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No books found matching your search." : "No books available at the moment."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : topBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topBooks.map((book) => (
                  <BookCard key={book._id} book={book} isPopular />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">No popular books data available at the moment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <RequestBookDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} />
    </div>
  )
}
