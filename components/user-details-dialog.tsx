"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface UserDetailsDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])
  const [returnedBooks, setReturnedBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user || !open) return;
  
      setIsLoading(true);
  
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
  
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/book/userBook/${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched user books:", data);
          // Map fields to match frontend expectations
          const mappedData = data.map((book: any) => ({
            title: book.bookname,
            issueDate: book.IssueDate,
            dueDate: book.Due_Date,
            returned: book.returned,
            verifyReturn: book.verifyReturn,
          }));
  
          // Split into current and returned books
          const current = mappedData.filter((book: any) => !book.returned);
          const returned = mappedData.filter((book: any) => book.returned && !book.verifyReturn);
  
          setBorrowedBooks(current);
          setReturnedBooks(returned);
        } else {
          throw new Error("Failed to fetch user books");
        }
      } catch (error) {
        console.error("Error fetching user books:", error);
        toast({
          title: "Error",
          description: "Failed to load user's books. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserBooks();
  }, [user, open]);
  

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View user information and borrowing history</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex flex-col items-center sm:items-start">
            <Avatar className="h-20 w-20 mb-2">
              <AvatarImage src={user?.avatar || "/placeholder.svg?height=80&width=80"} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-2">
              {user?.role === "admin" ? (
                <Badge className="bg-purple-500">Admin</Badge>
              ) : (
                <Badge variant="outline">User</Badge>
              )}
            </div>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="current">
              <TabsList className="mb-4">
                <TabsTrigger value="current">Current Books</TabsTrigger>
                <TabsTrigger value="history">Return History</TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                ) : borrowedBooks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Book</th>
                          <th className="text-left py-2 px-4">Issue Date</th>
                          <th className="text-left py-2 px-4">Due Date</th>
                          <th className="text-left py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {borrowedBooks.map((book, index) => (
                          <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2 px-4">{book.title}</td>
                            <td className="py-2 px-4">{formatDate(book.issueDate)}</td>
                            <td className="py-2 px-4">
                              <span className={isOverdue(book.dueDate) ? "text-red-500" : ""}>
                                {formatDate(book.dueDate)}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              {isOverdue(book.dueDate) ? (
                                <Badge variant="destructive">Overdue</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  Active
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-slate-500 dark:text-slate-400">
                    This user has no currently borrowed books.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="history">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                ) : returnedBooks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Book</th>
                          <th className="text-left py-2 px-4">Issue Date</th>
                          <th className="text-left py-2 px-4">Return Date</th>
                          <th className="text-left py-2 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnedBooks.map((book, index) => (
                          <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2 px-4">{book.title}</td>
                            <td className="py-2 px-4">{formatDate(book.issueDate)}</td>
                            <td className="py-2 px-4">{formatDate(book.returnDate)}</td>
                            <td className="py-2 px-4">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Returned
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-slate-500 dark:text-slate-400">
                    This user has no return history.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
