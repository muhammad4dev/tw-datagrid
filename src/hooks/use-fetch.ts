"use client"

import { useEffect, useEffectEvent, useState } from "react"

/**
 * Options for {@link useFetch}.
 *
 * Extends the standard `RequestInit` passed to native `fetch`, and adds
 * hook-specific controls for conditional fetching and response parsing.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/RequestInit
 */
export type UseFetchOptions = RequestInit & {
  /**
   * When `false`, skips the request even if `url` is set.
   * @default true
   */
  enabled?: boolean
  /**
   * When `true`, parses the body with `response.json()` as `T`.
   * When `false`, reads the body with `response.text()` and casts to `T`.
   * @default true
   */
  parseJson?: boolean
}

/**
 * Return value of {@link useFetch}.
 *
 * @typeParam T - Shape of the parsed response body.
 */
export type UseFetchResult<T> = {
  /** Last successful response body, or `null` before the first success / after a URL change. */
  data: T | null
  /** Last failure, or `null` when there is no error. */
  error: Error | null
  /**
   * `true` only while the request is in the initial-load pending state
   * (typically when there is no `data` yet). Stays `false` during refetch
   * when previous `data` is kept on screen.
   */
  isLoading: boolean
  /** Re-run the request for the current `url`. */
  refetch: () => void
}

/**
 * Internal request lifecycle used to derive {@link UseFetchResult.isLoading}.
 *
 * - `idle` — fetch skipped (`url` is `null` or `enabled` is `false`)
 * - `pending` — in-flight load that should show loading UI
 * - `success` — last request completed OK
 * - `error` — last request failed
 */
type Status = "idle" | "pending" | "success" | "error"

/**
 * Client hook that loads data with native `fetch`.
 *
 * Manages loading/error state, aborts in-flight requests on unmount or input
 * change, and exposes {@link UseFetchResult.refetch}. Pass `url: null` or
 * `enabled: false` to skip the request.
 *
 * @typeParam T - Expected type of the parsed response body.
 * @param url - Request URL, or `null` to skip fetching.
 * @param options - `RequestInit` plus {@link UseFetchOptions.enabled} /
 *   {@link UseFetchOptions.parseJson}. Caller `signal` is ignored; the hook
 *   owns abort. Inline option objects are safe (read via an Effect Event).
 * @returns {@link UseFetchResult} with `data`, `error`, `isLoading`, and `refetch`.
 *
 * @example
 * ```tsx
 * const { data, error, isLoading, refetch } = useFetch<User[]>("/api/users")
 * ```
 *
 * @see ./use-fetch.md for full documentation.
 */
export function useFetch<T>(
  url: string | null,
  options?: UseFetchOptions
): UseFetchResult<T> {
  const enabled = options?.enabled ?? true
  const shouldFetch = Boolean(url && enabled)

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<Status>(shouldFetch ? "pending" : "idle")
  const [refetchIndex, setRefetchIndex] = useState(0)

  const [prevUrl, setPrevUrl] = useState(url)
  const [prevEnabled, setPrevEnabled] = useState(enabled)
  const [prevRefetchIndex, setPrevRefetchIndex] = useState(refetchIndex)

  // Adjust state when inputs change (avoids sync setState in effects)
  if (url !== prevUrl || enabled !== prevEnabled) {
    setPrevUrl(url)
    setPrevEnabled(enabled)
    setData(null)
    setError(null)
    setStatus(shouldFetch ? "pending" : "idle")
  } else if (refetchIndex !== prevRefetchIndex) {
    setPrevRefetchIndex(refetchIndex)
    setError(null)
    // Initial-load style loading only when there is no data yet
    if (data === null) {
      setStatus("pending")
    }
  }

  /** Latest options for the effect without putting `options` in the dep array. */
  const readOptions = useEffectEvent(() => {
    const {
      enabled: _enabled,
      parseJson = true,
      signal: _signal,
      ...init
    } = options ?? {}
    void _enabled
    void _signal
    return { parseJson, init }
  })

  useEffect(() => {
    if (!url || !enabled) return

    const requestUrl = url
    const controller = new AbortController()
    let cancelled = false

    async function run() {
      const { parseJson, init } = readOptions()

      try {
        const response = await fetch(requestUrl, {
          ...init,
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = (parseJson
          ? await response.json()
          : await response.text()) as T

        if (!cancelled) {
          setData(result)
          setError(null)
          setStatus("success")
        }
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setStatus("error")
      }
    }

    void run()

    return () => {
      cancelled = true
      controller.abort()
    }
    // readOptions is an Effect Event — intentionally omitted from deps
  }, [url, enabled, refetchIndex])

  function refetch() {
    setRefetchIndex((i) => i + 1)
  }

  return {
    data,
    error,
    isLoading: status === "pending",
    refetch,
  }
}
