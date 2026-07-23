"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { startTransition, useEffect } from "react"

import { Button } from "@/components/ui/button"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: Props) {
  const t = useTranslations("Error")
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
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            {t("digest", { digest: error.digest })}
          </p>
        ) : null}
        <div>
          <Button type="button" onClick={handleRetry}>
            {t("retry")}
          </Button>
        </div>
      </main>
    </div>
  )
}
