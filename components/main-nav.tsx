"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Home,
  BookText,
  Bell,
  User,
  LogOut,
  Menu,
  Settings,
  Users,
  BarChart,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

interface MainNavProps {
  isAdmin?: boolean
}

export function MainNav({ isAdmin = false }: MainNavProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [user, setUser] = useState<any>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const token = localStorage.getItem("token")
    if (!token) return

    // Fetch notification count
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setNotificationCount(data.length || 0)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    // Fetch request count for admin
    const fetchRequestCount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/getReqBooks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setRequestCount(data.length || 0)
        }
      } catch (error) {
        console.error("Failed to fetch admin requests:", error)
      }
    }

    fetchNotifications()
    if (isAdmin) {
      fetchRequestCount()
    }
  }, [isAdmin])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  const userNavItems = [
    {
      title: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Admin",
      href: "/admin/books",
      icon: BookText,
    },
    {
      title: "My Books",
      href: "/my-books",
      icon: BookOpen,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: notificationCount > 0,
      badgeCount: notificationCount,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart,
    },
    {
      title: "Books",
      href: "/admin/books",
      icon: BookText,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Requests",
      href: "/admin/requests",
      icon: BookOpen,
      badge: requestCount > 0,
      badgeCount: requestCount,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems
  const handleHomePage = () => {
      window.location.href = "/dashboard"
  }
  const renderNavItems = () => (
    <ul className="flex flex-col lg:flex-row gap-1 lg:gap-2">
      {navItems.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
            )}
            onClick={() => setIsOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="destructive" className="ml-auto">
                {item.badgeCount}
              </Badge>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4 cursor-pointer" onClick={handleHomePage}>
          <BookOpen className="h-6 w-6 text-emerald-600" />
          <span className="font-bold text-lg">BookNest</span>
        </div>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 py-4">
                  <BookOpen className="h-6 w-6 text-emerald-600" />
                  <span className="font-bold text-lg">BookNest</span>
                </div>
                <nav className="flex-1 py-4">{renderNavItems()}</nav>
                <div className="py-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden lg:block">
            {renderNavItems()}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!isMobile && notificationCount > 0 && (
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                >
                  {notificationCount}
                </Badge>
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-xs leading-none text-slate-500">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
