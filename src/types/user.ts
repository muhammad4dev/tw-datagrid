export type { Locale } from "next-intl"

export type UserStatus = "active" | "invited" | "disabled"

export type Order = {
  id: string
  product: string
  total: number
}

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  notes: string
  orders: Order[]
}
