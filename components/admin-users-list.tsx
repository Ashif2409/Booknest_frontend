"user client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Search, Shield } from "lucide-react"
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

export function AdminUsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isPromoting, setIsPromoting] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch users")

        const data = await response.json()

        const formattedUsers = data.users.map((user: any) => ({
          ...user,
          booksIssued: user.bookBorrow?.length || 0,
          booksOverdue: user.bookBorrow?.filter((b: any) => !b.returned || !b.verifyReturn).length || 0,
        }))

        setUsers(formattedUsers)
        setFilteredUsers(formattedUsers)
      } catch (err) {
        console.error("Fetch error:", err)
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const handlePromoteToAdmin = async () => {
    if (!selectedUser) return
    setIsPromoting(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/approveAdmin/${selectedUser._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setUsers(prev =>
          prev.map(user =>
            user._id === selectedUser._id ? { ...user, role: "Admin" } : user
          )
        )
        toast({
          title: "User Promoted",
          description: `${selectedUser.username} is now an Admin.`,
        })
      } else {
        throw new Error("Promotion failed")
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to promote user.",
        variant: "destructive",
      })
    } finally {
      setIsPromoting(false)
      setSelectedUser(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage library users</CardDescription>
      </CardHeader>
      <CardContent>
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
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Books Issued</th>
                  <th className="py-3 px-4 text-left">Books Overdue</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.role === "Admin" ? (
                        <Badge className="bg-purple-500">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">{user.bookBorrow?.length || 0}</td>
                    <td className="py-3 px-4">
                      {user.booksOverdue > 0 ? (
                        <Badge variant="destructive">{user.booksOverdue}</Badge>
                      ) : "0"}
                    </td>
                    <td className="py-3 px-4">
                      {user.role !== "Admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                              <Shield className="h-4 w-4 mr-1" />
                              Make Admin
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to promote {user.username} to Admin?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handlePromoteToAdmin} disabled={isPromoting}>
                                {isPromoting ? "Promoting..." : "Promote"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery
                ? "No users found matching your search."
                : "No users available."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
