"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { BookOpen, Users, AlertCircle, BookText } from "lucide-react"
import { AdminBooksList } from "@/components/admin-books-list"
import { AdminUsersList } from "@/components/admin-users-list"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    overdueBooks: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [usersWithOverdue, setUsersWithOverdue] = useState<any[]>([])
  useEffect(() => {
    const checkAdminStatus = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.role !== "Admin" && user.role !== "admin") {
        window.location.href = "/dashboard"
      }
    }

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        checkAdminStatus()

        // Fetch users with overdue books
        const overdueRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/user-with-overdue`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        let totalOverdueBooks = 0
        let overdueUsers = []

        if (overdueRes.ok) {
          const data = await overdueRes.json()
          overdueUsers = data || []
          totalOverdueBooks = data.reduce((acc: number, user: any) => acc + user.bookBorrow.length, 0)
          setUsersWithOverdue(data)
        }

        // Fetch all books
        const booksRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book/books`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        // Fetch all users
        
        if (booksRes.ok ) {
          const books = await booksRes.json()
          const allBooks = books.books || []
          const totalBooks = allBooks.length
          setStats({
            totalBooks: totalBooks,
            overdueBooks: totalOverdueBooks,
          })
        } else {
          throw new Error("Failed to fetch dashboard data")
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav isAdmin />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-8 w-16" />
                  </CardHeader>
                </Card>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Books</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {stats.totalBooks}
                  <BookText className="h-6 w-6 text-slate-400" />
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Overdue Books</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-2">
                  {stats.overdueBooks}
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overdue" className="mb-8">
          <TabsList>
            <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="mt-6">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                </CardContent>
              </Card>
            ) : usersWithOverdue.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Users with Overdue Books</CardTitle>
                  <CardDescription>These users have books that are past their due date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Book</th>
                          <th className="text-left py-3 px-4">Due Date</th>
                          <th className="text-left py-3 px-4">Days Overdue</th>
                          <th className="text-left py-3 px-4">Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersWithOverdue.map((item, index) =>
                          item.bookBorrow.map((borrowedBook: any, idx: number) => {
                            const dueDate = new Date(borrowedBook.dueDate)
                            const today = new Date()
                            const diffTime = today.getTime() - dueDate.getTime()
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            const fine = diffDays * 0.5

                            return (
                              <tr key={`${index}-${idx}`} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-3 px-4">{item.username}</td>
                                <td className="py-3 px-4">{borrowedBook.bookTitle}</td>
                                <td className="py-3 px-4">{dueDate.toLocaleDateString()}</td>
                                <td className="py-3 px-4">{diffDays}</td>
                                <td className="py-3 px-4 text-red-500">${fine.toFixed(2)}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Overdue Books</CardTitle>
                  <CardDescription>There are currently no users with overdue books</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <AdminUsersList/>
          </TabsContent>

          <TabsContent value="books" className="mt-6">
            <AdminBooksList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
