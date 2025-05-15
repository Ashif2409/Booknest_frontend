"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { useNotification } from "@/components/notificationContext"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setCount } = useNotification()

  // Automatically update count when notifications change
  useEffect(() => {
    setCount(notifications.length)
  }, [notifications, setCount])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setNotifications(data || [])
          // Removed setCount(data.length) here
        } else {
          throw new Error("Failed to fetch notifications")
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load your notifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleDeleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id)) // Removed setCount here
        toast({
          title: "Notification Deleted",
          description: "The notification has been deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete notification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-24" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              console.log(notification),
              <Card key={notification._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{notification.text}</CardTitle>
                </CardHeader>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(notification.time)}</p>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNotification(notification._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Notifications</h2>
            <p className="text-slate-600 dark:text-slate-400">You don't have any notifications at the moment.</p>
          </div>
        )}
      </main>
    </div>
  )
}
