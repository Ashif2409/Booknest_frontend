import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/components/notificationContext" 
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Library Management System",
  description: "A modern library management system",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotificationProvider> 
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
