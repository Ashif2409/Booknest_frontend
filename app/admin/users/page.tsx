"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Search, Shield, BookOpen } from 'lucide-react'
import { UserDetailsDialog } from "@/components/user-details-dialog"
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

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [filteredUsers, setFilteredUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false)
    const [isPromoting, setIsPromoting] = useState(false)

    useEffect(() => {
        const checkAdminStatus = () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}")
            if (user.role !== "admin" && user.role !== "Admin") {
                window.location.href = "/dashboard"
            }
        }

        const fetchUsers = async () => {
            try {
          
              const token = localStorage.getItem("token");
              if (!token) {
                window.location.href = "/login";
                return;
              }
          
              checkAdminStatus();
          
              const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/confirmReturn`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
          
              const data = await response.json();
          
              if (response.ok) {
                const formattedUsers = data.map((item: any) => ({
                  id: item._id,
                  username: item.username,
                  name: item.name,
                  email: item.email,
                  avatar: item.profile,
                  booksToVerify: item.filterData.length,  // 🛠️ Use filterData not pendingBooks
                }));
          
          
                setUsers(formattedUsers);
                setFilteredUsers(formattedUsers);
              } else {
                throw new Error("Failed to fetch return-pending users");
              }
            } catch (error) {
              console.error("❗ Error fetching return-pending users:", error);
              toast({
                title: "Error",
                description: "Failed to load users. Please try again.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          };          
          

        fetchUsers()
    }, [])

    useEffect(() => {
        if (searchQuery) {
            const filtered = users.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            setFilteredUsers(filtered)
        } else {
            setFilteredUsers(users)
        }
    }, [searchQuery, users])

    const handlePromoteToAdmin = async (userId: string) => {
        setIsPromoting(true)

        try {
            const token = localStorage.getItem("token")
            if (!token) return

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/approveAdmin/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Update local state
                setUsers((prevUsers) =>
                    prevUsers.map((user) => (user.id === userId ? { ...user, role: "admin" } : user)),
                )
                setFilteredUsers((prevUsers) =>
                    prevUsers.map((user) => (user.id === userId ? { ...user, role: "admin" } : user)),
                )

                toast({
                    title: "User Promoted",
                    description: "User has been promoted to admin successfully.",
                })
            } else {
                throw new Error("Failed to promote user")
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to promote user. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsPromoting(false)
        }
    }

    const handleViewUserDetails = (user: any) => {
        setSelectedUser(user)
        setShowUserDetailsDialog(true)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <MainNav isAdmin />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">User Management</h1>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search users by name, username, or email..."
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
                ) : filteredUsers.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Library Users</CardTitle>
                            <CardDescription>Manage users and their permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">Username</th>
                                            <th className="text-left py-3 px-4">Name</th>
                                            <th className="text-left py-3 px-4">Email</th>
                                            <th className="text-left py-3 px-4">Role</th>
                                            <th className="text-left py-3 px-4">Books Borrowed</th>
                                            <th className="text-left py-3 px-4">Overdue Books</th>
                                            <th className="text-left py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="py-3 px-4">{user.username}</td>
                                                <td className="py-3 px-4">{user.name}</td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    {user.role === "admin" ? (
                                                        <Badge className="bg-purple-500">Admin</Badge>
                                                    ) : (
                                                        <Badge variant="outline">User</Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.booksIssued > 0 ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {user.booksIssued}
                                                        </Badge>
                                                    ) : (
                                                        "0"
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.booksOverdue > 0 ? <Badge variant="destructive">{user.booksOverdue}</Badge> : "0"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewUserDetails(user)}
                                                            className="flex items-center"
                                                        >
                                                            <BookOpen className="h-4 w-4 mr-1" />
                                                            Details
                                                        </Button>
                                                        {user.role !== "admin" && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-purple-500 border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                                                                    >
                                                                        <Shield className="h-4 w-4 mr-1" />
                                                                        Make Admin
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to promote {user.username} to admin? This will give them full
                                                                            access to all admin features.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handlePromoteToAdmin(user.id)}
                                                                            disabled={isPromoting}
                                                                        >
                                                                            {isPromoting ? "Promoting..." : "Promote"}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
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
                            <CardTitle>No Users Found</CardTitle>
                            <CardDescription>
                                {searchQuery ? "No users match your search criteria." : "There are no users in the system."}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </main>

            {selectedUser && (
                <UserDetailsDialog
                    user={selectedUser}
                    open={showUserDetailsDialog}
                    onOpenChange={setShowUserDetailsDialog}
                />
            )}
        </div>
    )
}
