"use client"

import { startTransition, useEffect } from "react"
import { useRouter } from "next/navigation"

import "./globals.css"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Catches errors in the root layout. Must define its own html/body.
 * Kept English-only because the locale provider may be unavailable.
 */
export default function GlobalError({ error, reset }: Props) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  function handleRetry() {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <html lang="en">
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-16">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. You can try again.
          </p>
          {error.digest ? (
            <p className="font-mono text-xs text-muted-foreground">
              Error id: {error.digest}
            </p>
          ) : null}
          <div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex h-9 items-center justify-center rounded-4xl bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
