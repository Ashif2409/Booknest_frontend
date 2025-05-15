"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, BookOpen } from "lucide-react"
import { AddBookDialog } from "@/components/add-book-dialog"
import { BookDetailsDialog } from "@/components/book-details-dialog"

export default function AdminBooksPage() {
  const [books, setBooks] = useState<any[]>([])
  const [topBooks, setTopBooks] = useState<any[]>([])
  const [filteredBooks, setFilteredBooks] = useState<any[]>([])
  const [filteredTopBooks, setFilteredTopBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddBookDialog, setShowAddBookDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)
  const [showBookDetailsDialog, setShowBookDetailsDialog] = useState(false)

  useEffect(() => {
    const checkAdminStatus = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.role !== "Admin" && user.role !== "admin") {
        window.location.href = "/dashboard"
      }
    }

    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        // Check if user is admin
        checkAdminStatus()

        // Fetch all books
        const booksResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/books?limit=100&page=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Fetch top books
        const topBooksResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/topBooks?limit=20&page=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (booksResponse.ok && topBooksResponse.ok) {
          const booksData = await booksResponse.json()
          const topBooksData = await topBooksResponse.json()

          setBooks(booksData.books || [])
          setFilteredBooks(booksData.books || [])
          setTopBooks(topBooksData.books || [])
          setFilteredTopBooks(topBooksData.books || [])
        } else {
          throw new Error("Failed to fetch books")
        }
      } catch (error) {
        console.error("Error fetching books:", error)
        toast({
          title: "Error",
          description: "Failed to load books. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(
        (book) =>
          book.bookname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setFilteredBooks(filtered)

      const filteredTop = topBooks.filter(
        (book) =>
          book.bookname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.genre.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredTopBooks(filteredTop)
    } else {
      setFilteredBooks(books)
      setFilteredTopBooks(topBooks)
    }
  }, [searchQuery, books, topBooks])

  const handleBookAdded = (newBook: any) => {
    setBooks((prevBooks) => [...prevBooks, newBook])
    setFilteredBooks((prevBooks) => [...prevBooks, newBook])
    toast({
      title: "Book Added",
      description: `"${newBook.title}" has been added to the library.`,
    })
  }

  const handleViewBookDetails = (book: any) => {
    setSelectedBook(book)
    setShowBookDetailsDialog(true)
  }

  const handleVerifyReturn = async (userId: string, bookId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/verifyReturn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, bookId }),
      })

      if (response.ok) {
        toast({
          title: "Return Verified",
          description: "The book return has been verified successfully.",
        })

        // Update book availability
        if (selectedBook) {
          setBooks((prevBooks) =>
            prevBooks.map((book) => (book._id === selectedBook._id ? { ...book, available: true } : book)),
          )
          setFilteredBooks((prevBooks) =>
            prevBooks.map((book) => (book._id === selectedBook._id ? { ...book, available: true } : book)),
          )
        }

        // Close the dialog
        setShowBookDetailsDialog(false)
      } else {
        throw new Error("Failed to verify return")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify return. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav isAdmin />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Book Management</h1>
          <Button onClick={() => setShowAddBookDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
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

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Books</TabsTrigger>
            <TabsTrigger value="popular">Popular Books</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : filteredBooks.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4">Author</th>
                          <th className="text-left py-3 px-4">Genre</th>
                          <th className="text-left py-3 px-4">Language</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBooks.map((book) => (
                          <tr key={book._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-4">{book.bookname}</td>
                            <td className="py-3 px-4">{book.author}</td>
                            <td className="py-3 px-4">{book.genre}</td>
                            <td className="py-3 px-4">{book.language}</td>
                            <td className="py-3 px-4">
                              {book.number_of_copies>0 ? (
                                <Badge className="bg-emerald-500">Available</Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
                                >
                                  Borrowed
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm" onClick={() => handleViewBookDetails(book)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No books found matching your search." : "No books available."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : filteredTopBooks.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Title</th>
                          <th className="text-left py-3 px-4">Author</th>
                          <th className="text-left py-3 px-4">Genre</th>
                          <th className="text-left py-3 px-4">Popularity</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTopBooks.map((book) => (
                          <tr key={book._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-4">{book.title}</td>
                            <td className="py-3 px-4">{book.author}</td>
                            <td className="py-3 px-4">{book.genre}</td>
                            <td className="py-3 px-4">{book.issuePercentage ? `${book.issuePercentage}%` : "N/A"}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm" onClick={() => handleViewBookDetails(book)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No popular books found matching your search." : "No popular books data available."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddBookDialog open={showAddBookDialog} onOpenChange={setShowAddBookDialog} onBookAdded={handleBookAdded} />

      {selectedBook && (
        <BookDetailsDialog
          book={selectedBook}
          open={showBookDetailsDialog}
          onOpenChange={setShowBookDetailsDialog}
          onVerifyReturn={handleVerifyReturn}
        />
      )}
    </div>
  )
}
