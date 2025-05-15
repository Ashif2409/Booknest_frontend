import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
