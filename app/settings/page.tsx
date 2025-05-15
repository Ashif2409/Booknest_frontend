"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { LogOut, Shield, Moon, Bell } from "lucide-react"
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

export default function SettingsPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  })
  const [notifications, setNotifications] = useState(true)

  const handleLogoutAllDevices = async () => {
    setIsLoggingOut(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/logout/alldevice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        toast({
          title: "Logged Out",
          description: "You have been logged out from all devices.",
        })
        window.location.href = "/login"
      } else {
        throw new Error("Failed to logout from all devices")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout from all devices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark")
      setDarkMode(!darkMode)

      // Save preference to localStorage
      localStorage.setItem("theme", !darkMode ? "dark" : "light")

      toast({
        title: !darkMode ? "Dark Mode Enabled" : "Light Mode Enabled",
        description: `The application theme has been changed to ${!darkMode ? "dark" : "light"} mode.`,
      })
    }
  }

  const toggleNotifications = () => {
    setNotifications(!notifications)
    toast({
      title: !notifications ? "Notifications Enabled" : "Notifications Disabled",
      description: `You will ${!notifications ? "now" : "no longer"} receive notifications.`,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout from All Devices
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will log you out from all devices where you are currently logged in, including this one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogoutAllDevices} disabled={isLoggingOut}>
                      {isLoggingOut ? "Logging out..." : "Continue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <Label htmlFor="notifications">Enable Notifications</Label>
                </div>
                <Switch id="notifications" checked={notifications} onCheckedChange={toggleNotifications} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
