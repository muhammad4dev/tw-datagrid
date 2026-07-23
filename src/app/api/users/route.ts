import { NextResponse } from "next/server"

import { getUsers, parseLocale } from "@/lib/users-data"

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = parseLocale(searchParams.get("locale"))
  const users = getUsers(locale)
  return NextResponse.json(users)
}
