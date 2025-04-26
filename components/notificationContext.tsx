"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface NotificationContextProps {
  count: number
  setCount: (count: number) => void
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0)

  return (
    <NotificationContext.Provider value={{ count, setCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error("useNotification must be used within NotificationProvider")
  return context
}
