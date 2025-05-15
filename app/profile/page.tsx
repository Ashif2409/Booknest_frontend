"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data)
          profileForm.reset({
            name: data.name || "",
          })
        } else {
          throw new Error("Failed to fetch user profile")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [profileForm])

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/editProfile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile")
      }

      setUser(result)

      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      localStorage.setItem("user", JSON.stringify({ ...storedUser, name: data.name }))

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/editPassword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update password")
      }

      passwordForm.reset()

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setIsUpdatingAvatar(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const formData = new FormData()
      formData.append("Avatar", e.target.files[0])

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/editProfilePic`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile picture")
      }

      setUser((prevUser: any) => ({
        ...prevUser,
        avatar: result.avatar,
      }))

      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      localStorage.setItem("user", JSON.stringify({ ...storedUser, avatar: result.profile }))

      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={user?.profile || "/placeholder.svg?height=128&width=128"} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Role: {user?.role === "admin" ? "Administrator" : "User"}
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUpdatingAvatar}>
                    {isUpdatingAvatar ? "Updating..." : "Change Picture"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center gap-2">
                          <Label htmlFor="username" className="w-32">
                            Username
                          </Label>
                          <Input id="username" value={user?.username || ""} disabled className="flex-1" />
                        </div>

                        <div className="flex items-center gap-2">
                          <Label htmlFor="email" className="w-32">
                            Email
                          </Label>
                          <Input id="email" value={user?.email || ""} disabled className="flex-1" />
                        </div>

                        <Button type="submit" disabled={isUpdatingProfile}>
                          {isUpdatingProfile ? "Updating..." : "Update Profile"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="password">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="oldPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" disabled={isUpdatingPassword}>
                          {isUpdatingPassword ? "Updating..." : "Change Password"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
