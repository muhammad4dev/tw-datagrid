import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "DataGrid",
  description: "MUI-like data grid demo with AR/EN locales",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
