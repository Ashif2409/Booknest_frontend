"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Search, Trash2, Plus } from 'lucide-react'
import { formatDate } from "@/lib/utils"
import { AddBookDialog } from "@/components/add-book-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showAddBookDialog, setShowAddBookDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const checkAdminStatus = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.role !== "admin" && user.role !== "Admin") {
        window.location.href = "/dashboard"
      }

    }

    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
    
        checkAdminStatus();
    
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getReqBooks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) throw new Error("Failed to fetch book requests");
    
        const data = await response.json();
    
        const requestsWithUserData = await Promise.all(
          (data.books || []).map(async (request: any) => {
            if (request.userRequested && request.userRequested.length > 0) {
              const usersWithData = await Promise.all(
                request.userRequested.map(async (userId: string) => {
                  const userRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/id/${userId}`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  
                  // Call json() only once
                  const userData = await userRes.json();
    
                  if (userRes.ok) {
                    return userData;
                  } else {
                    return { username: "Unknown User" };
                  }
                })
              );
              return { ...request, userRequested: usersWithData };
            } else {
              return { ...request, userRequested: [] };
            }
          })
        );
    
        setRequests(requestsWithUserData);
        setFilteredRequests(requestsWithUserData);
      } catch (error) {
        console.error("Error fetching book requests:", error);
        toast({
          title: "Error",
          description: "Failed to load book requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };    
    

    fetchRequests()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = requests.filter(
        (request) =>
          request.bookname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredRequests(filtered)
    } else {
      setFilteredRequests(requests)
    }
  }, [searchQuery, requests])

  const handleDeleteRequest = async (id: string) => {
    setIsDeleting(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/delReqBooks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id:id }),
      })

      if (response.ok) {
        setRequests((prev) => prev.filter((request) => request._id !== id))
        setFilteredRequests((prev) => prev.filter((request) => request._id !== id))

        toast({
          title: "Request Deleted",
          description: "The book request has been deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request)
    setShowAddBookDialog(true)
  }

  const handleBookAdded = (newBook: any) => {
    // After adding the book, delete the request
    if (selectedRequest) {
      handleDeleteRequest(selectedRequest._id)
    }

    toast({
      title: "Request Approved",
      description: `"${newBook.title}" has been added to the library.`,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav isAdmin />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book Requests</h1>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search requests by book title, author, genre, or username..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Requested Books</CardTitle>
              <CardDescription>Books requested by users to be added to the library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Book Title</th>
                      <th className="text-left py-3 px-4">Author</th>
                      <th className="text-left py-3 px-4">Genre</th>
                      <th className="text-left py-3 px-4">Language</th>
                      <th className="text-left py-3 px-4">Requested By</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">{request.bookname}</td>
                        <td className="py-3 px-4">{request.author}</td>
                        <td className="py-3 px-4">{request.genre}</td>
                        <td className="py-3 px-4">{request.language}</td>
                        <td className="py-3 px-4">
                          {request.userRequested && request.userRequested.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {request.userRequested.map((user: any, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {user.username || user.name || "Unknown User"}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline">No Users</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">{formatDate(request.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-500 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              onClick={() => handleApproveRequest(request)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this book request? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRequest(request._id)}
                                    disabled={isDeleting}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Book Requests</CardTitle>
              <CardDescription>There are currently no book requests from users</CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>

      {selectedRequest && (
        <AddBookDialog
          open={showAddBookDialog}
          onOpenChange={setShowAddBookDialog}
          onBookAdded={handleBookAdded}
          initialData={{
            bookname: selectedRequest.bookname,
            author: selectedRequest.author,
            genre: selectedRequest.genre,
            language: selectedRequest.language,
          }}
        />
      )}
    </div>
  )
}
